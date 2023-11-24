import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import { Events, GameState } from './main';
import SamplePieChart from "./components/WeaponKillsPie.js";

import Layout from "./components/Layout/Layout";
import ConnectPanel from "./components/ConnectPanel";
import KillEventsViewer from "./components/KillEventsViewer";
import ChatViewer from "./components/ChatViewer";
import GameEndedPopup from "./components/GameEndedPopup";

function App() {
  return (
    <Layout>
        <div className='transparent'>
          <ConnectPanel/>
        </div>
        <div className='transparent'>
          <KillEventsViewer events={Events} />
        </div>
        <div className='transparent'>
          <ChatViewer events={Events} />
        </div>
        <div className="content" id="toplist">
          {/* <SamplePieChart gameState={GameState} /> */}
        </div>
    </Layout>
  );
}

export default App;
