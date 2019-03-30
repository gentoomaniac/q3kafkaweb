function setupSocketIO() {
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/events');
    socket.on('connect', function () {
        socket.emit('event', { data: 'I\'m connected!' });
        console.log('Websocket connected.')
    });
    socket.on('event', function (msg) {
        console.log('Event received.')
        eventHandler(msg)
    });
    socket.on('disconnect', function () {
        console.log('Websocket disconnected.');
    });
};

function eventHandler(msg) {
    console.log('Event handled: ' + JSON.stringify(event));
    var old = $('#raw_events').val();
    $('#raw_events').val(old + '\n' + JSON.stringify(event));
}