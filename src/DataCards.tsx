import React from 'react';
import './dataCard.css'

const Sidebar: React.FunctionComponent<{title:string , outof100K?:number , note?:string, data?:number | string, color:string , percent?:string}> = (props) => {

   
  return ( 
    <div className="dataCard">
      <div className='cardTitle'>
        {props.title} 
      </div>
      <div className='cardValue' style={{'color':props.color}}>
        {props.data} <span className='percent'>{props.percent}</span>
        {props.note ? <span className='note'>{props.note}</span>: null}
        {props.outof100K ? <span className="subNote">{(props.outof100K).toFixed(1)} per 100000</span> : null}
      </div>
        
    </div>
  )
}

export default Sidebar