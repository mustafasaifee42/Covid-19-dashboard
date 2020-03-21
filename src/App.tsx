import React from 'react';
import Visualization from  './Visualization';
import { FacebookIcon, TwitterIcon } from 'react-share';
import { FacebookShareButton, TwitterShareButton } from 'react-share';

function App() {
  return (
    <div className="App">
      <Visualization />
      <div className='footer'>
        <span>Made by <a href="https://twitter.com/mustafasaifee42"  rel="noopener noreferrer" target="_blank">Mustafa Saifee</a>. Spread the information and stay safe</span>
        <div className='icons'>
          <FacebookShareButton className="fbIcon" url={'http://covid-19-dashboard.netlify.com/'} quote={'Live dashboard visualizing the spread of coronavirus COVID-19'}>
            <FacebookIcon size={24} round={true} />
          </FacebookShareButton>
          <TwitterShareButton url={'http://covid-19-dashboard.netlify.com/'} title={'Live dashboard visualizing the spread of coronavirus COVID-19 http://covid-19-dashboard.netlify.com/ via @mustafasaifee42'}>
            <TwitterIcon size={24} round={true} />
          </TwitterShareButton>
        </div>
      </div>
    </div>
  );
}

export default App;
