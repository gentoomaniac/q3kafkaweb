import './App.css';
import { useEffect } from 'react';
import { setupSocketIO, disconnectSocketIO, KillEvents } from './main';

function App() {
  useEffect(() => {
    //setupSocketIO();
    return () => {
      //disconnectSocketIO();
    };
  },[]);
  return (
    <div className="App">
      <header className="App-header">
        <div className="Scroll-box" id="kill_div">
          <KillEvents />
        </div>
        <div className="Scroll-box" id="chat_div"></div>
        <div className="content" id="toplist">
          <canvas id="myChart"></canvas>
        </div>
      </header>
    </div>
  );
}

export default App;
