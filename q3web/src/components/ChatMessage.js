import React from 'react';
import './ChatMessage.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullhorn, faComment, faUserGroup, faArrowRight, faEnvelope } from '@fortawesome/free-solid-svg-icons'

import ColoredText from "./ColoredText";

const ChatMessage = (props) => {
  const event = props.event;
  switch (event.event) {
    case "broadcast":
      return (
        <>
          <span className="timestamp">{new Date(event.timestamp).toLocaleTimeString()}</span>
          <FontAwesomeIcon icon={faBullhorn} />: <ColoredText text={event.broadcast_message} />
        </>
      );

    case "Exit":
      return (
        <>
          <span className="timestamp">{new Date(event.timestamp).toLocaleTimeString()}</span>
          <FontAwesomeIcon icon={faBullhorn} />: <ColoredText text={event.msg} />
        </>
      );

    case "say":
      return (
        <>
          <span className="timestamp">{new Date(event.timestamp).toLocaleTimeString()}</span>
          <FontAwesomeIcon icon={faComment} /> <ColoredText text={event.actor_name} />: <ColoredText text={event.msg} />
        </>
      );

    case "sayteam":
      const players = props.gameState.players
      var player
      Object.keys(players).forEach(x => player = players[x].name === event.actor_name ? players[x]: player);
      let teamName = "team_" + player.team;
      let teamIcon = "/img/team_" + player.team + ".png";
      return (
        <>
          <span className="timestamp">{new Date(event.timestamp).toLocaleTimeString()}</span>
          <img className="team-icon" src={teamIcon} alt={teamName} /> <ColoredText text={event.actor_name} />: <ColoredText text={event.msg} />
        </>
      );

    case "tell":
      return (
        <>
          <span className="timestamp">{new Date(event.timestamp).toLocaleTimeString()}</span>
          <FontAwesomeIcon icon={faEnvelope} /> <ColoredText text={event.actor_name} /> <FontAwesomeIcon icon={faArrowRight} /> <ColoredText text={event.target_name} />: <ColoredText text={event.msg} />
        </>
      );

    default:
      return
  };
}

export default ChatMessage;
