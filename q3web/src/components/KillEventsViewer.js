// TODO: add popup on player with player stats
import React from 'react';
import './KillEventsViewer.css';

import KillMessage from "./KillMessage";
import GetWeaponIcon from "./WeaponIcons";

export let UpdateKillEvents;

const KillEventsViewer = (props) => {
  const [, updateState] = React.useState();
  UpdateKillEvents = React.useCallback(() => updateState({}), []);

  const kills = props.events.filter(event =>
    event.event === 'Kill'
  );
  const listItems = kills.toReversed().map((k, index) =>
    <li key={index}>
      <div className="card w-100">
      <div className="card-body">
        <p className="card-text">
          <img className="card-icon" src={GetWeaponIcon(k.weapon_name)} alt={k.weapon_name} />
          <p>
            <span className="timestamp">{new Date(k.timestamp).toLocaleTimeString()}</span>
            <KillMessage msg={k} />
          </p>
        </p>
      </div>
    </div>

    </li>
  );
  return (
    <>
      <div className="Scroll-box" id="kill_div">
        <ul className="no-bullets">{listItems}</ul>
      </div>
    </>
    );
}

export default KillEventsViewer;