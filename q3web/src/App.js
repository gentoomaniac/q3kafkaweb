import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import { Events, GameState } from './main';
import WeaponKillsChart from "./components/WeaponKillsChart.js";
import PlayerKillsChart from "./components/PlayerKillsChart.js";

import Layout from "./components/Layout/Layout";
import ConnectPanel from "./components/ConnectPanel";
import KillEventsViewer from "./components/KillEventsViewer";
import ChatViewer from "./components/ChatViewer";
import GameEndedPopup from "./components/GameEndedPopup";
import MapImage from "./components/MapImage";

function App() {
  return (
    <Layout>
        <div className='transparent'>
          <ConnectPanel/>
          <MapImage />
        </div>
        <div className="charts">
          <div className="weaponsChart">
            <WeaponKillsChart gameState={GameState} />
          </div>
          <div className="playersChart">
            <PlayerKillsChart gameState={GameState} />
          </div>
        </div>
        <div className='transparent'>
          <KillEventsViewer events={Events} />
        </div>
        <div className='transparent'>
          <ChatViewer events={Events} gameState={GameState} />
        </div>
    </Layout>
  );
}

export default App;
