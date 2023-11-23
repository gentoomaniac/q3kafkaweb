import React from 'react';
import './GameEndedPopup.css';


export let UpdateGameEndedPopup;

const GameEndedPopup = (props) => {
  const [, updateState] = React.useState();
  UpdateGameEndedPopup = React.useCallback(() => updateState({}), []);

  if(props.show) {
    return (
      <>
        <div className="game-ended">Game ended</div>
      </>
    )
  }
  return
}

export default GameEndedPopup;
