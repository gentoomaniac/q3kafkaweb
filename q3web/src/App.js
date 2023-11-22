import './App.css';
import { useEffect } from 'react';

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

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
        <div>
          <button className="btn btn-light" onClick={() => setupSocketIO()}>connect</button>
        </div>
        <div className="Scroll-box" id="kill_div">
          <KillEvents />
        </div>
        <div className="Scroll-box" id="chat_div"></div>
        <div className="content" id="toplist">

        </div>
      </header>
    </div>
  );
}

export default App;
