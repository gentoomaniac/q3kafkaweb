import React from 'react';

import ColoredText from "./ColoredText";

const KillMessage = (props) => {
  const msg = props.msg
  if (msg.actor_name === "<world>" && msg.weapon_name === "MOD_FALLING") {
      return (
        <>
          <ColoredText text={msg.target_name} /> cratered
        </>
      );
  } else if (msg.actor_name === "<world>" && msg.weapon_name === "MOD_TRIGGER_HURT") {
      return (
        <>
          <ColoredText text={msg.target_name} /> was in the wrong place
        </>
      );
  } else if (msg.actor_name === msg.target_name) {
      return (
        <>
          <ColoredText text={msg.target_name} /> blew itself up
        </>
      );
  }

  return (
    <>
      <ColoredText text={msg.target_name} /> got fragged by <ColoredText text={msg.actor_name} />
    </>
  );
}

export default KillMessage;