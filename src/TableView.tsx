import React from 'react';
import * as d3 from 'd3';
import Button from "./Button";
import { SortArrowUnset, SortArrowDown } from "./Arrows";
import {formatNumber} from './utils';
import './table.css';

const tableColumns:any = {
  'Confirmed Cases':{'formatNumber':true, 'date':false, 'title':'Cases', 'subTitle':'Total'},
  'Confirmed Cases Per 100K':{'formatNumber':false, 'date':false, 'title':'Cases', 'subTitle':'Per 100K', 'round':true},
  'Confirmed Cases last 24hrs.':{'formatNumber':true, 'date':false, 'title':'Cases', 'subTitle':'Last 24 Hrs'},
  'Total Deaths':{'formatNumber':true, 'date':false, 'title':'Deaths', 'subTitle':'Total'},
  'Deaths Per 100K':{'formatNumber':false, 'date':false, 'title':'Deaths', 'subTitle':'Per 100K', 'round':true},
  'Deaths last 24hrs.':{'formatNumber':true, 'date':false, 'title':'Deaths', 'subTitle':'Last 24 Hrs'},
  'Mortality Rate':{'formatNumber':false, 'date':false, 'suffix': '%', 'title':'Mortality Rt.', 'round':true},
  'Doubling Time':{'formatNumber':false, 'date':false, 'title':'Doubling Time', 'subTitle':'> 100 Cases'},
  'Date when it started':{'formatNumber':false, 'date':true, 'title':'Date', 'subTitle':'of 1st Case'},
}

const Sidebar: React.FunctionComponent<{width?:number, data:any , sorted:string , sortClick:(e:string) => void, selectedCountry: string,click:(d:string) => void ,hover:(d:string) => void }> = (props) => {

  let dataArr:any = Object.keys(props.data).map((key:string) => {
    return ({'countryName': key, 'data':props.data[key]['latestData']})
  })
  dataArr.sort((x:any, y:any) => d3.descending(x['data'][props.sorted], y['data'][props.sorted]))
  if(props.sorted === 'Doubling Time') {
    dataArr.sort((x:any, y:any) => d3.ascending(x['data'][props.sorted], y['data'][props.sorted]))
    let NADoubling:any = [], Doubling:any = []
    dataArr.forEach((el:any) => {
      el['data'][props.sorted] === 0 ? NADoubling.push(el) : Doubling.push(el);
    })
    NADoubling.forEach((el:any) => {
      Doubling.push(el)
    })
    dataArr = Doubling
  }
  if(props.sorted === 'Date when it started') {
    dataArr.sort((x:any, y:any) => d3.ascending(x['data'][props.sorted], y['data'][props.sorted]))
  }
  
  let tableHead = Object.keys(tableColumns).map((d:string,i:number) => (
    <th
    scope="col"
    key={i}
    role="columnheader"
    className="numbers"
    aria-sort={props.sorted === d ? "descending" : "none"}
    >
      <SortButton
        label={tableColumns[d].title}
        subLabel = {tableColumns[d].subTitle}
        isSorted={props.sorted === d}
        onClick={() => {
            props.sortClick(d);
        }}
      />
    </th>
  ))
  let tableRows = dataArr.map((d: any, i: number) => {
    let country =
      d.countryName === "World" ? `🌎 ${d.countryName}` : d.countryName;
    
    let tableBody = Object.keys(tableColumns).map((el:string,i:number) => {
      return (     
        <td 
          className="countryConfirmed numbers"
          key={i}
        >
          {el === 'Doubling Time' ? d['data'][el] === 0 ? 'NA' : `${d['data'][el]} days` : tableColumns[el].formatNumber ? formatNumber(d['data'][el]) : tableColumns[el].date ? d3.timeFormat("%b. %d")(d['data'][el]) : tableColumns[el].round ? (d['data'][el]).toFixed(1) : d['data'][el]}{tableColumns[el].suffix}
        </td>
      )
    })
    return (
      <tr
        className={props.selectedCountry === d.countryName ? 'countryRow selectedCountryRow': "countryRow"}
        key={i}
        onClick={() => {
          props.selectedCountry === d.countryName ? props.click("World") : props.click(d.countryName);
        }}
        onMouseEnter={() => {
          props.hover(d.countryName);
        }}
        onMouseLeave={() => {
          props.hover(props.selectedCountry);
        }}
      >
        {/* Label each row */}
        <th scope="row" className="countryName">
          {country}
        </th>
        {tableBody}
      </tr>
    );
  });
  return ( 
    <div>
      <div
        role="group"
        tabIndex={0}
        aria-labelledby="countryTable-heading"
        className="countryTable-wrapper"
        style={{ width: `${props.width}px`, height:`calc(100vh - ${130}px` }}
      >
        {/* Standard HTMl table. Has a caption and table headings to label each cell */}
        <table className="countryTable">
          <caption>
            <h2 id="countryTable-heading" style={{ fontSize: '14px', textAlign: 'center', backgroundColor: '#eee', textTransform:'uppercase' , padding:'7px 0', margin:'0'}}>Data by country</h2>
          </caption>
          <thead>
            <tr className="countryRow header">
              <th scope="col" role="columnheader" className="countryTitle">
                Country
              </th>
              {tableHead}
            </tr>
          </thead>
          <tbody>
            {tableRows}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * An accessible cell that acts as a sort buttons.
 * Buttons must have an accessible name, that identifies their purpose.
 * In this case, we use aria-label by, to programmatically associate the names.
 * This helps ensure that content remains accessible if the text changes.
 */
const SortButton: React.FC<{
  onClick: () => void;
  label: string;
  subLabel:string;
  isSorted: boolean;
}> = ({ onClick, label, subLabel, isSorted }) => {
  const buttonLabel = `Sort by ${label}`;

  return (
    <Button onClick={onClick} aria-label={buttonLabel}>
      <div className="sortButton">
        <div className={'tableTitleContainer'}>
          <div className={'tableTitle'}>{label}</div>
          <div className={'tableTitleSublabel'}>{subLabel}</div>
        </div>
        {/* NOTE: We set the purpose of the arrows as "decorative", hiding them
        from assistive technologies. We do this because we have aria-label,
        which supercedes the label from content. */}
        {isSorted ? (
          <SortArrowDown width="14px" height="14px" purpose="decorative" />
        ) : (
          <SortArrowUnset width="14px" height="14px" purpose="decorative" />
        )}
      </div>
    </Button>
  );
};

export default Sidebar;
