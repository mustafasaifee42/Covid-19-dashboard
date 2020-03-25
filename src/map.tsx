import React,{ useEffect } from 'react';
import * as d3GeoProjection from 'd3-geo-projection';
import './Map.css';
import * as topojson from 'topojson';
import * as d3 from 'd3';
import Tick from './tick.svg';
import Button from "./Button";
import {formatNumber} from './utils';

const mapShape:any = require('./topo.json');
const mapShapeData:any = topojson.feature(mapShape, mapShape.objects.countries)
const disputedRegionsMapShapeData:any = topojson.feature(mapShape, mapShape.objects.ne_10m_admin_0_disputed_areas)

let mapNode!: SVGSVGElement | null;
const Map: React.FunctionComponent<{width:number , countryClicked:string, height:number , dataArr:any, hover:(e:string) => void, value:string, deathVisibility:number , toggleDeathVisibility:(e:number) => void, onValueToggle:(e:string) => void, windowWidth:number , index:any ,highlightNew:boolean,highlightNewClick:(e:boolean) => void, replay:()=> void, data:any , onCountryClick:(e:string) => void , country:string}> = (props) => {
  const {
    height,
    width,
    windowWidth
  } = props


  useEffect(() => {
    let countryinTopo = mapShapeData.features.map((d:any) =>  d.properties.NAME_EN )
    let countryinData = Object.keys(props.data)
    for (let i = 0; i < countryinData.length; i++){
      if(countryinTopo.indexOf(countryinData[i]) < 0){
        if (countryinData[i] !== 'World' && countryinData[i] !== 'Cruise Ship') console.warn(`${countryinData[i]} not in World Map`)
      }
    }
  },[props.data])

  useEffect(() => {
    d3.select(mapNode).selectAll('g').remove();
    let scaleFactor = (windowWidth < 800) ? 0.35 : 0.45
    const projection = d3GeoProjection.geoRobinson()
      .scale(409 * (width) / 2048)
      .translate([0.41 * (width), scaleFactor * (height)]);
  
    const path:any = d3.geoPath().projection(projection);
    let Zoom:any = d3.zoom().scaleExtent([0.6, 10]).on('zoom', zoomed);
    let mapSVG = d3.select(mapNode).call(Zoom);
    let zoomGroup = mapSVG.append('g');
    zoomGroup.append('g')
      .attr('class','mapKey')
      .attr('transform',`translate(${projection([-15, -45])[0]},${projection([-15, -45])[1]})`)
    zoomGroup.append('rect')
      .attr('class', 'bg')
      .attr('x',0)
      .attr('y',0)
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0)
      .on('click',() => {
        mapSVG.transition().duration(500).call(Zoom.transform, d3.zoomIdentity);
        props.onCountryClick('World')
      })
    d3.select('.backToWorld')
    .on('click',() => {
      mapSVG.transition().duration(500).call(Zoom.transform, d3.zoomIdentity);
      props.onCountryClick('World')
    })  
    function zoomed() {
      zoomGroup.attr('transform', d3.event.transform); // updated for d3 v4
    }

    zoomGroup
      .selectAll('.country')
      .data(mapShapeData.features)
      .enter()
      .append('path')
      .attr('class', `country countryG`)
      .attr('d', path)
      .attr('fill', '#ddd')
      .attr('fill-opacity', 0.25)
      .attr('stroke','#999')
      .attr('stroke-width',0.5)
      .on('click',(d:any) =>{ 
          let bounds = path.bounds(d),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          zoomScale = Math.max(
            1,
            Math.min(8, 0.9 / Math.max(dx / width, dy / height)),
          ),
          translate = [width / 2 - zoomScale * x, height / 2 - zoomScale * y - 50];

            props.onCountryClick(d.properties.NAME_EN);
        mapSVG
          .transition()
          .duration(500)
          .call(
            Zoom.transform,
            d3.zoomIdentity
              .translate(translate[0], translate[1])
              .scale(zoomScale),
          );
      })
    zoomGroup
      .selectAll('.disputedArea')
      .data(disputedRegionsMapShapeData.features)
      .enter()
      .append('path')
      .attr('class', `disputedArea`)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke','#666')
      .attr('stroke-width',0.5)
      .attr("stroke-dasharray", "2,2")

    //for adding bubbles or circle on the map
    let bubbleG = zoomGroup
      .selectAll('.bubbleG')
      .data(props.dataArr)
      .enter()
      .append('g')
      .attr('class', `bubbleG`)
      .on('click',(d:any) =>{ 
          let indx = mapShapeData.features.findIndex((obj:any) => obj.properties.NAME_EN === d.countryName)
          let bounds = path.bounds(mapShapeData.features[indx]),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          zoomScale = Math.max(
            1,
            Math.min(8, 0.9 / Math.max(dx / width, dy / height)),
          ),
          translate = [width / 2 - zoomScale * x, height / 2 - zoomScale * y - 50];

            props.onCountryClick(d.countryName);
        mapSVG
          .transition()
          .duration(500)
          .call(
            Zoom.transform,
            d3.zoomIdentity
              .translate(translate[0], translate[1])
              .scale(zoomScale),
          );
      })
      
    bubbleG
      .append('circle')
      .attr('class', `bubble`)
      .attr('cx',0)
      .attr('cy',0)
      .attr('fill','#e01a25')
      .attr('fill-opacity',0.25)
      .attr('stroke','#e01a25')
      .attr('stroke-width',1)
      .attr('r', 0)
      .attr('transform', (d:any) => `translate(${projection(d.centroid)[0]},${projection(d.centroid)[1]})`)
    bubbleG
      .append('circle')
      .attr('class', `deathBubble`)
      .attr('cx',0)
      .attr('cy',0)
      .attr('fill','#414141')
      .attr('fill-opacity',0.5)
      .attr('stroke','#414141')
      .attr('stroke-width',0.25)
      .attr('r', 0)
      .attr('transform', (d:any) => `translate(${projection(d.centroid)[0]},${projection(d.centroid)[1]})`)

    // eslint-disable-next-line
  },[height, width , props.data, windowWidth])
  useEffect(() => {
    let maxRadius = (windowWidth < 800) ? 30 : 50
    let rad = props.value === 'valuePer100K' ? 1000 : 100000
    const rScale = d3.scaleSqrt()
      .domain([0,rad])
      .range([0,maxRadius])
    let keyVal = props.value === 'valuePer100K' ? (windowWidth < 800) ? [100,500] : [10,100,500] : (windowWidth < 800) ? [10000,50000] : [1000,10000,50000]
    d3.selectAll('.keyCircle').remove();

    let keyG = d3.select('.mapKey')
      .selectAll('.keyCircle')
      .data(keyVal)
      .enter()
      .append('g')
      .attr('class', 'keyCircle')
      .attr('transform',(d:number) => `translate(0,${rScale(keyVal[keyVal.length - 1]) - rScale(d)})`)
    d3.select('.mapKey')
      .append('text')
      .attr('x',0)
      .attr('y',(d:number) => rScale(keyVal[keyVal.length - 1]) + 15)
      .attr('fill','#ccc')
      .attr('font-size',12)
      .attr('font-family','IBM Plex Sans')
      .attr('font-weight','bold')
      .attr('text-anchor','middle')
      .text('Cases')
    keyG.append('circle')
      .attr('cx',0)
      .attr('cy',0)
      .attr('fill','none')
      .attr('stroke-width', 1)
      .attr('stroke','#ccc')
      .attr('r',(d:number) => rScale(d))
    keyG
      .append('text')
      .attr('x',0)
      .attr('y',(d:number) => 0 - rScale(d) - 2)
      .attr('fill','#ccc')
      .attr('font-size',10)
      .attr('font-family','IBM Plex Sans')
      .attr('text-anchor','middle')
      .text((d:number) => d)
  },[windowWidth,props.value])

  useEffect(() => {
    let maxRadius = (windowWidth < 800) ? 30 : 50
    let rad = props.value === 'valuePer100K' ? 1000 : 100000
    const rScale = d3.scaleSqrt()
      .domain([0,rad])
      .range([0,maxRadius])
    d3.select(mapNode).selectAll('.country')
      .transition()
      .duration(100)
      .attr('fill', (d:any) => {
        if(props.data[d.properties.NAME_EN]) {
          if(props.data[d.properties.NAME_EN]['confirmedData'][props.index - 1][props.value] > 0)
            return '#0aa5c2'
        }
        return'#ddd'
      })
      .attr('stroke',(d:any) => {
        if(props.data[d.properties.NAME_EN])
        if(props.data[d.properties.NAME_EN]['confirmedData'][props.index - 1][props.value] > 0)
            return '#0aa5c2'
        return'#999'
      })
      .attr('opacity',(d:any) => {
        if(props.country === 'World') return 1
        if(d.properties.NAME_EN === props.country) return 1
        return 0.2
      })
    d3.select(mapNode).selectAll('.bubble')
      .transition()
      .duration(100)
      .attr('r', (d:any) => {
        if(props.data[d.countryName]){
          if(props.highlightNew)
            return rScale(props.data[d.countryName]['confirmedData'][props.index - 1][props.value]) - rScale(props.data[d.countryName]['confirmedData'][props.index - 1]['new']) / 2
          return rScale(props.data[d.countryName]['confirmedData'][props.index - 1][props.value])
        }
        return 0
      })
      .attr('stroke-width',(d:any) => {
        if(props.data[d.countryName]){
          if(props.highlightNew)
            return rScale(props.data[d.countryName]['confirmedData'][props.index - 1]['new']) 
          return 0.5
        }
        return 0
      })
      .attr('stroke-opacity',(d:any) => {
          if(props.highlightNew) return 0.5
          return 1
      })
      .attr('opacity',(d:any) => {
        if(props.country === 'World') return 1
        if(d.countryName === props.country) return 1
        return 0.2
      })
    d3.select(mapNode).selectAll('.deathBubble')
      .transition()
      .duration(100)
      .attr('r', (d:any) => {
        if(props.data[d.countryName]){
          if(props.highlightNew)
            return rScale(props.data[d.countryName]['deathData'][props.index - 1][props.value]) - rScale(props.data[d.countryName]['deathData'][props.index - 1]['new']) / 2
          return rScale(props.data[d.countryName]['deathData'][props.index - 1][props.value])
        }
        return 0
      })
      .attr('stroke-width',(d:any) => {
        if(props.data[d.countryName]){
          if(props.highlightNew)
            return rScale(props.data[d.countryName]['deathData'][props.index - 1]['new']) 
          return 0.5
        }
        return 0
      })
      .attr('opacity',(d:any) => {
        if(props.country === 'World') return props.deathVisibility
        if(d.countryName === props.country) return props.deathVisibility
        return props.deathVisibility * 0.2
      })
    
    if(props.country === 'World')
      d3.select('.backToWorld').classed('active',false)
    else
      d3.select('.backToWorld').classed('active',true)
    d3.selectAll('.bubbleG')
      .on('mouseenter',(d:any) => {
        props.hover(d.countryName);
        d3.select('.tooltip')
          .style('display','inline')
          .style("left", `${d3.event.pageX + 20}px`)		
          .style("top", `${d3.event.pageY - 20}px`);	
        d3.select('.tooltipCountry')
          .html(d.countryName)
        if(props.data[d.countryName]) {
          d3.select('.tooltipConfirmed')
            .html(`<span class="bold red">${formatNumber(props.data[d.countryName]['confirmedData'][props.data[d.countryName]['confirmedData'].length - 1]['value'])}</span> (<span class="bold red">${(props.data[d.countryName]['confirmedData'][props.data[d.countryName]['confirmedData'].length - 1]['valuePer100K']).toFixed(1)}</span> per 100 000)`)
          d3.select('.tooltipDeath')
            .html(`<span class="bold">${formatNumber(props.data[d.countryName]['deathData'][props.data[d.countryName]['deathData'].length - 1]['value'])}</span> (<span class="bold">${(props.data[d.countryName]['deathData'][props.data[d.countryName]['deathData'].length - 1]['value'] * 100 / props.data[d.countryName]['confirmedData'][props.data[d.countryName]['confirmedData'].length - 1]['value']).toFixed(1)}%</span> Mortality rate)`)
          d3.select('.tooltipcases24').html(formatNumber(props.data[d.countryName]['confirmedData'][props.data[d.countryName]['confirmedData'].length - 1]['new']))
          d3.select('.tooltipdeaths24').html(formatNumber(props.data[d.countryName]['deathData'][props.data[d.countryName]['deathData'].length - 1]['new']))
        } else {
          d3.select('.tooltipConfirmed')
            .html(`<span class="bold red">0</span>`)
          d3.select('.tooltipDeath')
            .html(`<span class="bold red">0</span>`)
          d3.select('.tooltipcases24').html(0)
          d3.select('.tooltipdeaths24').html(0)
        }
      })
      .on('mousemove',(d:any) => {
        d3.select('.tooltip')
        .style("left", `${d3.event.pageX + 20}px`)		
        .style("top", `${d3.event.pageY - 20}px`);	
      })
      .on('mouseleave',(d:any) => {
        props.hover(props.countryClicked);
        d3.select('.tooltip')
          .style('display','none')
      })
      d3.selectAll('.countryG')
        .on('mouseenter',(d:any) => {
          props.hover(d.properties.NAME_EN);
          d3.select('.tooltip')
            .style('display','inline')
            .style("left", `${d3.event.pageX + 20}px`)		
            .style("top", `${d3.event.pageY - 20}px`);		
          d3.select('.tooltipCountry')
            .html(d.properties.NAME_EN)
          if(props.data[d.properties.NAME_EN]) {
            d3.select('.tooltipConfirmed')
              .html(`<span class="bold red">${formatNumber(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['value'])}</span> (<span class="bold red">${(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['valuePer100K']).toFixed(1)}</span> per 100 000)`)
            d3.select('.tooltipDeath')
              .html(`<span class="bold">${formatNumber(props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1]['value'])}</span> (<span class="bold">${(props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1]['value'] * 100 / props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['value']).toFixed(1)}%</span> Mortality rate)`)
            d3.select('.tooltipcases24').html(formatNumber(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['new']))
            d3.select('.tooltipdeaths24').html(formatNumber(props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1]['new']))
          } else {
            d3.select('.tooltipConfirmed')
              .html(`<span class="bold red">0</span>`)
            d3.select('.tooltipDeath')
              .html(`<span class="bold red">0</span>`)
            d3.select('.tooltipcases24').html(0)
            d3.select('.tooltipdeaths24').html(0)
          }
        })
        .on('mousemove',(d:any) => {
          d3.select('.tooltip')
          .style("left", `${d3.event.pageX + 20}px`)		
          .style("top", `${d3.event.pageY - 20}px`);	
        })
        .on('mouseleave',(d:any) => {
          props.hover(props.countryClicked);
          d3.select('.tooltip')
            .style('display','none')
        })
  })

  return ( 
    <div>
      <div className='mapHeader'>
        <div className='dateContainer'>
          <h2 className='date blue'>{props.country}</h2>
        </div>
        <div className='rightOptions'>
          <Button
            className="buttonTab"
            aria-pressed={props.deathVisibility === 1 ? true : false}
            disabled={props.deathVisibility === 1 ? false : false}
            onClick={() => props.deathVisibility === 1 ? props.toggleDeathVisibility(0) : props.toggleDeathVisibility(1)}
          >
            <div className='checkBox'><img src={Tick} alt='' className='tickIcon'/></div>
            Show Deaths
          </Button>
          <Button
            className="buttonTab"
            aria-pressed={props.highlightNew ? false : props.value === 'valuePer100K' ? true : false}
            disabled={props.highlightNew ? true : props.value === 'valuePer100K' ? false : false}
            onClick={() => !props.highlightNew ? props.value === 'valuePer100K' ? props.onValueToggle('value') : props.onValueToggle('valuePer100K') : null}
          >
            <div className='checkBox'><img src={Tick} alt='' className='tickIcon'/></div>
            Per 100 000
          </Button>
          <Button 
            className="buttonTab"
            aria-pressed={props.value === 'valuePer100K' ? false : props.highlightNew ? true : false}
            disabled={props.value === 'valuePer100K' ? true : props.highlightNew ? false : false}
            onClick={() => props.value !== 'valuePer100K' ? props.highlightNew ? props.highlightNewClick(false) : props.highlightNewClick(true) : null}
          >
            <div className='checkBox'><img src={Tick} alt='' className='tickIcon'/></div>
            Highlight last 24 Hrs
          </Button>
        </div>
      </div>
      <div className='title'>
        <div className='titleCountry'>
          <Button 
            onClick={() => {
              if(props.index === props.data[Object.keys(props.data)[0]]['confirmedData'].length) 
                props.replay()
            }}
          >
            <div className='bold'>{d3.timeFormat("%b. %d")(props.data[Object.keys(props.data)[0]]['confirmedData'][props.index - 1]['date'])}</div>
            <span className={props.index === props.data[Object.keys(props.data)[0]]['confirmedData'].length ? 'replay' : 'replay disabled'}>Play timelapse</span>
          </Button>
        </div>
        <div className='confirmedTitleMap'> Confirmed: <span className='bold red'>{props.data[props.country] ? formatNumber(props.data[props.country]['confirmedData'][props.index - 1]['value']) : 0}</span> (<span className='bold red'>{props.data[props.country] ? (props.data[props.country]['confirmedData'][props.index - 1]['valuePer100K']).toFixed(1) : 0}</span> per 100 000)<br /><span className='italics small'>Last 24 hrs: <span className='bold red'>{props.data[props.country] ? formatNumber(props.data[props.country]['confirmedData'][props.index - 1]['new']) : 0}</span></span></div>
        <div className='deathTitleMap'> Deaths: <span className='deathTitle bold'>{props.data[props.country] ? formatNumber(props.data[props.country]['deathData'][props.index - 1]['value']) : 0}</span> (<span className='bold'>{props.data[props.country] ? (props.data[props.country]['deathData'][props.index - 1]['value'] * 100 / props.data[props.country]['confirmedData'][props.index - 1]['value'] ).toFixed(1) : 0}%</span> Mortality rate)<br /><span className='italics small'>Last 24 hrs: <span className='bold'>{props.data[props.country] ? formatNumber(props.data[props.country]['deathData'][props.index - 1]['new']) : 0}</span></span></div>
      </div>
      <div className='mapContainer'>
        <div className='buttonContainer'>
          <div className='backToWorld'>Back to World</div>
        </div>
        <svg width={props.width} height={props.height - 180} ref={node => mapNode = node} />
      </div>
    </div>
  )
}

export default Map