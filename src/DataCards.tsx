import React from 'react';
import './dataCard.css'

const Sidebar: React.FunctionComponent<{title:string , outof100K?:number , data?:number, color:string , percent?:string}> = (props) => {

   
  return ( 
    <div className="dataCard">
      <div className='cardTitle'>
        {props.title} 
      </div>
      <div className='cardValue' style={{'color':props.color}}>
        {props.data} <span className='percent'>{props.percent}</span>
        {props.outof100K ? <div className="subNote">{(props.outof100K).toFixed(1)} out of 100K</div> : null}
      </div>
        
    </div>
  )
}

export default Sidebar