import React from 'react';
import './dataCard.css';
import {formatNumber} from './utils';

const Sidebar: React.FunctionComponent<{title:string , outof100K?:number , note?:string, lastUpdate?:string, data:any, subNote?:string, color:string , percent?:string, percentInc?:string}> = (props) => {
  return ( 
    <div className="dataCard">
      <h3 className='cardTitle'>
        {props.title} 
      </h3>
      <div className='cardValue' style={{'color':props.color}}>
        {props.data === 0 || props.data === 'NA' ? 'NA' : formatNumber(props.data)} <span className='percent'>{props.percent}</span>
        {props.note ? <span className='note'>{props.note}</span>: null}
        {props.outof100K ? <span className="subNote">{(props.outof100K).toFixed(1)} per 100 000</span> : null}
        {props.subNote ? <div className='subNoteDiv'><span className="bold" style={{'color':props.color}}>{props.subNote}%</span> test +ve</div> : null}
        {props.lastUpdate ? <div className='subNoteDiv'><span className="italics" style={{'color':'#aaa', 'fontSize':'14px'}}>Testing data last updated: {props.lastUpdate}</span></div> : null}
      </div>
        
    </div>
  )
}

export default Sidebar