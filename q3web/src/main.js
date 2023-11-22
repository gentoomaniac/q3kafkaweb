import React, { useState } from 'react';
import { io } from 'socket.io-client';

var session_id;
var GameState = { 'players': {}, 'weapons': {}};

var Events = [];
var forceUpdateKillEvents;

var sio = null;

const WORLD_ID = "1022"
const COLORS = {
  "0": "black",
  "1": "red",
  "2": "green",
  "3": "yellow",
  "4": "blue",
  "5": "cyan",
  "6": "pink",
  "7": "white",
  "8": "orange"
};

const WeaponIcons = {
  'MOD_GAUNTLET': 'img/iconw_gauntlet_32.png',
  'MOD_MACHINEGUN': 'img/iconw_machinegun_32.png',
  'MOD_SHOTGUN': 'img/iconw_shotgun_32.png',
  'MOD_GRENADE': 'img/iconw_grenade_32.png',
  'MOD_LIGHTNING': 'img/iconw_lightning_32.png',
  'MOD_PLASMA': 'img/iconw_plasma_32.png',
  'MOD_PLASMA_SPLASH': 'img/iconw_plasma_32.png',
  'MOD_RAILGUN': 'img/iconw_railgun_32.png',
  'MOD_ROCKET': 'img/iconw_rocket_32.png',
  'MOD_ROCKET_SPLASH': 'img/iconw_rocket_32.png',
  'MOD_BFG': 'img/iconw_bfg_32.png',
  'MOD_TRIGGER_HURT': 'img/world_kill_32.png',
  'MOD_FALLING': 'img/world_kill_32.png',
  'MOD_TELEFRAG': 'img/teleporter_32.png',
  'NO_ICON': 'img/no_icon_32.png'
}
function getWeaponIcon(key) {
  return key in WeaponIcons ? WeaponIcons[key] : WeaponIcons['NO_ICON'];
}


function getNewWeaponDict(name){
    return {'name': name, 'kills': 0};
}

function getNewPlayerDict(){
    return {'kills': 0, 'frags': 0, 'deaths': 0};
}

function getPlayerByName(name) {
  Object.keys(GameState.players).forEach(function (key) {
    console.log("checking player: " + GameState.players[key]);
    if (GameState.players[key].name === name) return GameState.players[key];
  });

  return null;
}

export function setupSocketIO() {
  sio = io("/events");
  sio.on("connect", function () {
    console.log("Websocket connecting...");
  });
  sio.on("event", function (msg) {
    msg = JSON.parse(msg);
    eventHandler(msg);
  });
  sio.on("connected", function (msg) {
    session_id = msg.session_id;
    console.log("Websocket connected");
    var url = new URL(window.location.href);
    var match_id = url.searchParams.get("match_id");
    console.log("Requesting game: " + match_id);
    sio.emit("subscribe", match_id);
  });
  sio.on("disconnect", function () {
    console.log("Websocket disconnected.");
  });
}

export function disconnectSocketIO() {
  sio.disconnect();
}

function eventHandler(msg) {
  Events.push(msg);
  switch (msg.event) {
    case "ClientConnect":
      onClinetConnect(msg);
      break;

    case "ClientDisconnect":
      onClinetConnect(msg);
      break;

    case "ClientUserinfoChanged":
      onClientUserinfoChanged(msg);
      break;

    case "Item":
      onItem(msg);
      break;

    case "Kill":
      onKillEvent(msg);
      console.log(GameState);
      break;

    case "say":
    case "sayteam":
    case "tell":
      onChatEvent(msg);
      break;

    default:
      console.log("Unhandled event: " + JSON.stringify(msg));
  }
}

function onKillEvent(msg) {
  // {'timestamp': '2019-03-31T10:35:07.853901', 'event': 'Kill', 'actor_id': '3', 'target_id': '2', 'weapon_id': '1',
  // 'actor_name': 'Bitterman', 'target_name': 'Hunter', 'weapon_name': 'MOD_SHOTGUN'}
  console.log(msg);

  if ( !(msg.weapon_id in GameState.weapons)){
    GameState.weapons[msg.weapon_id] = getNewWeaponDict(msg.weapon_name);
  }
  GameState.weapons[msg.weapon_id].kills++;

  if (msg.actor_id !== WORLD_ID) {
    GameState.players[msg.actor_id].kills++;
    GameState.players[msg.target_id].frags++;
  } else {
    GameState.players[msg.target_id].deaths++;
  }
  forceUpdateKillEvents();
}

function onClinetConnect(msg) {
  // {"timestamp": "2019-03-31T12:11:44.846638", "event": "ClientConnect", "client_id": "0"}
  GameState.players[msg.client_id] = getNewPlayerDict();
}

function onClientUserinfoChanged(msg) {
  // {"timestamp": "2019-03-31T12:11:44.848543", "event": "ClientUserinfoChanged", "client_id": "0",
  // "client_info": "n\\Visor\\t\\0\\model\\visor\\hmodel\\visor\\c1\\4\\c2\\5\\hc\\70\\w\\0\\l\\0\\skill\\    2.00\\tt\\0\\tl\\0"}
  GameState.players[msg.client_id] = {...GameState.players[msg.client_id], ...msg};
}

function onItem(msg) {
  // {'timestamp': '2019-03-31T13:11:25.061939', 'event': 'Item', 'item_whatever': '2', 'item': 'item_armor_shard'}
}

function onChatEvent(msg) {
  // {"timestamp":"2019-03-31T23:09:23.210974","event":"tell","actor_name":"Visor","target_name":"Major","msg":"Ms. Major, Sir follow me"}
  //$('#chat_table tbody').prepend(chatEventToHTML(msg));
}

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

// TODO: add popup on player with player stats
export function KillEvents() {
  const [, updateState] = React.useState();
  forceUpdateKillEvents = React.useCallback(() => updateState({}), []);

  const kills = Events.filter(event =>
    event.event === 'Kill'
  );
  const listItems = kills.toReversed().map((k, index) =>
    <li key={index}>
      <div className="card w-100">
      <div className="card-body">
        <img src={getWeaponIcon(k.weapon_name)} alt={k.weapon_name} />
        <h5 className="card-title">{new Date(k.timestamp).toLocaleTimeString()}</h5>
        <p className="card-text"><GetKillMessage msg={k} /></p>
      </div>
    </div>

    </li>
  );
  return <ul className="no-bullets">{listItems}</ul>;
}

function GetKillMessage(props) {
  const msg = props.msg
  if (msg.actor_name === "<world>" && msg.weapon_name === "MOD_FALLING") {
      return <span><ColoredText text={msg.target_name} /> cratered</span>;
  } else if (msg.actor_name === "<world>" && msg.weapon_name === "MOD_TRIGGER_HURT") {
      return <span><ColoredText text={msg.target_name} /> was in the wrong place</span>;
  } else if (msg.actor_name === msg.target_name) {
      return <span><ColoredText text={msg.target_name} /> blew itself up</span>;
  }

  return <span><ColoredText text={msg.target_name} /> got fragged by <ColoredText text={msg.actor_name} /></span>;
}

function ColoredText(props) {
  const splits = props.text.split("^");
  if (splits[0] === '')
    splits.shift();

  const colorFragments = splits.map(item => {
      // if text fragment starts with a digit it is color formatted
      // TODO: There's an edgecase where a text started with a number.
      // The split removed the ^. The empty first element would indicate
      // if it was a plain character or a color format digit
      if (/^\d+$/.test(item[0]))
        return <ColorSpan item={item.substring(1)} color={item[0]} />;
      else
        return <span>{item}</span>
  });
  return colorFragments;
}

function ColorSpan(props) {
  if (props.color in COLORS)
    return <span className={COLORS[props.color]}>{props.item}</span>;
  else
    return <span>{props.item}</span>;
}
