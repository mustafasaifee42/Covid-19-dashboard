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
  const [country, setCountry] = useState('World')
  const [selectedCountry, setSelectedCountry] = useState('World')
  const [index, setIndex] = useState(0)
  const [sorted, setSorted] = useState('confirmed')
  const [sortedBigTable, setSortedBigTable] = useState('Confirmed Cases')
  const [value, setValue] = useState('value')
  const [highlightNew, setHighlightNew] = useState(false)
  const [deathVisibility, setDeathVisibility] = useState(0)
  const [visualizationType, setVisualizationType] = useState('table')
  let indexToUpdate = 1;
  const [selectedKey, setSelectedKey] = useState<[string,number]>(['confirmedData',100000])
  useEffect(() => {
    Promise.all([
        d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"),
        d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv")
      ])
      .then(([confirmed,death]) => {
        let confirmedDataCombined = dataManipulation(confirmed);
        let deathDataCombined = dataManipulation(death);
        let combinedDataObj:any = {};
        let keys = Object.keys(confirmedDataCombined[0]).slice(4)
        confirmedDataCombined.forEach((d:any) => {
          let values:any = []
          keys.forEach((key:string) => {
            values.push({"date":d3.timeParse("%m/%d/%y")(key),'value':d[key]})
          })
          combinedDataObj[d['Country/Region']] =  {}
          combinedDataObj[d['Country/Region']]['confirmedData'] = values
        })
        deathDataCombined.forEach((d:any) => {
          let values:any = []
          keys.forEach((key:string) => {
            values.push({"date":d3.timeParse("%m/%d/%y")(key),'value':d[key]})
          })
          combinedDataObj[d['Country/Region']]['deathData'] = values
        })
        let counntryList = Object.keys(combinedDataObj)
        counntryList.forEach((country:string) => {
          let index = populationData.findIndex((obj:any) => obj.Country === country)
          if(index >= 0) combinedDataObj[country]['Population'] = populationData[index]['Population']
          combinedDataObj[country]['confirmedData'].forEach((d:any,i:number) => {
            d['valuePer100K'] = +(d['value'] * 100000 / combinedDataObj[country]['Population'])
            d['new'] = i === 0 ? d['value'] : (d['value'] - combinedDataObj[country]['confirmedData'][i-1]['value'] < 0 ) ? 0 : d['value'] - combinedDataObj[country]['confirmedData'][i-1]['value']
          })
          combinedDataObj[country]['deathData'].forEach((d:any,i:number) => {
            d['valuePer100K'] = +(d['value'] * 100000 / combinedDataObj[country]['Population'])
            d['new'] = i === 0 ? d['value'] : (d['value'] - combinedDataObj[country]['deathData'][i-1]['value'] < 0 ) ? 0 : d['value'] - combinedDataObj[country]['deathData'][i-1]['value']
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
            'Total Deaths':combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 1]['value'],
            'Deaths Per 100K':combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 1]['valuePer100K'],
            'Deaths last 24hrs.':combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 1]['new'],
            'Mortality Rate':parseFloat((combinedDataObj[country]['deathData'][combinedDataObj[country]['deathData'].length - 1]['value'] * 100 / combinedDataObj[country]['confirmedData'][combinedDataObj[country]['confirmedData'].length - 1]['value']).toFixed(1)),
            'Doubling Time':doublingTime,
            'Date when it started':date,
          }
        })
        setIndex(combinedDataObj[Object.keys(combinedDataObj)[0]]['confirmedData'].length)
        setData(combinedDataObj)
      })
  },[])
  if(!data){
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
                windowWidth = {props.width}
                country={country}
                selectedKey={selectedKey}
                index={index}
                highlightNew={highlightNew}
                value={value}
                deathVisibility = {deathVisibility}
                toggleDeathVisibility = {(e) => { setDeathVisibility(e) } }
                onValueToggle = {(e) => {setValue(e)} }
                highlightNewClick = {(e) => {setHighlightNew(e)}}
                onToggleClick={(value) => {
                  setSelectedKey(value) 
                }}
                onCountryClick={(country) => {
                  setSelectedCountry(country)
                  setCountry(country)            
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
                          setVisualizationType('map')
                          setSelectedCountry('World')
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
                          setVisualizationType('table')
                          setSelectedCountry('World')
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
                selectedCountry={selectedCountry}
                country={country}
                bigScreen={true}
                hover={(country) => {
                  setCountry(country)            
                }}
                click={(country) => {
                  setSelectedCountry(country)
                  setCountry(country)            
                }}
                sorted={sorted}
                sortClick={ (d) => {setSorted(d)} }
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
                selectedCountry={selectedCountry}
                country={country}
                hover={(country) => {
                  setCountry(country)            
                }}
                click={(country) => {
                  setSelectedCountry(country)
                  setCountry(country)            
                }}
                sorted={sorted}
                sortClick={ (d) => {setSorted(d)} }
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
                  country={country}
                  selectedKey={selectedKey}
                  index={index}
                  highlightNew={highlightNew}
                  value={value}
                  deathVisibility = {deathVisibility}
                  toggleDeathVisibility = {(e) => { setDeathVisibility(e) } }
                  onValueToggle = {(e) => {setValue(e)} }
                  highlightNewClick = {(e) => {setHighlightNew(e)}}
                  onToggleClick={(value) => {
                    setSelectedKey(value) 
                  }}
                  onCountryClick={(country) => {
                    setCountry(country)            
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
                          setVisualizationType('map')
                          setSelectedCountry('World')
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
                          setVisualizationType('table')
                          setSelectedCountry('World')
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
              windowWidth = {props.width}
              country={country}
              deathVisibility = {deathVisibility}
              toggleDeathVisibility = {(e) => { setDeathVisibility(e) } }
              selectedKey={selectedKey}
              index={index}
              value={value}
              onValueToggle = {(e) => {setValue(e)} }
              highlightNew={highlightNew}
              highlightNewClick = {(e) => {setHighlightNew(e)}}
              onToggleClick={(value) => {
                setSelectedKey(value) 
              }}
              onCountryClick={(country) => {
                setCountry(country)            
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
                selectedCountry={selectedCountry}
                country={country}
                hover={(country) => {
                  setCountry(country)            
                }}
                click={(country) => {
                  setSelectedCountry(country)
                  setCountry(country)            
                }}
                sorted={sorted}
                sortClick={ (d) => {setSorted(d)} }
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