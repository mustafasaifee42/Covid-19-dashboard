import React,{ useEffect} from 'react';
import * as d3GeoProjection from 'd3-geo-projection';
import './Map.css';
import * as topojson from 'topojson';
import * as d3 from 'd3';
const data:any = require('./topo.json');

let mapNode!: SVGSVGElement | null;
const Map: React.FunctionComponent<{width:number , height:number , scale:number , index:any , replay:()=> void, translate:[number,number] , data:any , selectedKey:[string,number] , onToggleClick:(e:[string,number]) => void ,onCountryClick:(e:string) => void , country:string}> = (props) => {

  const projection = d3GeoProjection.geoRobinson()
                      .scale(props.scale)
                      .translate(props.translate);
  const path:any = d3.geoPath().projection(projection);
  let mapShape:any = data;
  const mapShapeData:any = topojson.feature(mapShape, mapShape.objects.countries)
  useEffect(() => {
    const rScale = d3.scaleSqrt()
      .domain([0,100000])
      .range([0,50])
    let Zoom:any = d3.zoom().scaleExtent([0.8, 10]).on('zoom', zoomed);

    let mapSVG = d3.select(mapNode).call(Zoom);
    let zoomGroup = mapSVG.append('g');

    zoomGroup.append('rect')
      .attr('class', 'bg')
      .attr('x',0)
      .attr('y',0)
      .attr('width', props.width)
      .attr('height', props.height)
      .attr('opacity', 0)
      .on('click', () => {
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
      .attr('class', `country`)
      .attr('d', path)
      .attr('fill', (d:any) => {
        if(props.data[d.properties.NAME_EN])
          if(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1][props.selectedKey[0]] > 0)
            return '#0aa5c2'
        return'#aaa'
      })
      .attr('fill-opacity', 0.1)
      .attr('stroke',(d:any) => {
        if(props.data[d.properties.NAME_EN])
        if(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1][props.selectedKey[0]] > 0)
            return '#0aa5c2'
        return'#999'
      })
      .on('mouseenter',(d:any) => {
        d3.select('.tooltip')
          .style('display','inline')
          .style("left", `${d3.event.pageX + 5}px`)		
          .style("top", `${d3.event.pageY - 10}px`);	
        d3.select('.tooltipCountry')
          .html(d.properties.NAME_EN)
        
        if(props.data[d.properties.NAME_EN]) {
          d3.select('.tooltipConfirmed')
            .html(`<span class="bold red">${props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['value']}</span> (<span class="bold red">${(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['valuePer1000']).toFixed(1)}</span> per 100K)`)
          d3.select('.tooltipDeath')
            .html(`<span class="bold">${props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1]['value']}</span> (<span class="bold">${(props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1]['value'] * 100 / props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['value']).toFixed(1)}%</span> Mortality rate)`)
        } else {
          d3.select('.tooltipConfirmed')
            .html(`<span class="bold red">0</span>`)
          d3.select('.tooltipDeath')
            .html(`<span class="bold red">0</span>`)
        }
      })
      .on('mousemove',(d:any) => {
        d3.select('.tooltip')
          .style("left", `${d3.event.pageX + 5}px`)		
          .style("top", `${d3.event.pageY - 10}px`);	
      })
      .on('mouseout',(d:any) => {
        d3.select('.tooltip')
          .style('display','none')
      })
      .on('click',(d:any) => {
        props.onCountryClick(d.properties.NAME_EN)
      });

    //for adding bubbles or circle on the map
    zoomGroup
      .selectAll('.bubble')
      .data(mapShapeData.features.filter((d:any) => props.data[d.properties.NAME_EN]))
      .enter()
      .append('circle')
      .attr('class', `bubble`)
      .attr('cx',(d:any) => path.centroid(d)[0])
      .attr('cy',(d:any) => path.centroid(d)[1])
      .attr('fill','#e01a25')
      .attr('fill-opacity',0.15)
      .attr('stroke','#e01a25')
      .attr('stroke-width',1)
      .attr('r', (d:any) => {
        if(props.data[d.properties.NAME_EN])
          return rScale(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1][props.selectedKey[0]])
        return 0
      })
      .on('mouseenter',(d:any) => {
        d3.select('.tooltip')
          .style('display','inline')
          .style("left", `${d3.event.pageX + 5}px`)		
          .style("top", `${d3.event.pageY - 10}px`);	
        d3.select('.tooltipCountry')
          .html(d.properties.NAME_EN)
        d3.select('.tooltipConfirmed')
          .html(`<span class="bold red">${props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['value']}</span> (<span class="bold red">${(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['valuePer1000']).toFixed(1)}</span> per 100K)`)
        d3.select('.tooltipDeath')
          .html(`<span class="bold">${props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1]['value']}</span> (<span class="bold">${(props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1]['value'] * 100 / props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['value']).toFixed(1)}%</span> Mortality rate)`)
      })
      .on('mousemove',(d:any) => {
        d3.select('.tooltip')
          .style("left", `${d3.event.pageX + 5}px`)		
          .style("top", `${d3.event.pageY - 10}px`);	
      })
      .on('mouseout',(d:any) => {
        d3.select('.tooltip')
          .style('display','none')
      })
      .on('click',(d:any) => {
          if(props.data[d.properties.NAME_EN])
            props.onCountryClick(d.properties.NAME_EN)
      });
      zoomGroup
        .selectAll('.deathBubble')
        .data(mapShapeData.features.filter((d:any) => props.data[d.properties.NAME_EN]))
        .enter()
        .append('circle')
        .attr('class', `deathBubble`)
        .attr('cx',(d:any) => path.centroid(d)[0])
        .attr('cy',(d:any) => path.centroid(d)[1])
        .attr('fill','#414141')
        .attr('fill-opacity',0.75)
        .attr('stroke','#414141')
        .attr('stroke-width',0.25)
        .attr('r', (d:any) => {
          if(props.data[d.properties.NAME_EN])
            return rScale(props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1][props.selectedKey[0]])
          return 0
        })
        .on('mouseenter',(d:any) => {
          d3.select('.tooltip')
            .style('display','inline')
            .style("left", `${d3.event.pageX + 5}px`)		
            .style("top", `${d3.event.pageY - 10}px`);	
          d3.select('.tooltipCountry')
            .html(d.properties.NAME_EN)
          d3.select('.tooltipConfirmed')
            .html(`<span class="bold red">${props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['value']}</span> (<span class="bold red">${(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['valuePer1000']).toFixed(1)}</span> per 100K)`)
          d3.select('.tooltipDeath')
            .html(`<span class="bold">${props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1]['value']}</span> (<span class="bold">${(props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1]['value'] * 100 / props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1]['value']).toFixed(1)}%</span> Mortality rate)`)
        })
        .on('mousemove',(d:any) => {
          d3.select('.tooltip')
            .style("left", `${d3.event.pageX + 5}px`)		
            .style("top", `${d3.event.pageY - 10}px`);	
        })
        .on('mouseout',(d:any) => {
          d3.select('.tooltip')
            .style('display','none')
        })
        .on('click',(d:any) => {
            if(props.data[d.properties.NAME_EN])
              props.onCountryClick(d.properties.NAME_EN)            
        });
  },[]);
  useEffect(()=> {
    d3.select(mapNode).selectAll('.country')
      .attr('opacity',(d:any) => {
        if(props.country === 'World') return 1
        if(d.properties.NAME_EN === props.country) return 1
        return 0.2
      })
    d3.select(mapNode).selectAll('.bubble')
      .attr('opacity',(d:any) => {
        if(props.country === 'World') return 1
        if(d.properties.NAME_EN === props.country) return 1
        return 0.2
      })
    d3.select(mapNode).selectAll('.deathBubble')
      .attr('opacity',(d:any) => {
        if(props.country === 'World') return 1
        if(d.properties.NAME_EN === props.country) return 1
        return 0.2
      })

  },[props.country])
  useEffect(()=> {
    const rScale = d3.scaleSqrt()
      .domain([0,props.selectedKey[1]])
      .range([0,50])
    d3.select(mapNode).selectAll('.bubble')
      .attr('r', (d:any) => {
        if(props.data[d.properties.NAME_EN]){
          return rScale(props.data[d.properties.NAME_EN]['confirmedData'][props.data[d.properties.NAME_EN]['confirmedData'].length - 1][props.selectedKey[0]])
        }
        return 0
      })
    d3.select(mapNode).selectAll('.deathBubble')
      .attr('r', (d:any) => {
        if(props.data[d.properties.NAME_EN])
          return rScale(props.data[d.properties.NAME_EN]['deathData'][props.data[d.properties.NAME_EN]['deathData'].length - 1][props.selectedKey[0]])
        return 0
      })

  },[props.selectedKey])

  useEffect(() => {
    const rScale = d3.scaleSqrt()
      .domain([0,props.selectedKey[1]])
      .range([0,50])
      
    d3.select(mapNode).selectAll('.country')
      .attr('fill', (d:any) => {
        if(props.data[d.properties.NAME_EN])
          if(props.data[d.properties.NAME_EN]['confirmedData'][props.index - 1][props.selectedKey[0]] > 0)
            return '#0aa5c2'
        return'#aaa'
      })
      .attr('stroke',(d:any) => {
        if(props.data[d.properties.NAME_EN])
        if(props.data[d.properties.NAME_EN]['confirmedData'][props.index - 1][props.selectedKey[0]] > 0)
            return '#0aa5c2'
        return'#999'
      })
    d3.select(mapNode).selectAll('.bubble')
      .transition()
      .duration(200)
      .attr('r', (d:any) => {
        if(props.data[d.properties.NAME_EN]){
          return rScale(props.data[d.properties.NAME_EN]['confirmedData'][props.index - 1][props.selectedKey[0]])
        }
        return 0
      })
    d3.select(mapNode).selectAll('.deathBubble')
      .transition()
      .duration(200)
      .attr('r', (d:any) => {
        if(props.data[d.properties.NAME_EN])
          return rScale(props.data[d.properties.NAME_EN]['deathData'][props.index - 1][props.selectedKey[0]])
        return 0
      })

  },[props.index])
  
  return ( 
    <div>
      <div className='mapHeader'>
        <div className='dateContainer'>
          <div className='date'>{d3.timeFormat("%B %d")(props.data[Object.keys(props.data)[0]]['confirmedData'][props.index - 1]['date'])}</div>
          <div className='replay'
            onClick={props.replay}
          >
            ⭮ Replay
          </div>
        </div>
        <div className='tabContainer'>
          <div 
            className= {props.selectedKey[0] === 'value' ? 'tab selected' : 'tab'}
            onClick={() => props.onToggleClick(['value',100000])}
          >
            Total Cases
          </div>
          <div 
            className= {props.selectedKey[0] === 'valuePer1000' ? 'tab selected' : 'tab'}
            onClick={() => props.onToggleClick(['valuePer1000',1000])}
          >
            Total Cases Per 100K
          </div>
          <div 
            className= {props.selectedKey[0] === 'new' ? 'tab selected' : 'tab'}
            onClick={() => props.onToggleClick(['new',10000])}
          >
            New Cases
          </div>
        </div>
      </div>
      <div className='title'>
        <div className='bold'>{props.country}</div>
        <div className='confirmedTitleMap'> Confirmed: <span className='bold red'>{props.data[props.country] ? props.data[props.country]['confirmedData'][props.index - 1]['value'] : 0}</span> (<span className='bold red'>{props.data[props.country] ? (props.data[props.country]['confirmedData'][props.index - 1]['valuePer1000']).toFixed(1) : 0}</span> per 100K) | New: <span className='bold red'>{props.data[props.country] ? props.data[props.country]['confirmedData'][props.index - 1]['new'] : 0}</span></div>
        <div> Deaths: <span className='deathTitle bold'>{props.data[props.country] ? props.data[props.country]['deathData'][props.index - 1]['value'] : 0}</span> (<span className='bold'>{props.data[props.country] ? (props.data[props.country]['deathData'][props.index - 1]['value'] * 100 / props.data[props.country]['confirmedData'][props.index - 1]['value'] ).toFixed(1) : 0}%</span> Mortality rate) | New: <span className='bold'>{props.data[props.country] ? props.data[props.country]['deathData'][props.index - 1]['new'] : 0}</span></div>
      </div>
      <svg width={props.width} height={props.height - 160} ref={node => mapNode = node} />
    </div>
  )
}

export default Map