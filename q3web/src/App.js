import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import { Events } from './main';

import Layout from "./components/Layout/Layout";
import ConnectPanel from "./components/ConnectPanel";
import KillEventsViewer from "./components/KillEventsViewer";

function App() {
  return (
    <Layout>
        <ConnectPanel/>
        <KillEventsViewer events={Events} />
        <div className="Scroll-box" id="chat_div"></div>
        <div className="content" id="toplist">

        </div>
    </Layout>
  );
}

export default App;
