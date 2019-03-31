import json
import logging
import os
import uuid

from flask import Flask, render_template, request, url_for, session
from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO, send, emit

from kafka import KafkaConsumer
from kafka.errors import KafkaError

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
log = logging.getLogger(__file__)

app = Flask(__name__)
app.secret_key = os.getenv('APP_SECRET', str(uuid.uuid4()))
bootstrap = Bootstrap(app)
socketio = SocketIO(app)

consumers = {}


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('get_all', namespace='/events')
def handle_message(message):
    log.info('client asking for all events: %s', session['kafka_id'])
    for kafka_msg in consumers[session['kafka_id']]:
        log.info('emitting event: %s', kafka_msg.value)  #TODO
        emit('event', json.dumps(kafka_msg.value))


@socketio.on('connect', namespace='/events')
def on_connect_handler():
    kafka_id = str(uuid.uuid4())
    session['kafka_id'] = kafka_id
    consumers[kafka_id] = KafkaConsumer(
        'ioquake3',
        group_id=kafka_id,
        client_id=kafka_id,
        value_deserializer=lambda m: json.loads(m.decode('ascii')),
        bootstrap_servers=['localhost:9092'])
    emit('connected', json.dumps({'session_id': kafka_id}))


if __name__ == '__main__':
    socketio.run(app)