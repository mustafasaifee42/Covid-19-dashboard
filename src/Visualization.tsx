import React,{ useState, useEffect} from 'react';
import * as d3 from 'd3';
import Map from  './map';
import 'whatwg-fetch'; 
import './App.css';
import './tooltip.css';
import Sidebar from './Sidebar';
import SidebarRight from './SidebarRight';
import TableView from './TableView';
import Button from "./Button";
const populationData:any = require('./population.json');
const centroid:any = require('./centroidData.json');

const dataManipulation = (confirmed:any) =>{
  
  let dataByCountries = d3.nest()
    .key((d:{'Country/Region':string}) => d['Country/Region'])
    .entries(confirmed);
  let keys = Object.keys(dataByCountries[0].values[0]).slice(4)
  let dataCombined = dataByCountries.map((d:any) => {
    let obj:any = { "Province/State": "" ,"Country/Region": d.values[0]['Country/Region'],"Lat": "","Long": ""}
    keys.forEach((key:string) => {
      obj[key] = 0
      d.values.forEach((el:any) => {
        obj[key] = obj[key] + parseInt(el[key],10)
      })
    })
    return obj
  })
  let worldObj:any = { "Province/State": "" ,"Country/Region": 'World',"Lat": "","Long": ""}
  keys.forEach((key:string) => {
    worldObj[key] = d3.sum(dataCombined, (d:any) => d[key])
  })
  dataCombined.push(worldObj)
  return dataCombined
}

const Visualization: React.FunctionComponent<{width:number,height:number}> = (props) => {
  const [data, setData] = useState<any>(undefined)
  const [dataArr, setDataArr] = useState<any>(undefined)
  const [country, setCountry] = useState('World')
  const [caseType, setCaseType] = useState('confirmedData')
  const [selectedCountry, setSelectedCountry] = useState('World')
  const [index, setIndex] = useState(0)
  const [sortedBigTable, setSortedBigTable] = useState('Confirmed Cases')
  const [value, setValue] = useState('value')
  const [highlightNew, setHighlightNew] = useState(false)
  const [deathVisibility, setDeathVisibility] = useState(0)
  const [visualizationType, setVisualizationType] = useState('map')
  const [countryCount, setCountryCount] = useState([0])
  let indexToUpdate = 1;
  useEffect(() => {
    Promise.all([
        d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"),
        d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"),
        d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv")
      ])
      .then(([confirmed,death,recovered]) => {
        
        let confirmedDataCombined = dataManipulation(confirmed);
        let deathDataCombined = dataManipulation(death);
        let recoveryDataCombined = dataManipulation(recovered);
        let combinedDataObj:any = {};
        let keys = Object.keys(confirmedDataCombined[0]).slice(4)
        let keyDeath= Object.keys(deathDataCombined[0]).slice(4)
        let keyRecovery= Object.keys(recoveryDataCombined[0]).slice(4)
        let countryCount = keys.map((key:string) =>  [...confirmedDataCombined].filter((d:any) => d[key] > 0 && d['Country/Region'] !== 'World' && d['Country/Region'] !=='Diamond Princess' && d['Country/Region'] !=='MS Zaandam').length)
        setCountryCount(countryCount)

        confirmedDataCombined.forEach((d:any) => {
          let values:any = []
          keys.forEach((key:string) => {
            let dt = key
            if(d3.timeParse("%m/%d/%y")(key) === null || d3.timeParse("%m/%d/%y")(key) === undefined) {
              console.warn(`Error in date format for ${key}`)
            }
            values.push({"date":d3.timeParse("%m/%d/%y")(dt),'value':d[key]})
          })
          combinedDataObj[d['Country/Region']] =  {}
          combinedDataObj[d['Country/Region']]['confirmedData'] = values
        })
        deathDataCombined.forEach((d:any) => {
          let values:any = []
          keyDeath.forEach((key:string) => {
            let dt = key
            if(d3.timeParse("%m/%d/%y")(key) === null || d3.timeParse("%m/%d/%y")(key) === undefined) {
              console.warn(`Error in date format for ${key}`)
            }
            values.push({"date":d3.timeParse("%m/%d/%y")(dt),'value':d[key]})
          })
          combinedDataObj[d['Country/Region']]['deathData'] = values
        })
        recoveryDataCombined.forEach((d:any) => {
          let values:any = []
          keyRecovery.forEach((key:string) => {
            let dt = key
            if(d3.timeParse("%m/%d/%y")(key) === null || d3.timeParse("%m/%d/%y")(key) === undefined) {
              console.warn(`Error in date format for ${key}`)
            }
            values.push({"date":d3.timeParse("%m/%d/%y")(dt),'value':d[key]})
          })
          combinedDataObj[d['Country/Region']]['recoveryData'] = values
        })
        let countryList = Object.keys(combinedDataObj)
        countryList.forEach((country:string) => {
          let index = populationData.findIndex((obj:any) => obj.Country === country)
          if(index >= 0) combinedDataObj[country]['Population'] = populationData[index]['Population']
          combinedDataObj[country]['confirmedData'].forEach((d:any,i:number) => {
            d['valuePer100K'] = +(d['value'] * 100000 / combinedDataObj[country]['Population'])
            d['new'] = i === 0 ? d['value'] : (d['value'] - combinedDataObj[country]['confirmedData'][i-1]['value'] < 0 ) ? 0 : d['value'] - combinedDataObj[country]['confirmedData'][i-1]['value']
          })
          if(combinedDataObj[country]['deathData']){
            combinedDataObj[country]['deathData'].forEach((d:any,i:number) => {
              d['valuePer100K'] = +(d['value'] * 100000 / combinedDataObj[country]['Population'])
              d['new'] = i === 0 ? d['value'] : (d['value'] - combinedDataObj[country]['deathData'][i-1]['value'] < 0 ) ? 0 : d['value'] - combinedDataObj[country]['deathData'][i-1]['value']
            })
          }
          else {
            let objCombined = combinedDataObj[countryList[0]]['deathData'].map((el:any,i:number) => {
              return {date:el.date, value:0 , valuePer100K:0, new:0} 
            })
            combinedDataObj[country]['deathData'] = objCombined
          }
          if(combinedDataObj[country]['recoveryData']){
            combinedDataObj[country]['recoveryData'].forEach((d:any,i:number) => {
              d['valuePer100K'] = +(d['value'] * 100000 / combinedDataObj[country]['Population'])
              d['new'] = i === 0 ? d['value'] : (d['value'] - combinedDataObj[country]['recoveryData'][i-1]['value'] < 0 ) ? 0 : d['value'] - combinedDataObj[country]['recoveryData'][i-1]['value']
            })
          }
          else {
            let objCombined = combinedDataObj[countryList[0]]['recoveryData'].map((el:any,i:number) => {
              return {date:el.date, value:0 , valuePer100K:0, new:0} 
            })
            combinedDataObj[country]['recoveryData'] = objCombined
          }
          combinedDataObj[country]['activeData'] = []
          combinedDataObj[country]['confirmedData'].forEach((d:any,i:number) => {
            combinedDataObj[country]['activeData'].push({"date":d.date,'value':d.value - combinedDataObj[country]['deathData'][i]['value'] - combinedDataObj[country]['recoveryData'][i]['value'], 'valuePer100K': d.valuePer100K - combinedDataObj[country]['deathData'][i]['valuePer100K'] - combinedDataObj[country]['recoveryData'][i]['valuePer100K'] })
          })
          let doublingTime = 0;
          let confirmedDataFiltered = [...combinedDataObj[country]['confirmedData']].filter((d:any, i:number) => d.value >= 100)
          if(confirmedDataFiltered.length > 1){
            let rate = (Math.pow(confirmedDataFiltered[confirmedDataFiltered.length - 1].value / confirmedDataFiltered[0].value , 1 / (confirmedDataFiltered.length - 1)) - 1) * 100
            doublingTime = parseFloat((69 / rate).toFixed(1))
          }
          let date = [...combinedDataObj[country]['confirmedData']].filter((d:any, i:number) => d.value >= 1)[0].date
          combinedDataObj[country]['latestData'] = {
            'Confirmed Cases':combinedDataObj[country]['confirmedData'][combinedDataObj[country]['confirmedData'].length - 1]['value'],
            'Confirmed Cases Per 100K':combinedDataObj[country]['confirmedData'][combinedDataObj[country]['confirmedData'].length - 1]['valuePer100K'],
            'Confirmed Cases last 24hrs.':combinedDataObj[country]['confirmedData'][combinedDataObj[country]['confirmedData'].length - 1]['new'],
            'Confirmed Cases Percent Change':parseFloat((combinedDataObj[country]['confirmedData'][combinedDataObj[country]['confirmedData'].length - 1]['new'] * 100 / combinedDataObj[country]['confirmedData'][combinedDataObj[country]['confirmedData'].length - 2]['value']).toFixed(1)),
            'Total Deaths':combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 1]['value'],
            'Deaths Per 100K':combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 1]['valuePer100K'],
            'Deaths last 24hrs.':combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 1]['new'],
            'Deaths Percent Change':parseFloat((combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 1]['new'] * 100 / combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 2]['value']).toFixed(1)),
            'Mortality Rate':parseFloat((combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 1]['value'] * 100 / combinedDataObj[country]['confirmedData'][combinedDataObj[country]['confirmedData'].length - 1]['value']).toFixed(1)),
            'Recovered Cases':combinedDataObj[country]['recoveryData'][combinedDataObj[country]['recoveryData'].length - 1]['value'],
            'Recovery Per 100K':combinedDataObj[country]['recoveryData'][combinedDataObj[country]['recoveryData'].length - 1]['valuePer100K'],
            'Recovery Rate':parseFloat((combinedDataObj[country]['recoveryData'][combinedDataObj[country]['recoveryData'].length - 1]['value'] * 100 / combinedDataObj[country]['confirmedData'][combinedDataObj[country]['confirmedData'].length - 1]['value']).toFixed(1)),
            'Doubling Time':doublingTime,
            'Date when it started':date,
          }
        })
        setIndex(combinedDataObj[Object.keys(combinedDataObj)[0]]['confirmedData'].length)
        
        let dataArr:any = Object.keys(combinedDataObj).map((key:string) => {
          return ({'countryName': key, 'confirmed':combinedDataObj[key]['confirmedData'][combinedDataObj[key]['confirmedData'].length - 1]['value'], 'death':combinedDataObj[key]['deathData'][combinedDataObj[key]['deathData'].length - 1]['value'],'centroid':centroid[key]})
        })
        dataArr.sort((x:any, y:any) => d3.descending(x['confirmed'], y['confirmed']))
        setDataArr(dataArr.filter((d:any) => Object.keys(centroid).indexOf(d.countryName) !== -1))
        console.log(combinedDataObj)
        setData(combinedDataObj)
      })
  },[])
  if(!data || !dataArr){
    return null
  }
  else{
    let sidebarRightWidth = 430, rightGraphHeight = 320
    if(props.width > 1420 && props.width < 1600) { sidebarRightWidth = 320 ; rightGraphHeight = 240 }
    let sidebarLeftWidth = 430
    if(props.width < 1180) sidebarLeftWidth = 320
    return ( 
      <div>
        <div className='tooltip'>
          <div className='tooltipCountryContainer'><span className='tooltipCountry'>Country</span><span className='tooltipSubnote'> Click to see details</span></div>
          <div className='tooltipConfirmedTitle'>Confirmed Cases: <span className='tooltipConfirmed'>0</span></div>
          <div className='tooltipDeathTitle'>Deaths: <span className='tooltipDeath'>0</span></div>
          <div className='tooltipLast24Hrs'>Last 24 Hrs.: <span className='tooltipcases24 red bold'>0</span> new cases and <span className='tooltipdeaths24 bold'>0</span> deaths</div>
        </div>
        <div className='barGraphtooltip'>
          <span className='tooltipDate'>Country</span>: <span className='tooltipCases bold'>0</span>
        </div>
        {props.width > 1420 ? (
          <div  className='viz-area'>
            <div style={{'flex':`0 0 320px`, "height":'calc(100vh - 90px)','borderRight':'1px solid #f1f1f1','backgroundColor':'#fafafa', 'padding':'0 10px','overflow':'auto','overflowX':'hidden'}}>
              <Sidebar
                width={320}
                height={props.height}
                graphHeight={200}
                data={data}
                country={country}
              />
            </div>
            <div>
            {
              visualizationType === 'map' ?
              <Map
                width={props.width - 360 - sidebarRightWidth}
                height={props.height - 90}
                data={data}
                dataArr={dataArr}
                windowWidth = {props.width}
                countryCount={countryCount}
                country={country}
                index={index}
                highlightNew={highlightNew}
                value={value}
                deathVisibility = {deathVisibility}
                caseType={caseType}
                changeCaseType = {(e:string) => { setCaseType(e) }}
                toggleDeathVisibility = {(e) => { setDeathVisibility(e) } }
                onValueToggle = {(e) => {setValue(e)} }
                highlightNewClick = {(e) => {setHighlightNew(e)}}   
                onCountryClick={(country) => { setSelectedCountry(country); setCountry(country) }}
                countryClicked ={selectedCountry}
                hover={(e:string) => {
                  setCountry(e)
                }}
                replay={()=> {
                  let replay  = setInterval(() => {
                    if(indexToUpdate  === data[Object.keys(data)[0]]['confirmedData'].length){
                      stopReplay();  
                      setIndex(data[Object.keys(data)[0]]['confirmedData'].length)
                    }
                    else {
                      indexToUpdate++;
                      setIndex(indexToUpdate);
                    }
                  } , 200)
                  function stopReplay(){
                    indexToUpdate = 1
                    clearInterval(replay)
                  }
                }}
              /> : 
                <TableView 
                  width={props.width - 360 - sidebarRightWidth}
                  click={(country) => {
                    setSelectedCountry(country)
                    setCountry(country)            
                  }}
                  data={data}
                  hover={(country) => {
                    setCountry(country)            
                  }}
                  sorted={sortedBigTable}
                  selectedCountry={selectedCountry}
                  sortClick={ (d) => {setSortedBigTable(d)} }
                />
              }
                <div className='tabs'> 
                  <Button 
                    aria-pressed={visualizationType === 'map' ?  true : false}
                    className={visualizationType === 'map' ? "vizSelectionButtonSelected bottomTab" : "bottomTab"}
                    onClick={() => { 
                        if(visualizationType !== 'map'){
                          setCountry('World');
                          setSelectedCountry('World');
                          setVisualizationType('map')
                        }
                      }
                    }
                  >
                    Map
                  </Button>
                  <Button 
                    aria-pressed={visualizationType === 'table' ?  true : false}
                    className={visualizationType === 'table' ? "vizSelectionButtonSelected bottomTab" : "bottomTab"}
                    onClick={() => { 
                        if(visualizationType !== 'table'){
                          setCountry('World')
                          setCountry('World')
                          setVisualizationType('table')
                        }
                      }
                    }
                  >
                    Table
                  </Button>

                </div>
              </div>
            <div style={{'flex':`0 0 ${sidebarRightWidth}px`, "height":'calc(100vh - 100px)','borderRight':'1px solid #f1f1f1','backgroundColor':'#fafafa', 'padding':'10px 10px 0 10px','overflow':'auto','overflowX':'hidden'}}>
              <SidebarRight
                width={sidebarRightWidth}
                height={props.height}
                graphHeight={rightGraphHeight}
                data={data}
                country={country}
                bigScreen={true}
              />
            </div>
          </div>
        ) : props.width > 1024 ? (
          <div  className='viz-area'>
            <div style={{'flex':`0 0 ${sidebarLeftWidth}px`, "height":'calc(100vh - 90px)','borderRight':'1px solid #f1f1f1','backgroundColor':'#fafafa', 'padding':'0 10px','overflow':'auto','overflowX':'hidden'}}>
              <Sidebar
                width={sidebarLeftWidth - 10}
                height={props.height}
                graphHeight={200}
                data={data}
                country={country}

              />
              <SidebarRight
                width={sidebarLeftWidth}
                height={props.height}
                graphHeight={320}
                data={data}
                bigScreen={false}
                country={country}
              />
            </div>
            <div className='rightSideMap'>
            {
              visualizationType === 'map' ?
                <Map
                  width={props.width - sidebarLeftWidth - 30 }
                  height={props.height - 90}
                  windowWidth = {props.width}
                  data={data}
                  dataArr={dataArr}
                  country={country}
                  index={index}
                  highlightNew={highlightNew}
                  countryCount={countryCount}
                  caseType={caseType}
                  changeCaseType = {(e:string) => { setCaseType(e) }}
                  value={value}
                  deathVisibility = {deathVisibility}
                  toggleDeathVisibility = {(e) => { setDeathVisibility(e) } }
                  onValueToggle = {(e) => {setValue(e)} }
                  highlightNewClick = {(e) => {setHighlightNew(e)}}
                  onCountryClick={(country) => { setSelectedCountry(country) }}
                  countryClicked ={selectedCountry}
                  hover={(e:string) => {setCountry(e)}}
                  replay={()=> {
                    let replay  = setInterval(() => {
                      if(indexToUpdate  === data[Object.keys(data)[0]]['confirmedData'].length){
                        stopReplay();  
                        setIndex(data[Object.keys(data)[0]]['confirmedData'].length)
                      }
                      else {
                        indexToUpdate++;
                        setIndex(indexToUpdate);
                      }
                    } , 200)
                    function stopReplay(){
                      indexToUpdate = 1
                      clearInterval(replay)
                    }
                  }}
                /> :
                
                <TableView 
                  click={(country) => {
                    setSelectedCountry(country)
                    setCountry(country)            
                  }}
                  data={data}
                  hover={(country) => {
                    setCountry(country)            
                  }}
                  sorted={sortedBigTable}
                  selectedCountry={selectedCountry}
                  sortClick={ (d) => {setSortedBigTable(d)} }
                />
              }
                <div className='tabs'> 
                  <Button 
                    aria-pressed={visualizationType === 'map' ?  true : false}
                    className={visualizationType === 'map' ? "vizSelectionButtonSelected bottomTab" : "bottomTab"}
                    onClick={() => { 
                        if(visualizationType !== 'map'){
                          setCountry('World')
                        }
                      }
                    }
                  >
                    Map
                  </Button>
                  <Button 
                    aria-pressed={visualizationType === 'table' ?  true : false}
                    className={visualizationType === 'table' ? "vizSelectionButtonSelected bottomTab" : "bottomTab"}
                    onClick={() => { 
                        if(visualizationType !== 'table'){
                          setCountry('World')
                        }
                      }
                    }
                  >
                    Table
                  </Button>

                </div>
              </div>
          </div>
        ) : (
          <div>
            <Map
              width={props.width - 20 }
              height={5 * (props.width - 20) / 4}
              data={data}
              dataArr={dataArr}
              windowWidth = {props.width}
              countryCount={countryCount}
              country={country}
              caseType={caseType}
              changeCaseType = {(e:string) => { setCaseType(e) }}
              deathVisibility = {deathVisibility}
              toggleDeathVisibility = {(e) => { setDeathVisibility(e) } }
              index={index}
              value={value}
              onValueToggle = {(e) => {setValue(e)} }
              highlightNew={highlightNew}
              highlightNewClick = {(e) => {setHighlightNew(e)}}
              onCountryClick={(country) => { setSelectedCountry(country) }}
              countryClicked ={selectedCountry}
              hover={(e:string) => {
                setCountry(e)
              }}
              replay={()=> {
                let replay  = setInterval(() => {
                  if(indexToUpdate  === data[Object.keys(data)[0]]['confirmedData'].length){
                    stopReplay();  
                    setIndex(data[Object.keys(data)[0]]['confirmedData'].length)
                  }
                  else {
                    indexToUpdate++;
                    setIndex(indexToUpdate);
                  }
                } , 200)
                function stopReplay(){
                  indexToUpdate = 1
                  clearInterval(replay)
                }
              }}
            />
            <div style={{'borderTop':'1px solid #f1f1f1','backgroundColor':'#fafafa', 'padding':'0 10px'}}>
              <Sidebar
                width={props.width - 30}
                height={props.height}
                graphHeight={320}
                data={data}
                country={country}

              />
              <SidebarRight
                width={props.width - 20}
                height={props.height}
                graphHeight={320}
                bigScreen={false}
                data={data}
                country={country}
              />
            </div>
          </div>
        )
      }
      </div>
    )
  }
}

export default Visualization