import React, { useEffect } from 'react';
import * as d3 from 'd3';
import {formatNumber} from './utils';
import CountryNameData from './countryNameData.json';

let graphNode!: SVGSVGElement | null;
const Sidebar: React.FunctionComponent<{ width:number , height:number,class:string, country:string, setCountry:(e:string) => void, xDomain:[number,number], xAxisLabel:string, yAxisLabel:string,  yDomain:[number,number], data:any ,xAxis:string, yAxis:string }> = (props) => {
  useEffect(() => {
    d3.select(`.${props.class}`).selectAll('g').remove()  
    let margin = {top: 20, right:0, bottom: 40, left: 30},
    width = props.width - 15 - margin.left - margin.right,
    height = props.height - margin.top - margin.bottom;
    let g = d3.select(graphNode)
      .append('g')
      .attr('class','bg')
      .attr("transform",`translate(${margin.left},${margin.top})`);
    let scale = [0.01,1,10,100,1000,1000]
    let xscale = [0.1,1,10,100,1000,10000]
    let yScale = d3.scaleLog()
        .domain(props.yDomain)
        .range([ height, 0 ])

    let xScale = d3.scaleLog()
      .domain(props.xDomain)
      .range([0,width ])

    let voronoi = d3.voronoi()
      .x((d:any) => xScale(d[props.xAxis]))
      .y((d:any) => yScale(d[props.yAxis]))
      .extent([[0, 0], [width, height]]);
    g.selectAll('.yAxisLines')
      .data(scale)
      .enter()
      .append('line')
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "2,2")
      .attr('x1',0)
      .attr('x2',width)
      .attr('y1',(d:number) => yScale(d))
      .attr('y2',(d:number) => yScale(d))
    g.selectAll('.yAxisLabel')
      .data(scale)
      .enter()
      .append('text')
      .attr("fill", "#999")
      .attr('x',0)
      .attr('y',(d:number) => yScale(d))
      .attr("dy", -4)
      .attr('font-family','IBM Plex Sans')
      .attr('font-size',10)
      .text((d:number) => d)
    g.append('text')
      .attr("fill", "#414141")
      .attr('x',props.width / 2)
      .attr('y',height + 30)
      .attr('font-family','IBM Plex Sans')
      .attr('text-anchor','middle')
      .attr('font-size',12)
      .text(props.xAxisLabel)
    g.append('text')
    .attr('transform',`translate(${-10},${height/2}) rotate (-90)`)
      .attr("fill", "#414141")
      .attr('x',0)
      .attr('y',0)
      .attr('font-family','IBM Plex Sans')
      .attr('text-anchor','middle')
      .attr('font-size',12)
      .text(props.yAxisLabel)
    g.selectAll('.xAxisLines')
      .data(xscale)
      .enter()
      .append('line')
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "2,2")
      .attr('y1',0)
      .attr('y2',height)
      .attr('x1',(d:number) => xScale(d))
      .attr('x2',(d:number) => xScale(d))
    g.selectAll('.xAxisLabel')
      .data(xscale)
      .enter()
      .append('text')
      .attr("fill", "#999")
      .attr('y',height)
      .attr('x',(d:number) => xScale(d))
      .attr("dy", 15)
      .attr('font-family','IBM Plex Sans')
      .attr('text-anchor','end')
      .attr('font-size',10)
      .text((d:number) => d)
    
    g.selectAll('.countryCircle')
      .data(props.data)
      .enter()
      .append('circle')
      .attr('class',(d:any) => `circle countryCircle ${d.country.replace(/ /g,"_").replace(/,/g,"_").replace("*","")}Testing`)
      .attr('cx',(d:any) => xScale(d[props.xAxis]))
      .attr('cy',(d:any) => yScale(d[props.yAxis]))
      .attr('r',5)
      .attr('fill','#0aa5c2')
      .attr('fill-opacity',0.4)
      .attr('stroke','#0aa5c2')
    g.selectAll('.countryText')
      .data(props.data)
      .enter()
      .append('text')
      .attr('class',(d:any) =>`circle countryText ${d.country.replace(/ /g,"_").replace(/,/g,"_").replace("*","")}Testing`)
      .attr('x',(d:any) => xScale(d[props.xAxis]) - 7)
      .attr('y',(d:any) => yScale(d[props.yAxis]))
      .attr('fill','#414141')
      .attr('dy',2)
      .attr('font-family','IBM Plex Sans')
      .attr('text-anchor','end')
      .attr('font-size',8)
      .text((d:any) => CountryNameData.findIndex((obj:any) => obj.countryName === d.country) === -1 ? d.country : CountryNameData[CountryNameData.findIndex((obj:any) => obj.countryName === d.country)]['countryShortCode'])

    
    let voronoiGroup = g.append("g")
      .attr("class", "voronoi");
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
    voronoiGroup.selectAll("path")
      .data(voronoi.polygons(props.data))
      .enter().append("path")
      .attr("d", (d:any) =>  d ? "M" + d.join("L") + "Z" : null)
      .attr('fill-opacity',0)
      .on("mouseover", (d:any) => {mouseover(d.data)})
      .on("mousemove", () => {mousemove()})
      .on("mouseout", () => {mouseout()})

  // eslint-disable-next-line
  },[props.width , props.height])
  
  useEffect(() => {
    if(props.country === "World") {
      d3.select(graphNode).selectAll('.circle')
        .attr('opacity',1)
    }
    else {
      d3.select(graphNode).selectAll('.circle')
        .attr('opacity',0.2)
      d3.select(graphNode).selectAll(`.${props.country.replace(/ /g,"_").replace(/,/g,"_").replace("*","")}Testing`)
        .attr('opacity',1)
    }
  },[props.country])

  return (
    <div>
      <svg width={props.width} height={props.height} ref={node =>graphNode = node} className={props.class}/>
    </div>
  )
}


export default Sidebar;
