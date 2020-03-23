import React from 'react';
import './dataCard.css';
import {formatNumber} from './utils';

const Sidebar: React.FunctionComponent<{title:string , outof100K?:number , note?:string, data:number, subNote?:number, color:string , percent?:string}> = (props) => {

   
  return ( 
    <div className="dataCard">
      <h3 className='cardTitle'>
        {props.title} 
      </h3>
      <div className='cardValue' style={{'color':props.color}}>
        {props.data === 0 ? 'NA' : formatNumber(props.data)} <span className='percent'>{props.percent}</span>
        {props.note ? <span className='note'>{props.note}</span>: null}
        {props.outof100K ? <span className="subNote">{(props.outof100K).toFixed(1)} per 100 000</span> : null}
        {props.subNote ? <div className='subNoteDiv'>Last 24 hrs. <span className="bold" style={{'color':props.color}}>{formatNumber(props.subNote)}</span></div> : null}
      </div>
        
    </div>
  )
}

export default Sidebar