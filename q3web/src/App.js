import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import { Events, GameState } from './main';
import WeaponKillsPie from "./components/WeaponKillsPie.js";
import PlayerKillsPie from "./components/PlayerKillsPie.js";

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
            <WeaponKillsPie gameState={GameState} />
          </div>
          <div className="playersChart">
            <PlayerKillsPie gameState={GameState} />
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
