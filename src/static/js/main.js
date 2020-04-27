var session_id;
var players = {};

var COLORS = {
    0: 'black',
    1: 'red',
    2: 'green',
    3: 'yellow',
    4: 'blue',
    5: 'cyan',
    6: 'pink',
    7: 'white',
    8: 'black',
}

function getPlayerByName(name) {
    Object.keys(players).forEach(function (key) {
        console.log('checking player: ' + players[key]);
        if (players[key].name == name)
            return players[key];
    });

    return null;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function translateColorcodeString(string) {



    return colorCoded;
}

function setupSocketIO() {
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/events');
    socket.on('connect', function () {
        console.log('Websocket connecting...')
    });
    socket.on('event', function (msg) {
        msg = JSON.parse(msg);
        eventHandler(msg);
    });
    socket.on('connected', function (msg) {
        session_id = msg.session_id;
        console.log('Websocket connected: ' + msg.session_id);
        socket.emit('get_all', { data: 'Give me all you have' });
    });
    socket.on('disconnect', function () {
        console.log('Websocket disconnected.');

    });
};

function eventHandler(msg) {
    switch (msg.event) {
        case 'ClientConnect':
            onClinetConnect(msg);
            break;

        case 'ClientDisconnect':
            onClinetConnect(msg);
            break;

        case 'ClientUserinfoChanged':
            onClientUserinfoChanged(msg)
            break;

        case 'Item':
            onItem(msg);
            break;

        case 'Kill':
            onKillEvent(msg);
            break;

        case 'say':
        case 'sayteam':
        case 'tell':
            onChatEvent(msg);
            break;

        default:
            console.log('Unhandled event: ' + JSON.stringify(msg));
    }
}

function onKillEvent(msg) {
    // {'timestamp': '2019-03-31T10:35:07.853901', 'event': 'Kill', 'actor_id': '3', 'target_id': '2', 'weapon_id': '1', 
    // 'actor_name': 'Bitterman', 'target_name': 'Hunter', 'weapon_name': 'MOD_SHOTGUN'}
    var kill_table = $('#kill_table tbody');
    var old = kill_table.html().trim();
    kill_table.html([old, killEventToHTML(msg)].join('\n'));
    $('#kill_div').animate({ scrollTop: $('#kill_div').prop("scrollHeight") }, 500);
}

function onClinetConnect(msg) {
    // {"timestamp": "2019-03-31T12:11:44.846638", "event": "ClientConnect", "client_id": "0"}
    console.log('New client connected: ' + msg.client_id);
    players[msg.client_id] = {};
}

function onClientUserinfoChanged(msg) {
    // {"timestamp": "2019-03-31T12:11:44.848543", "event": "ClientUserinfoChanged", "client_id": "0",
    // "client_info": "n\\Visor\\t\\0\\model\\visor\\hmodel\\visor\\c1\\4\\c2\\5\\hc\\70\\w\\0\\l\\0\\skill\\    2.00\\tt\\0\\tl\\0"}
    players[msg.client_id] = msg;
    console.log('Client connected: ' + players[msg.client_id]);
}

function onItem(msg) {
    // {'timestamp': '2019-03-31T13:11:25.061939', 'event': 'Item', 'item_whatever': '2', 'item': 'item_armor_shard'}
}

function onChatEvent(msg) {
    // {"timestamp":"2019-03-31T23:09:23.210974","event":"tell","actor_name":"Visor","target_name":"Major","msg":"Ms. Major, Sir follow me"}
    var chat_table = $('#chat_table tbody');
    var old = chat_table.html().trim();
    chat_table.html([old, chatEventToHTML(msg)].join('\n'));
    $('#chat_div').animate({ scrollTop: $('#chat_div').prop("scrollHeight") }, 500);
}

function chatEventToHTML(msg) {
    var timestamp = new Date(msg.timestamp);
    var html = '<tr><td class="fit">' + timestamp.toLocaleTimeString() + '</td>';

    if (msg.event == 'tell') {
        html += '<td class="fit">' + msg.actor_name + '&nbsp;<i class="fas fa-arrow-right"></i> ' + msg.target_name + '<i class="fas fa-greater-than"></i></td>';
    } else if (msg.event == 'say') {
        html += '<td class="fit">' + msg.actor_name + '&nbsp;<i class="fas fa-greater-than"></i></td>';
        console.log(msg);
    } else if (msg.event == 'sayteam') {
        console.log(msg)
        console.log(getPlayerByName(msg.actor_name));
        console.log(players);
        if (msg.team)
            var team_icon = '<img src="static/img/team' + msg.team + '_32.png">';
        else
            var team_icon = '<i class="fas fa-video"></i>';
        // {"timestamp":"2019-03-31T23:33:03.210875","event":"sayteam","actor_name":"Visor","msg":"I am the team leader"}
        html += '<td class="fit">' + team_icon + '&nbsp;' + msg.actor_name + '&nbsp;<i class="fas fa-greater-than"></i></td>';
    }

    html += '<td>' + msg.msg + '</td></tr>';
    return html;
}

function killEventToHTML(msg) {
    var timestamp = new Date(msg.timestamp);
    var html = '<tr><td class="fit">' + timestamp.toLocaleTimeString() + '</td><td class="fit"><i class="fas fa-skull-crossbones"></i></td><td class="fit"><img src="' + msg.weapon_icon + '" width=16 height=16></td>';
    html += '<td>' + getKillMessage(msg) + '</td></tr>';
    return html;
}

function getKillMessage(msg) {
    var text;
    if (msg.actor_name == '<world>' && msg.weapon_name == 'MOD_FALLING') {
        text = msg.target_name + ' cratered';
    } else if (msg.actor_name == '<world>' && msg.weapon_name == 'MOD_TRIGGER_HURT') {
        text = msg.target_name + ' was in the wrong place';
    } else if (msg.actor_name == msg.target_name) {
        text = msg.target_name + ' blew itself up';
    } else {
        text = msg.target_name + ' got fragged by ' + msg.actor_name;
    }

    return text;
}