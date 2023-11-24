import React from 'react';

import { io } from 'socket.io-client';

import {UpdateKillEvents} from "./components/KillEventsViewer";
import {UpdateChatEvents} from "./components/ChatViewer";
import {UpdateGameEndedPopup} from "./components/GameEndedPopup";
import {UpdateWeaponKillsPie} from "./components/WeaponKillsPie";
import {UpdateMapImage, SetMap  } from "./components/MapImage";

export let GameState = { 'players': {}, 'weapons': {}};

export let Events = [];


var sio = null;

const WORLD_ID = "1022"


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
    case "loaded map":
      onLoadedMap(msg);
      break;

    case "ClientConnect":
      onClientConnect(msg);
      break;

    case "ClientDisconnect":
      onClientDisconnect(msg);
      break;

    case "ClientUserinfoChanged":
      onClientUserinfoChanged(msg);
      break;

    case "Item":
      onItem(msg);
      break;

    case "Kill":
      onKillEvent(msg);
      break;

    case "broadcast":
    case "say":
    case "sayteam":
    case "tell":
      onChatEvent(msg);
      break;

    case "Exit":
      onChatEvent(msg);
      break;

    default:
      console.log("Unhandled event: " + JSON.stringify(msg));
  }
}

function onLoadedMap(msg) {
  // {"timestamp":"2023-11-24T17:16:16.920181","event":"loaded map","map":"q3dm17","match_id":"0dff2517-cd1f-4e88-9315-56234cead1e0"}
  SetMap(msg.map);
  UpdateMapImage();
}

function onKillEvent(msg) {
  // {'timestamp': '2019-03-31T10:35:07.853901', 'event': 'Kill', 'actor_id': '3', 'target_id': '2', 'weapon_id': '1',
  // 'actor_name': 'Bitterman', 'target_name': 'Hunter', 'weapon_name': 'MOD_SHOTGUN'}
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
  UpdateKillEvents();
  //UpdateWeaponKillsPie();
}

function onClientConnect(msg) {
  // {"timestamp": "2019-03-31T12:11:44.846638", "event": "ClientConnect", "client_id": "0"}
  GameState.players[msg.client_id] = getNewPlayerDict();
}

function onClientDisconnect(msg) {
  // {"timestamp": "2019-03-31T12:11:44.846638", "event": "ClientConnect", "client_id": "0"}
  // TODO: This should become more explicit to keep track of join and leave times
  GameState.players[msg.client_id] = {...GameState.players[msg.client_id], ...msg};
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
  UpdateChatEvents();
}

