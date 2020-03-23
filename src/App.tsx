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
      <header className='appHeader'>
        <h1 className='headerTitle'>COVID 19 Dashboard</h1>
        <div className='icons'>
          <FacebookShareButton className="fbIcon" url={'https://covid19.mustafasaifee.com'} quote={'Live dashboard visualizing the spread of coronavirus COVID-19'}>
            <FacebookIcon size={28} round={true} />
          </FacebookShareButton>
          <TwitterShareButton url={'https://covid19.mustafasaifee.com'} title={'Live dashboard visualizing the spread of coronavirus COVID-19 via @mustafasaifee42'}>
            <TwitterIcon size={28} round={true} />
          </TwitterShareButton>
        </div>
      </header>
      <main>
        <Visualization
          width={windowWidthValue}
          height={windowHeightValue}
        />
      </main>
      <footer className='footer'>
        <span>Made by <a href="https://mustafasaifee.com/" rel="noopener noreferrer" target="_blank">Mustafa Saifee</a> | Follow me on <a href="https://twitter.com/mustafasaifee42" rel="noopener noreferrer" target="_blank">twitter</a> | <a href="https://github.com/CSSEGISandData/COVID-19"  rel="noopener noreferrer" target="_blank">Data Source: John Hopkins University CSSE</a> | <a href="https://github.com/mustafasaifee42/Covid-19-dashboard"  rel="noopener noreferrer" target="_blank">Open Source Code</a> | Spread the information and stay safe</span>
        <div className='icons'>
          <FacebookShareButton className="fbIcon" url={'https://covid19.mustafasaifee.com'} quote={'Live dashboard visualizing the spread of COVID-19 coronavirus'}>
            <FacebookIcon size={24} round={true} />
          </FacebookShareButton>
          <TwitterShareButton url={'https://covid19.mustafasaifee.com'} title={'Live dashboard visualizing the spread of COVID-19 coronavirus via @mustafasaifee42'}>
            <TwitterIcon size={24} round={true} />
          </TwitterShareButton>
        </div>
      </footer>
    </div>
  );
}

export default App;
