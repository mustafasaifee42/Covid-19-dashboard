import React, {useState} from 'react';
import ScatterPlot from './ScatterPlot';
import ScatterPlot1 from './ScatterPlot1';
import BarChart from './BarChart';
import BarChart1 from './BarChart1';

const Sidebar: React.FunctionComponent<{width:number, data:any, setCountry:(e:string) => void  }> = (props) => {
  const [country, setCountry] = useState("World")
  let data = Object.keys(props.data).map((d:string) => {
    let obj = {
      'country': d, 
      "Testing Data":props.data[d]['latestData']["Testing Data"],
      "Testing Data Per 100K":props.data[d]['latestData']["Testing Data Per 100K"],
      "Confirmed Cases":props.data[d]['latestData']["Confirmed Cases"],
      "Confirmed Cases Per 100K":props.data[d]['latestData']["Confirmed Cases Per 100K"],
      "Update Date":props.data[d]['latestData']["Test Data Last Update"],
      "Positive Tests":props.data[d]['latestData']["Positive Tests"]
    }
    return obj
  })

  data = data.filter((d:any,i:any) => d["Testing Data"] !== 0)

  return ( 
    <div style={{ width: `${props.width}px`, height:`calc(100vh - ${130}px`, overflow:'auto', overflowX:'hidden' }}>
      <div style={{ width: `${props.width}px`, display:'flex' }}>
        <div>
          <div className="dataCard" style={{ width: `${props.width / 2 - 40}px`, margin:`20px 10px 10px 20px`, padding:'0' }}>
            <h3 className='cardTitle'>
              Test conducted v/s confirmed cases <span className="cardTitleSubNote">(Log scale)</span>
            </h3>
            <ScatterPlot1
              width={props.width / 2 - 40}
              height={(props.width / 2 - 40)*0.75}
              xDomain={[10,1000000]}
              yDomain={[1,500000]}
              xAxis={'Testing Data'}
              yAxis={'Confirmed Cases'}
              xAxisLabel={'No. of Tests'}
              yAxisLabel={'No. of Confirmed Cases'}
              country={country}
              setCountry={(e) => { setCountry(e) ; props.setCountry(e)  }}
              class={'ScatterPlot1'}
              data={data}
            />
          </div>
        </div>
        <div>
          <div className="dataCard" style={{ width: `${props.width / 2 - 40}px`, margin:`20px 0px 10px 10px`, padding:'0' }}>
            <h3 className='cardTitle'>
              Test conducted v/s confirmed cases Per 100K <span className="cardTitleSubNote">(Log scale)</span>
            </h3>
            <ScatterPlot
              width={props.width / 2 - 40}
              height={(props.width / 2 - 40)*0.75}
              xDomain={[1,10000]}
              yDomain={[0.01,1000]}
              xAxis={'Testing Data Per 100K'}
              yAxis={'Confirmed Cases Per 100K'}
              xAxisLabel={'No. of Tests Per 100K'}
              yAxisLabel={'No. of Confirmed Cases Per 100K'}
              country={country}
              setCountry={(e) => { setCountry(e) ; props.setCountry(e)  }}
              class={'ScatterPlot2'}
              data={data}
            />
          </div>
        </div>
      </div>
      <div style={{ width: `${props.width}px`, display:'flex' }}>
        <div>
          <div className="dataCard" style={{ width: `${props.width / 2 - 40}px`, margin:`10px 10px 20px 20px`, padding:'0' }}>
            <h3 className='cardTitle'>
              No.of Test conducted
            </h3>
            <BarChart
              width={props.width / 2 - 40}
              height={data.length * 14 + 30 }
              xDomain={[0,900000]}
              xAxis={'Testing Data'}
              country={country}
              setCountry={(e) => { setCountry(e) ; props.setCountry(e)  }}
              data={data}
            />
          </div>
        </div>
        <div>
          <div className="dataCard" style={{ width: `${props.width / 2 - 40}px`, margin:`10px 0px 20px 10px`, padding:'0' }}>
            <h3 className='cardTitle'>
              No. of Test conducted Per 100K
            </h3>
            <BarChart1
              width={props.width / 2 - 40}
              height={data.length * 14 + 30}
              xDomain={[0,5000]}
              xAxis={'Testing Data Per 100K'}
              country={country}
              setCountry={(e) => { setCountry(e) ; props.setCountry(e)  }}
              data={data}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar;
