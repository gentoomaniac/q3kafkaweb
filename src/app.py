import json
import logging
import os
import uuid

from flask import Flask, render_template, request, url_for
from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO, send, emit

logging.basicConfig(level=logging.DEBUG, format='[%(asctime)s] %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
log = logging.getLogger(__file__)

app = Flask(__name__)
app.secret_key = os.getenv('APP_SECRET', str(uuid.uuid4()))
bootstrap = Bootstrap(app)
socketio = SocketIO(app)


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('event', namespace='/events')
def handle_message(message):
    log.debug(json.dumps(message))
    emit('event', message)


if __name__ == '__main__':
    socketio.run(app)