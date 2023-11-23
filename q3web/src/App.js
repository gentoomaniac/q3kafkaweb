import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import { Events } from './main';

import Layout from "./components/Layout/Layout";
import ConnectPanel from "./components/ConnectPanel";
import KillEventsViewer from "./components/KillEventsViewer";
import ChatViewer from "./components/ChatViewer";
import GameEndedPopup from "./components/GameEndedPopup";

function App() {
  return (
    <Layout>
        <div>
          <ConnectPanel/>
        </div>
        <div>
          <KillEventsViewer events={Events} />
        </div>
        <div>
          <ChatViewer events={Events} />
        </div>
        <div className="content" id="toplist">

        </div>
    </Layout>
  );
}

export default App;
