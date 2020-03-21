import React,{ useEffect} from 'react';
import * as d3 from 'd3';
import DataCards from './DataCards';
import './sidebar.css'

let graphNode!: SVGSVGElement | null;
let dailyCasesGraphNode!: SVGSVGElement | null;
const Sidebar: React.FunctionComponent<{width:number , height:number, graphHeight:number, data:any ,country:string }> = (props) => {

  useEffect(() => {
    d3.select(graphNode).selectAll('g').remove()
    d3.select(dailyCasesGraphNode).selectAll('g').remove()
    if(props.data[props.country]) {
      let margin = {top: 10, right: 10, bottom: 20, left: 10},
        width = props.width - 15 - margin.left - margin.right,
        height = props.graphHeight - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
      let g = d3.select(graphNode)
        .append('g')
        .attr("transform",`translate(${margin.left},${margin.top})`);
      
      let x = d3.scaleTime()
        .domain(d3.extent(props.data[props.country].confirmedData, (d:any) => d.date))
        .range([ 0, width ]);

      // Add Y axis
      let y = d3.scaleLinear()
        .domain([0, d3.max(props.data[props.country].confirmedData, (d:any) => d.value)])
        .range([ height, 0 ]);

      g.append("g")
        .call(d3.axisRight(y).tickSize(width).ticks(5));
      g.select(".domain").remove();
      g.selectAll(".tick line").filter(Number).attr("stroke", "#aaa").attr("stroke-dasharray", "2,2");
      g.selectAll(".tick text").attr("x", 4).attr("dy", -4).attr('font-family','IBM Plex Sans').attr('fill','#aaa').attr('font-size',10);
      
      g.append('text')
        .attr('font-family','IBM Plex Sans')
        .attr('fill','#aaa')
        .attr('font-size',10)
        .text((d3.timeFormat("%d %b")(props.data[props.country]['confirmedData'][0].date)))
        .attr('x',x(props.data[props.country]['confirmedData'][0].date))
        .attr('y',height + 15)
      g.append('text')
        .attr('font-family','IBM Plex Sans')
        .attr('fill','#aaa')
        .attr('font-size',10)
        .text((d3.timeFormat("%d %b")(props.data[props.country]['confirmedData'][props.data[props.country]['confirmedData'].length - 1].date)))
        .attr('x',x(props.data[props.country]['confirmedData'][props.data[props.country]['confirmedData'].length - 1].date))
        .attr('text-anchor','end')
        .attr('y',height + 15)
      g.append('text')
        .attr('font-family','IBM Plex Sans')
        .attr('fill','#aaa')
        .attr('font-size',10)
        .text((d3.timeFormat("%d %b")(d3.timeParse("%m/%d/%y")('2/1/20'))))
        .attr('x',x(d3.timeParse("%m/%d/%y")('2/1/20')))
        .attr('y',height + 15)
      g.append('text')
        .attr('font-family','IBM Plex Sans')
        .attr('fill','#aaa')
        .attr('font-size',10)
        .text((d3.timeFormat("%d %b")(d3.timeParse("%m/%d/%y")('3/1/20'))))
        .attr('x',x(d3.timeParse("%m/%d/%y")('3/1/20')))
        .attr('text-anchor','end')
        .attr('y',height + 15)
      
      
        // Add the area
      g.append("path")
        .datum(props.data[props.country].confirmedData)
        .attr("fill", "#e01a25")
        .attr('fill-opacity',0.25)
        .attr("stroke", "#e01a25")
        .attr("stroke-width", 1)
        .attr("d", d3.area()
          .x((d:any,i:number) => x(d.date))
          .y0(y(0))
          .y1((d:any) =>  y(d.value))
          )
      g.append("path")
        .datum(props.data[props.country].recoveryData)
        .attr("fill", "#7BCFA9")
        .attr("stroke-width", 1)
        .attr("d", d3.area()
          .x((d:any,i:number) => x(d.date))
          .y0(y(0))
          .y1((d:any) =>  y(d.value))
        )
      g.append("path")
        .datum(props.data[props.country].deathData)
        .attr("fill", "#414141")
        .attr("stroke-width", 1)
        .attr("d", d3.area()
          .x((d:any,i:number) => x(d.date))
          .y0(y(0))
          .y1((d:any) =>  y(d.value))
        )
      // append the svg object to the body of the page
        let dailyeCasesG = d3.select(dailyCasesGraphNode)
          .append('g')
          .attr("transform",`translate(${margin.left},${margin.top})`);
        var xScale = d3.scaleBand()
          .range([ 0, width ])
          .domain(props.data[props.country]['confirmedData'].map((d:any) =>  d.date))
          .padding(0.2);
        var yScale = d3.scaleLinear()
          .domain([0, d3.max(props.data[props.country]['confirmedData'], (d:any) => d.new)])
          .range([ height, 0]);
        
        dailyeCasesG.append("g")
          .call(d3.axisRight(yScale).tickSize(width).ticks(5));
        dailyeCasesG.select(".domain").remove();
        dailyeCasesG.selectAll(".tick line").filter(Number).attr("stroke", "#aaa").attr("stroke-dasharray", "2,2");
        dailyeCasesG.selectAll(".tick text").attr("x", 4).attr("dy", -4).attr('font-family','IBM Plex Sans').attr('fill','#aaa').attr('font-size',10);
      
        dailyeCasesG.selectAll("mybar")
          .data(props.data[props.country]['confirmedData'])
          .enter()
          .append("rect")
          .attr("x", (d:any) => xScale(d.date))
          .attr("y", (d:any) => yScale(d.new))
          .attr("width", xScale.bandwidth())
          .attr("height", (d:any) => height -  yScale(d.new))
          .attr("fill", "#e01a25")

        dailyeCasesG.append('text')
          .attr('font-family','IBM Plex Sans')
          .attr('fill','#aaa')
          .attr('font-size',10)
          .text((d3.timeFormat("%d %b")(props.data[props.country]['confirmedData'][0].date)))
          .attr('x',xScale(props.data[props.country]['confirmedData'][0].date))
          .attr('y',height + 15)
        dailyeCasesG.append('text')
          .attr('font-family','IBM Plex Sans')
          .attr('fill','#aaa')
          .attr('font-size',10)
          .text((d3.timeFormat("%d %b")(props.data[props.country]['confirmedData'][props.data[props.country]['confirmedData'].length - 1].date)))
          .attr('x',xScale(props.data[props.country]['confirmedData'][props.data[props.country]['confirmedData'].length - 1].date) + xScale.bandwidth())
          .attr('text-anchor','end')
          .attr('y',height + 15)
        dailyeCasesG.append('text')
          .attr('font-family','IBM Plex Sans')
          .attr('fill','#aaa')
          .attr('font-size',10)
          .text((d3.timeFormat("%d %b")(d3.timeParse("%m/%d/%y")('2/1/20'))))
          .attr('x',xScale(d3.timeParse("%m/%d/%y")('2/1/20')) + xScale.bandwidth() / 2)
          .attr('text-anchor','middle')
          .attr('y',height + 15)
        dailyeCasesG.append('text')
          .attr('font-family','IBM Plex Sans')
          .attr('fill','#aaa')
          .attr('font-size',10)
          .text((d3.timeFormat("%d %b")(d3.timeParse("%m/%d/%y")('3/1/20'))))
          .attr('x',xScale(d3.timeParse("%m/%d/%y")('3/1/20')) + xScale.bandwidth() / 2)
          .attr('text-anchor','middle')
          .attr('y',height + 15)
    }
  })

  return ( 
    <div>
      <div className='countryShow'>{props.country}</div>
      <DataCards
        title="Total Confirmed"
        data={props.data[props.country] ? props.data[props.country]['confirmedData'][props.data[props.country]['confirmedData'].length - 1].value : 0}
        color='#e01a25' 
        outof100K= {props.data[props.country] ? props.data[props.country]['confirmedData'][props.data[props.country]['confirmedData'].length - 1]['valuePer1000'] : undefined}
      />
      <DataCards
        title="Total Death"
        data={props.data[props.country] ? props.data[props.country]['deathData'][props.data[props.country]['deathData'].length - 1].value : 0}
        percent={props.data[props.country] ? `${(props.data[props.country]['deathData'][props.data[props.country]['deathData'].length - 1].value * 100 / props.data[props.country]['confirmedData'][props.data[props.country]['confirmedData'].length - 1].value).toFixed(1)}% Mortality Rate` : '0%'}
        color='#414141' 
      />
      <DataCards
        title="Total Recovered"
        data={props.data[props.country] ? props.data[props.country]['recoveryData'][props.data[props.country]['recoveryData'].length - 1].value : 0}
        percent={props.data[props.country] ? `${(props.data[props.country]['recoveryData'][props.data[props.country]['recoveryData'].length - 1].value * 100 / props.data[props.country]['confirmedData'][props.data[props.country]['confirmedData'].length - 1].value).toFixed(1)}% Recovery Rate` : '0%'}
        color='#7BCFA9' 
      />
      <div className="graphContainer">
        <div className='cardTitle'>Cummulative Cases</div>
        <svg width={props.width - 5} height={props.graphHeight} ref={node => graphNode = node}/>
      </div>
      <div className="graphContainer">
        <div className='cardTitle'>Daily Cases</div>
        <svg width={props.width - 5} height={props.graphHeight} ref={node => dailyCasesGraphNode = node}/>
      </div>
    </div>
  )
}

export default Sidebar