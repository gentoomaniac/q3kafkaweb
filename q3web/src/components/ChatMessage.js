import React from 'react';
import './ChatMessage.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faUserGroup, faArrowRight, faEnvelope } from '@fortawesome/free-solid-svg-icons'

import ColoredText from "./ColoredText";

const ChatMessage = (props) => {
  const event = props.event;
  console.log(event)
  switch (event.event) {
    case "say":
      return (
        <>
          <span className="timestamp">{new Date(event.timestamp).toLocaleTimeString()}</span>
          <ColoredText text={event.actor_name} /> <FontAwesomeIcon icon={faComment} /> <ColoredText text={event.msg} />
        </>
      );

    case "sayteam":
      return (
        <>
          <span className="timestamp">{new Date(event.timestamp).toLocaleTimeString()}</span>
          <ColoredText text={event.actor_name} /> <FontAwesomeIcon icon={faUserGroup} /> <ColoredText text={event.msg} />
        </>
      );

    case "tell":
      return (
        <>
          <span className="timestamp">{new Date(event.timestamp).toLocaleTimeString()}</span>
          <ColoredText text={event.actor_name} /> <FontAwesomeIcon icon={faArrowRight} /> <ColoredText text={event.actor_name} /> <FontAwesomeIcon icon={faEnvelope} /> <ColoredText text={event.msg} />
        </>
      );

    default:
      return
  };
}

export default ChatMessage;

// function chatEventToHTML(msg) {
//   var timestamp = new Date(msg.timestamp);
//   var html = '<tr><td className="fit">' + timestamp.toLocaleTimeString() + "</td>";

//   if (msg.event === "tell") {
//     html +=
//       '<td className="fit">' +
//       ColoredText(msg.actor_name) +
//       '&nbsp;<i className="fas fa-arrow-right"></i> ' +
//       ColoredText(msg.target_name) +
//       '<i className="fas fa-greater-than"></i></td>';
//   } else if (msg.event === "say") {
//     html +=
//       '<td className="fit">' +
//       ColoredText(msg.actor_name) +
//       '&nbsp;<i className="fas fa-greater-than"></i></td>';
//   } else if (msg.event === "sayteam") {
//     if (msg.team)
//       var team_icon = '<img src="static/img/team' + msg.team + '_32.png">';
//     else var team_icon = '<i className="fas fa-video"></i>';
//     // {"timestamp":"2019-03-31T23:33:03.210875","event":"sayteam","actor_name":"Visor","msg":"I am the team leader"}
//     html +=
//       '<td className="fit">' +
//       team_icon +
//       "&nbsp;" +
//       ColoredText(msg.actor_name) +
//       '&nbsp;<i className="fas fa-greater-than"></i></td>';
//   }

//   html += "<td>" + ColoredText(msg.msg) + "</td></tr>";
//   return html;
// }
