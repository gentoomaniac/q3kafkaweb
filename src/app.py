import json
import logging
import os
import uuid
import threading
import atexit

from flask import Flask, render_template, request, url_for, session
from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO, send, emit

from kafka import KafkaConsumer
from kafka.errors import KafkaError

from message_queue import MessageQueue

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
log = logging.getLogger(__file__)

consumers = {}
WEAPON_ICON_MAPPING = {}

from flask import Flask

POLL_TIME = 1  #Seconds

cache = MessageQueue()
consumer_sessions = {}


def _load_events(consumer, cache):
    log.info('loading old events: %s', kafka_id)
    for kafka_msg in consumer:
        event = kafka_msg.value  #decorate_event(kafka_msg.value)
        cache.push(event)
        log.info("new event: %s" % json.dumps(event))


def _setup_weapon_icon_mapping():
    global WEAPON_ICON_MAPPING

    if not WEAPON_ICON_MAPPING:
        WEAPON_ICON_MAPPING = {
            'MOD_GAUNTLET': url_for('static', filename='img/iconw_gauntlet_32.png'),
            'MOD_MACHINEGUN': url_for('static', filename='img/iconw_machinegun_32.png'),
            'MOD_SHOTGUN': url_for('static', filename='img/iconw_shotgun_32.png'),
            'MOD_GRENADE': url_for('static', filename='img/iconw_grenade_32.png'),
            'MOD_LIGHTNING': url_for('static', filename='img/iconw_lightning_32.png'),
            'MOD_PLASMA': url_for('static', filename='img/iconw_plasma_32.png'),
            'MOD_PLASMA_SPLASH': url_for('static', filename='img/iconw_plasma_32.png'),
            'MOD_RAILGUN': url_for('static', filename='img/iconw_railgun_32.png'),
            'MOD_ROCKET': url_for('static', filename='img/iconw_rocket_32.png'),
            'MOD_ROCKET_SPLASH': url_for('static', filename='img/iconw_rocket_32.png'),
            'MOD_BFG': url_for('static', filename='img/iconw_bfg_32.png'),
            'MOD_TRIGGER_HURT': url_for('static', filename='img/world_kill_32.png'),
            'MOD_FALLING': url_for('static', filename='img/world_kill_32.png'),
            'MOD_TELEFRAG': url_for('static', filename='img/teleporter_32.png'),
            'NO_ICON': url_for('static', filename='img/no_icon_32.png'),
        }


def decorate_event(message):
    decorated = message.copy()

    if 'weapon_name' in message:
        decorated['weapon_icon'] = WEAPON_ICON_MAPPING.get(message['weapon_name'], WEAPON_ICON_MAPPING['NO_ICON'])
    return decorated


app = Flask(__name__)
app.secret_key = os.getenv('APP_SECRET', str(uuid.uuid4()))
bootstrap = Bootstrap(app)
socketio = SocketIO(app)

kafka_id = str(uuid.uuid4())
consumer = KafkaConsumer(
    'quake3',
    group_id=kafka_id,
    client_id=kafka_id,
    value_deserializer=lambda m: json.loads(m.decode('ascii')),
    bootstrap_servers=['localhost:9092'])

background_consumer_thread = threading.Timer(POLL_TIME, _load_events, (consumer, cache))
background_consumer_thread.start()
atexit.register(background_consumer_thread.cancel)


@app.route('/')
def index():
    return render_template('index.html',)


@socketio.on('get_all', namespace='/events')
def get_all(message):
    log.info('client asking for all events: %s', request.sid)
    event_id = 0
    while True:
        try:
            _, event = consumer_sessions[request.sid].next()
        except KeyError:
            log.debug("Client session terminated: %s", request.sid)
            break

        emit('event', json.dumps(decorate_event(event)))


@socketio.on('connect', namespace='/events')
def on_connect_handler():
    _setup_weapon_icon_mapping()
    consumer_sessions[request.sid] = MessageQueue()
    emit('connected', json.dumps({'session_id': request.sid}))


@socketio.on('disconnect', namespace='/events')
def on_disconnect_handler():
    consumer_sessions.pop(request.sid, None)
    log.debug("client disconnected: %s", request.sid)


if __name__ == '__main__':
    socketio.run(app)