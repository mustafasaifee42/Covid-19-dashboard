import React, {useState} from 'react';
import Visualization from  './Visualization';
import { FacebookIcon, TwitterIcon } from 'react-share';
import { FacebookShareButton, TwitterShareButton } from 'react-share';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-161398132-1');
ReactGA.set({ anonymizeIp: true });
ReactGA.pageview('/');

function App() {
  const [ windowWidthValue, setWindowWidthValue ] = useState(window.innerWidth)
  const [ windowHeightValue, setWindowHeightValue ] = useState(window.innerHeight)
  window.onresize = () => {
    setWindowWidthValue(window.innerWidth)
    if(window.innerWidth > 760) setWindowHeightValue(window.innerHeight)
  };
  return (
    <div className="App">
      <div className='appHeader'>
        <div className='headerTitle'>COVID 19 Dashboard</div>
          <div className='icons'>
            <FacebookShareButton className="fbIcon" url={'https://coronavirus-dashboard.netlify.com/'} quote={'Live dashboard visualizing the spread of coronavirus COVID-19'}>
              <FacebookIcon size={28} round={true} />
            </FacebookShareButton>
            <TwitterShareButton url={'https://coronavirus-dashboard.netlify.com/'} title={'Live dashboard visualizing the spread of coronavirus COVID-19 https://coronavirus-dashboard.netlify.com/ via @mustafasaifee42'}>
              <TwitterIcon size={28} round={true} />
            </TwitterShareButton>
          </div>
      </div>
      <Visualization
        width={windowWidthValue}
        height={windowHeightValue}
      />
      <div className='footer'>
        <span>Made by <a href="https://twitter.com/mustafasaifee42" rel="noopener noreferrer" target="_blank">Mustafa Saifee</a> | <a href="https://github.com/CSSEGISandData/COVID-19"  rel="noopener noreferrer" target="_blank">Data Source</a> | <a href="https://github.com/mustafasaifee42/Covid-19-dashboard"  rel="noopener noreferrer" target="_blank">Open Source Code</a> | Spread the information and stay safe</span>
        <div className='icons'>
          <FacebookShareButton className="fbIcon" url={'https://coronavirus-dashboard.netlify.com/'} quote={'Live dashboard visualizing the spread of coronavirus COVID-19'}>
            <FacebookIcon size={24} round={true} />
          </FacebookShareButton>
          <TwitterShareButton url={'https://coronavirus-dashboard.netlify.com/'} title={'Live dashboard visualizing the spread of coronavirus COVID-19 https://coronavirus-dashboard.netlify.com/ via @mustafasaifee42'}>
            <TwitterIcon size={24} round={true} />
          </TwitterShareButton>
        </div>
      </div>
    </div>
  );
}

export default App;
