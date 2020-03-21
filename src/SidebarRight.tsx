import React from 'react';
import * as d3 from 'd3';
import DataCards from './DataCards';
import './sidebarRight.css'

const Sidebar: React.FunctionComponent<{width:number , height:number, graphHeight:number, data:any ,country:string, selectedCountry: string,click:(d:string) => void ,hover:(d:string) => void }> = (props) => {

  let dataArr:any = Object.keys(props.data).map((key:string) => {
    return ({'countryName': key, 'confirmed':props.data[key]['confirmedData'][props.data[key]['confirmedData'].length - 1]['value'], 'death':props.data[key]['deathData'][props.data[key]['deathData'].length - 1]['value'], 'recovery':props.data[key]['recoveryData'][props.data[key]['recoveryData'].length - 1]['value']})
  })
  dataArr.sort((x:any, y:any) => d3.descending(x.confirmed, y.confirmed))
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
      <div className='countryDeath numbers'>{d.death} ({(d.death * 100 / d.confirmed).toFixed(1)}%)</div>
      <div className='countryRecovery numbers'>{d.recovery} ({(d.recovery * 100 / d.confirmed).toFixed(1)}%)</div>
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
          <div className='countryName'>Country</div>
          <div className='countryConfirmed numbers'>Confirmed</div>
          <div className='countryDeath numbers'>Deaths</div>
          <div className='countryRecovery numbers'>Recovery</div>
        </div>

        {tableRow}
      </div>
    </div>
  )
}

export default Sidebar