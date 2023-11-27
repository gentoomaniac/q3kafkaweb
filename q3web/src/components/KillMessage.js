import React from 'react';

import {GetPlayerIcon} from "../GameState";
import ColoredText from "./ColoredText";

const KillMessage = (props) => {
  const msg = props.msg
  console.log(msg)
  const actorIcon = GetPlayerIcon(msg.actor_id);
  console.log(actorIcon)
  const targetIcon = GetPlayerIcon(msg.target_id);
  console.log(targetIcon)
  if (msg.actor_name === "<world>" && msg.weapon_name === "MOD_FALLING") {
      return (
        <>
          <img className="actor-icon" src={targetIcon} alt={msg.target_name} /> <ColoredText text={msg.target_name} /> cratered
        </>
      );
  } else if (msg.actor_name === "<world>" && msg.weapon_name === "MOD_TRIGGER_HURT") {
      return (
        <>
          <img className="actor-icon" src={targetIcon} alt={msg.target_name} /> <ColoredText text={msg.target_name} /> was in the wrong place
        </>
      );
  } else if (msg.actor_name === msg.target_name) {
      return (
        <>
          <img className="actor-icon" src={targetIcon} alt={msg.target_name} /> <ColoredText text={msg.target_name} /> blew itself up
        </>
      );
  }

  return (
    <>
      <img className="actor-icon" src={actorIcon} alt={msg.actor_name} /> <ColoredText text={msg.actor_name} /> fragged <ColoredText text={msg.target_name} /> <img className="target-icon" src={targetIcon} alt={msg.target_name} />
    </>
  );
}

export default KillMessage;