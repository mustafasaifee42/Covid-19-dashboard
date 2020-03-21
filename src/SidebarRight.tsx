import React from 'react';
import * as d3 from 'd3';
import DataCards from './DataCards';
import './sidebarRight.css'

const Sidebar: React.FunctionComponent<{width:number , height:number, graphHeight:number, data:any ,country:string, sorted:string , sortClick:(e:string) => void, selectedCountry: string,click:(d:string) => void ,hover:(d:string) => void }> = (props) => {

  let dataArr:any = Object.keys(props.data).map((key:string) => {
    return ({'countryName': key, 'confirmed':props.data[key]['confirmedData'][props.data[key]['confirmedData'].length - 1]['value'], 'death':props.data[key]['deathData'][props.data[key]['deathData'].length - 1]['value'], 'recovery':props.data[key]['recoveryData'][props.data[key]['recoveryData'].length - 1]['value']})
  })
  dataArr.sort((x:any, y:any) => d3.descending(x[props.sorted], y[props.sorted]))
  if(props.sorted !== 'confirmed'){
    dataArr.sort((x:any, y:any) => d3.descending(x[props.sorted] * 100 / x.confirmed, y[props.sorted] * 100 / y.confirmed))
  }

  let tableRow = dataArr.map((d:any, i:number) => {
    let country = d.countryName === 'World' ? `🌎 ${d.countryName}` : d.countryName
    return (
    <div className="countryRow" key={i}
      onClick={() => {
        props.click(d.countryName)
      }}
      
      onMouseEnter ={() => {
        props.hover(d.countryName)
      }}
      onMouseLeave = {() => {
        props.hover(props.selectedCountry)
      }}
    >
      <div className='countryName'>{country}</div>
      <div className='countryConfirmed numbers'>{d.confirmed}</div>
      <div className='countryDeath numbers'>{(d.death * 100 / d.confirmed).toFixed(1)}% ({d.death})</div>
      <div className='countryRecovery numbers'>{(d.recovery * 100 / d.confirmed).toFixed(1)}% ({d.recovery})</div>
    </div>
    )
  })
  return ( 
    <div>
      <DataCards
        title="Total Countrys Infected"
        data={Object.keys(props.data).length}
        color='#e01a25' 
      />
      <div className="countryTable">
        <div className="countryRow header">
          <div className='countryTitle'>Country</div>
          <div className={props.sorted === 'confirmed' ? 'countryConfirmed numbers bold' : 'countryConfirmed numbers' } onClick={() => {props.sortClick('confirmed')}}>Confirmed</div>
          <div className={props.sorted === 'death' ? 'countryDeath numbers bold' : 'countryDeath numbers' } onClick={() => {props.sortClick('death')}}>Mortality Rt.</div>
          <div className={props.sorted === 'recovery' ? 'countryRecovery numbers bold' : 'countryRecovery numbers' } onClick={() => {props.sortClick('recovery')}}>Recovery Rt.</div>
        </div>

        {tableRow}
      </div>
    </div>
  )
}

export default Sidebar