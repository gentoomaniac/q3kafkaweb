export let GameState = { 'players': {}, 'weapons': {} };


const GetPlayerByName = (name) => {
  Object.keys(GameState.players).forEach(function (key) {
    console.log("checking player: " + GameState.players[key]);
    if (GameState.players[key].name === name) return GameState.players[key];
  });
  return null;
}

export const GetPlayerIcon = (playerId) => {
  if (playerId in GameState.players)
    return "/img/players/"+GameState.players[playerId].model+".png";
  return "";
}

export default GameState;
