var session_id;
var players = {};

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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

        case 'ClientUserinfoChanged':
            onClientUserinfoChanged(msg)
            break;

        case 'Item':
            onItem(msg);
            break;

        case 'Kill':
            onKillEvent(msg);
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
    players['client_id'] = {};
}

function onClientUserinfoChanged(msg) {
    // {"timestamp": "2019-03-31T12:11:44.848543", "event": "ClientUserinfoChanged", "client_id": "0",
    // "client_info": "n\\Visor\\t\\0\\model\\visor\\hmodel\\visor\\c1\\4\\c2\\5\\hc\\70\\w\\0\\l\\0\\skill\\    2.00\\tt\\0\\tl\\0"}
}

function onItem(msg) {
    // {'timestamp': '2019-03-31T13:11:25.061939', 'event': 'Item', 'item_whatever': '2', 'item': 'item_armor_shard'}
}

function killEventToHTML(msg) {
    var timestamp = new Date(msg.timestamp);
    var html = '<tr><td class="fit">' + timestamp.toLocaleTimeString() + '</td><td class="fit"><i class="fas fa-skull-crossbones"></i></td><td class="fit"><img src="' + msg.weapon_icon + '" width=16 height=16></td>';
    html += '<td>' + getKillMessage(msg) + '</td>';
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