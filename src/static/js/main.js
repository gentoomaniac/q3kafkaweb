var session_id;

function setupSocketIO() {
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/events');
    socket.on('connect', function () {
        console.log('Websocket connecting...')
    });
    socket.on('event', function (msg) {
        console.log('Event received: ' + msg)
        eventHandler(msg)
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
    console.log('Event handled: ' + JSON.stringify(msg));
    var textarea = $('#raw_events');
    var old = textarea.val();
    textarea.val(old + '\n' + JSON.stringify(msg));
    textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
}

function killEventToHTML(msg) {

}