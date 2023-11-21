
import { io } from 'socket.io-client';

var session_id;
var GameState = { 'players': {}, 'weapons': {}};
var Events = [
  {'timestamp': '2019-03-31T10:35:07.853901', 'event': 'Kill', 'actor_id': '3', 'target_id': '2', 'weapon_id': '1', 'actor_name': 'Bitterman', 'target_name': 'Hunter', 'weapon_name': 'MOD_SHOTGUN', 'weapon_icon': '/img/iconw_railgun_32.png'},
  {'timestamp': '2019-03-31T10:35:07.853902', 'event': 'Kill', 'actor_id': '3', 'target_id': '2', 'weapon_id': '1', 'actor_name': 'Bitterman', 'target_name': 'Hunter', 'weapon_name': 'MOD_SHOTGUN', 'weapon_icon': '/img/iconw_shotgun_32.png'},
  {'timestamp': '2019-03-31T10:35:07.853903', 'event': 'Kill', 'actor_id': '3', 'target_id': '2', 'weapon_id': '1', 'actor_name': 'Bitterman', 'target_name': 'Hunter', 'weapon_name': 'MOD_SHOTGUN', 'weapon_icon': '/img/iconw_rocket_32.png'}
];
var sio = null;

const WORLD_ID = "1022"
const COLORS = {
  "^0": "black",
  "^1": "red",
  "^2": "green",
  "^3": "yellow",
  "^4": "blue",
  "^5": "cyan",
  "^6": "pink",
  "^7": "white",
  "^8": "orange",
};

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
    // console.log(msg)
    eventHandler(msg);
  });
  sio.on("connected", function (msg) {
    session_id = msg.session_id;
    console.log("Websocket connected");
    var url = new URL(window.location.href);
    var match_id = url.searchParams.get("match_id");
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

function chatEventToHTML(msg) {
  var timestamp = new Date(msg.timestamp);
  var html = '<tr><td className="fit">' + timestamp.toLocaleTimeString() + "</td>";

  if (msg.event === "tell") {
    html +=
      '<td className="fit">' +
      colorParseText(msg.actor_name) +
      '&nbsp;<i className="fas fa-arrow-right"></i> ' +
      colorParseText(msg.target_name) +
      '<i className="fas fa-greater-than"></i></td>';
  } else if (msg.event === "say") {
    html +=
      '<td className="fit">' +
      colorParseText(msg.actor_name) +
      '&nbsp;<i className="fas fa-greater-than"></i></td>';
  } else if (msg.event === "sayteam") {
    if (msg.team)
      var team_icon = '<img src="static/img/team' + msg.team + '_32.png">';
    else var team_icon = '<i className="fas fa-video"></i>';
    // {"timestamp":"2019-03-31T23:33:03.210875","event":"sayteam","actor_name":"Visor","msg":"I am the team leader"}
    html +=
      '<td className="fit">' +
      team_icon +
      "&nbsp;" +
      colorParseText(msg.actor_name) +
      '&nbsp;<i className="fas fa-greater-than"></i></td>';
  }

  html += "<td>" + colorParseText(msg.msg) + "</td></tr>";
  return html;
}

// TODO: add popup on player with player stats
export function KillEvents() {
  const kills = Events.filter(event =>
    event.event === 'Kill'
  );
  const listItems = kills.map(k =>
    <li className="alert alert-danger" key={k.timestamp}>
      <div className="row">
      <div className="block ">
          <img src={k.weapon_icon} alt={k.weapon_name} />
          <span className="timestamp">{new Date(k.timestamp).toLocaleTimeString()}</span>
          <span className="content">{colorParseText(getKillMessage(k))}</span>
      </div>
      </div>
    </li>
  );
  return <ul className="no-bullets">{listItems}</ul>;
}

function getKillMessage(msg) {
  var text;
  if (msg.actor_name === "<world>" && msg.weapon_name === "MOD_FALLING") {
    text = colorParseText(msg.target_name) + " cratered";
  } else if (
    msg.actor_name === "<world>" &&
    msg.weapon_name === "MOD_TRIGGER_HURT"
  ) {
    text = colorParseText(msg.target_name) + " was in the wrong place";
  } else if (msg.actor_name === msg.target_name) {
    text = colorParseText(msg.target_name) + " blew itself up";
  } else {
    text =
      colorParseText(msg.target_name) + " got fragged by " + msg.actor_name;
  }

  return text;
}

function colorParseText(msg) {
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
  var formatted = "";
  var is_open = false;

  const splits = msg.split(/(\^\d)/);

  splits.forEach(function (item, index) {
    if (item in COLORS) {
      if (is_open) {
        formatted += "</span>";
        is_open = false;
      }
      formatted += '<span style="color: ' + COLORS[item] + ';">';
      is_open = true;
    } else {
      formatted += item;
    }
  });
  if (is_open) formatted += "</span>";

  return formatted;
}
