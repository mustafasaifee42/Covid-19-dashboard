import React, { useEffect } from 'react';
import * as d3 from 'd3';
import {formatNumber} from './utils';
import CountryNameData from './countryNameData.json';

let graphNode!: SVGSVGElement | null;
const Sidebar: React.FunctionComponent<{ width:number , height:number,country:string, setCountry:(e:string) => void, xDomain:[number,number], xAxis:string, data:any}> = (props) => {
  useEffect(() => {
    let data = [...props.data]
    data = data.sort((x:any, y:any) => d3.descending(x[props.xAxis], y[props.xAxis]))
    console.log(data)
    d3.select(graphNode).selectAll('g').remove()  
    let margin = {top: 30, right:0, bottom: 0, left: 20},
    width = props.width- margin.left - margin.right,
    height = props.height - margin.top - margin.bottom;
    let g = d3.select(graphNode)
      .append('g')
      .attr('class','bg')
      .attr("transform",`translate(${margin.left},${margin.top})`);
    let xscale = [0,100000,200000,300000,400000,500000,600000,700000,800000,900000]

    let xScale = d3.scaleLinear()
      .domain(props.xDomain)
      .range([0,width ])

    g.selectAll('.yAxisLines')
      .data(xscale)
      .enter()
      .append('line')
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "2,2")
      .attr('y1',0)
      .attr('y2',height)
      .attr('x1',(d:number) => xScale(d))
      .attr('x2',(d:number) => xScale(d))
    g.selectAll('.yAxisLabel')
      .data(xscale)
      .enter()
      .append('text')
      .attr("fill", "#999")
      .attr('x',(d:number) => xScale(d))
      .attr('y',0)
      .attr("dx", 2)
      .attr("dy", -5)
      .attr('font-family','IBM Plex Sans')
      .attr('font-size',10)
      .text((d:number) => d)
    
    g.selectAll('.countryBars')
      .data(data)
      .enter()
      .append('rect')
      .attr('class',(d:any) => `bars countryBars ${d.country.replace(/ /g,"_").replace(/,/g,"_").replace("*","")}TestingBars`)
      .attr('x',0)
      .attr('y',(d:any, i:number) => i*14)
      .attr('width',(d:any) => xScale(d[props.xAxis]))
      .attr('height',12)
      .attr('fill','#0aa5c2')
      .attr('fill-opacity',1)
      .on("mouseover", (d:any) => {mouseover(d)})
      .on("mousemove", () => {mousemove()})
      .on("mouseout", () => {mouseout()})
    g.selectAll('.countryBarText')
      .data(data)
      .enter()
      .append('text')
      .attr('class',(d:any) =>`bars countryBarText ${d.country.replace(/ /g,"_").replace(/,/g,"_").replace("*","")}TestingBars`)
      .attr('x',0)
      .attr('y',(d:any, i:number) => i*14)
      .attr('fill','#414141')
      .attr('dy',10)
      .attr('dx',-3)
      .attr('font-family','IBM Plex Sans')
      .attr('text-anchor','end')
      .attr('font-size',8)
      .text((d:any) => CountryNameData.findIndex((obj:any) => obj.countryName === d.country) === -1 ? d.country : CountryNameData[CountryNameData.findIndex((obj:any) => obj.countryName === d.country)]['countryShortCode'])
      .on("mouseover", (d:any) => {mouseover(d)})
      .on("mousemove", () => {mousemove()})
      .on("mouseout", () => {mouseout()})

    
    let mouseover = (d:any) => {
      d3.select('.testingTooltip')
        .style('display','inline')
        .style("left", `${d3.event.pageX + 20}px`)		
        .style("top", `${d3.event.pageY - 20}px`);	
      d3.select('.tooltipCountryTesting')
        .html(d.country)
      d3.select('.tooltipNoOfTest')
        .html(formatNumber(d['Testing Data']))
      d3.select('.testingPer100K')
        .html(d['Testing Data Per 100K'])
      d3.select('.tooltipPositivePercent').html(`${d['Positive Tests']}%`)
      d3.select('.tooltipUpdate').html(d['Update Date'])
      props.setCountry(d.country)  
    }

    let mousemove = () => {
      d3.select('.testingTooltip')
      .style("left", `${d3.event.pageX + 20}px`)		
      .style("top", `${d3.event.pageY - 20}px`);	

    }
    let mouseout = () => {
      d3.select('.testingTooltip')
        .style('display','none')
      props.setCountry('World')

    }

  // eslint-disable-next-line
  },[props.width , props.height])
  
  useEffect(() => {
    if(props.country === "World") {
      d3.select(graphNode).selectAll('.bars')
        .attr('opacity',1)
    }
    else {
      d3.select(graphNode).selectAll('.bars')
        .attr('opacity',0.2)
      d3.select(graphNode).selectAll(`.${props.country.replace(/ /g,"_").replace(/,/g,"_").replace("*","")}TestingBars`)
        .attr('opacity',1)
    }
  },[props.country])

  return (
    <div>
      <svg width={props.width} height={props.height} ref={node =>graphNode = node}/>
    </div>
  )
}


export default Sidebar;
