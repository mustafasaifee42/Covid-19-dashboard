import React,{ useState, useEffect} from 'react';
import * as d3 from 'd3';
import Map from  './map';
import './App.css';
import './tooltip.css';
import Sidebar from './Sidebar'
import SidebarRight from './SidebarRight'
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

const Visualization: React.FunctionComponent<{}> = (props) => {
  const [data, setData] = useState<any>(undefined)
  const [country, setCountry] = useState('World')
  const [selectedCountry, setSelectedCountry] = useState('World')
  const [index, setIndex] = useState(0)
  let indexToUpdate = 1;
  const [selectedKey, setSelectedKey] = useState<[string,number]>(['value',100000])
  useEffect(() => {
    Promise.all([
        d3.csv("/data/time_series_19-covid-Confirmed.csv"),
        d3.csv("/data/time_series_19-covid-Deaths.csv"),
        d3.csv("/data/time_series_19-covid-Recovered.csv")
      ])
      .then(([confirmed,death , recovered]) => {
        let confirmedDataCombined = dataManipulation(confirmed);
        let deathDataCombined = dataManipulation(death);
        let recoveredDataCombined = dataManipulation(recovered);
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
        recoveredDataCombined.forEach((d:any) => {
          let values:any = []
          keys.forEach((key:string) => {
            values.push({"date":d3.timeParse("%m/%d/%y")(key),'value':d[key]})
          })
          combinedDataObj[d['Country/Region']]['recoveryData'] = values
        })
        let counntryList = Object.keys(combinedDataObj)
        counntryList.forEach((country:string) => {
          let index = populationData.findIndex((obj:any) => obj.Country === country)
          if(index >= 0) combinedDataObj[country]['Population'] = populationData[index]['Population']
          combinedDataObj[country]['confirmedData'].forEach((d:any,i:number) => {
            d['valuePer1000'] = +(d['value'] * 100000 / combinedDataObj[country]['Population'])
            d['new'] = i === 0 ? d['value'] : (d['value'] - combinedDataObj[country]['confirmedData'][i-1]['value'] < 0 ) ? 0 : d['value'] - combinedDataObj[country]['confirmedData'][i-1]['value']
          })
          combinedDataObj[country]['deathData'].forEach((d:any,i:number) => {
            d['valuePer1000'] = +(d['value'] * 100000 / combinedDataObj[country]['Population'])
            d['new'] = i === 0 ? d['value'] : (d['value'] - combinedDataObj[country]['deathData'][i-1]['value'] < 0 ) ? 0 : d['value'] - combinedDataObj[country]['deathData'][i-1]['value']
          })
          combinedDataObj[country]['recoveryData'].forEach((d:any,i:number) => {
            d['new'] = i === 0 ? d['value'] : (d['value'] - combinedDataObj[country]['recoveryData'][i-1]['value'] < 0 ) ? 0 : d['value'] - combinedDataObj[country]['recoveryData'][i-1]['value']
          })
        })
        setIndex(combinedDataObj[Object.keys(combinedDataObj)[0]]['confirmedData'].length)

        setData(combinedDataObj)

      })
  },[])
  if(!data){
    return null
  }
  else{
    return ( 
      <div>
        <div className='tooltip'>
          <div className='tooltipCountry'>Country</div>
          <div className='tooltipConfirmedTitle'>Confirmed Cases: <span className='tooltipConfirmed'>0</span></div>
          <div className='tooltipDeathTitle'>Deaths:<span className='tooltipDeath'>0</span></div>
        </div>
        {window.innerWidth > 1440 ? (
          <div  className='viz-area'>
            <div style={{'flex':`0 0 320px`, "height":'calc(100vh - 40px)','borderRight':'1px solid #f1f1f1','backgroundColor':'#fafafa', 'padding':'0 10px','overflow':'auto','overflowX':'hidden'}}>
              <Sidebar
                width={320}
                height={window.innerHeight}
                graphHeight={200}
                data={data}
                country={country}

              />
            </div>
            <Map
              width={window.innerWidth - 810}
              height={window.innerHeight - 60}
              scale={409 * (window.innerWidth - 780) / 2048}
              translate={[0.41 * (window.innerWidth - 780), 0.46 * (window.innerHeight - 20)]}
              data={data}
              country={country}
              selectedKey={selectedKey}
              index={index}
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
                } , 500)
                function stopReplay(){
                  indexToUpdate = 1
                  clearInterval(replay)
                }
              }}
            />
            <div style={{'flex':`0 0 430px`, "height":'calc(100vh - 50px)','borderRight':'1px solid #f1f1f1','backgroundColor':'#fafafa', 'padding':'10px 10px 0 10px','overflow':'auto','overflowX':'hidden'}}>
              <SidebarRight
                width={430}
                height={window.innerHeight}
                graphHeight={200}
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
              />
            </div>
          </div>
        ) : (
          <div  className='viz-area'>
            <div style={{'flex':`0 0 430px`, "height":'calc(100vh - 40px)','borderRight':'1px solid #f1f1f1','backgroundColor':'#fafafa', 'padding':'0 10px','overflow':'auto','overflowX':'hidden'}}>
              <Sidebar
                width={420}
                height={window.innerHeight}
                graphHeight={200}
                data={data}
                country={country}

              />
              <SidebarRight
                width={430}
                height={window.innerHeight}
                graphHeight={200}
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
              />
            </div>
            <Map
              width={window.innerWidth - 810 + 320}
              height={window.innerHeight - 60}
              scale={409 * (window.innerWidth - 780 + 320) / 2048}
              translate={[0.41 * (window.innerWidth - 780 + 320), 0.46 * (window.innerHeight - 20)]}
              data={data}
              country={country}
              selectedKey={selectedKey}
              index={index}
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
                } , 500)
                function stopReplay(){
                  indexToUpdate = 1
                  clearInterval(replay)
                }
              }}
            />
          </div>
        )}
      </div>
    )
  }
}

export default Visualization