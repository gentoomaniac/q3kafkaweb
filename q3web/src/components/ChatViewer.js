// TODO: add popup on player with player stats
import React from 'react';
import './ChatViewer.css';

import ChatMessage from "./ChatMessage";

export let UpdateChatEvents;

const ChatViewer = (props) => {
  const [, updateState] = React.useState();
  UpdateChatEvents = React.useCallback(() => updateState({}), []);

  const kills = props.events.filter(event =>
    (event.event === 'say' ||
     event.event === 'sayteam' ||
     event.event === 'tell' ||
     event.event === 'broadcast' ||
     event.event === 'Exit')
  );
  const listItems = kills.toReversed().map((k, index) =>
    <li key={index}>
      <div className="card w-100 translucent">
      <div className="card-body">
        <p className="card-text">
        <img className="card-icon" src="" alt={k.weapon_name} />
          <ChatMessage event={k} gameState={props.gameState}/>
        </p>
      </div>
    </div>

    </li>
  );
  return (
    <>
      <div className="Scroll-box" id="chatViewer">
        <ul className="no-bullets">{listItems}</ul>
      </div>
    </>
    );
}

export default ChatViewer;