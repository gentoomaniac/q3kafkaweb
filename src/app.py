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

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
log = logging.getLogger(__file__)

consumers = {}
WEAPON_ICON_MAPPING = {}

from flask import Flask

POOL_TIME = 1  #Seconds

# variables that are accessible from anywhere
commonDataStruct = {'events': []}
# thread handler
yourThread = threading.Thread()


def create_app():
    app = Flask(__name__)
    _setup_weapon_icon_mapping()

    kafka_id = str(uuid.uuid4())
    consumer = KafkaConsumer(
        'quake3',
        group_id=kafka_id,
        client_id=kafka_id,
        value_deserializer=lambda m: json.loads(m.decode('ascii')),
        bootstrap_servers=['localhost:9092'])

    def interrupt():
        global yourThread
        yourThread.cancel()

    def doStuff():
        global commonDataStruct
        global yourThread

        consumer.poll()
        consumer.seekToEnd()
        for kafka_msg in consumer:
            event = decorate_event(kafka_msg.value)
            commonDataStruct['events'].append(event)
            log.debug(json.dumps(event))

        # Set the next thread to happen
        yourThread = threading.Timer(POOL_TIME, doStuff, ())
        yourThread.start()

    def doStuffStart():
        # Do initialisation stuff here
        global yourThread

        log.info('initially getting all events: %s', kafka_id)
        for kafka_msg in consumer:
            event = decorate_event(kafka_msg.value)
            commonDataStruct['events'].append(event)
            log.debug(json.dumps(event))

        # Create your thread
        yourThread = threading.Timer(POOL_TIME, doStuff, ())
        yourThread.start()

    # Initiate
    doStuffStart()
    # When you kill Flask (SIGTERM), clear the trigger for the next thread
    atexit.register(interrupt)
    return app


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
            'MOD_TELEFRAG': url_for('static', filename='img/teleporter_32.png')
        }


def decorate_event(message):
    decorated = message.copy()

    if 'weapon_name' in message:
        decorated['weapon_icon'] = WEAPON_ICON_MAPPING.get(message['weapon_name'],
                                                           url_for('static', filename='img/no_icon_32.png'))
    return decorated


app = create_app()
app.secret_key = os.getenv('APP_SECRET', str(uuid.uuid4()))
bootstrap = Bootstrap(app)
socketio = SocketIO(app)


@app.route('/')
def index():
    return render_template('index.html',)


@socketio.on('get_all', namespace='/events')
def get_all(message):
    log.info('client asking for all events: %s', session['kafka_id'])
    _setup_weapon_icon_mapping()
    for kafka_msg in consumers[session['kafka_id']]:
        event = decorate_event(kafka_msg.value)
        log.info('emitting event: %s', event)
        emit('event', json.dumps(event))


@socketio.on('get_latest', namespace='/events')
def get_latest(message):
    consumers[session['kafka_id']].poll()
    consumers[session['kafka_id']].seekToEnd()
    log.info('client asking for latest events: %s', session['kafka_id'])
    _setup_weapon_icon_mapping()
    for kafka_msg in consumers[session['kafka_id']]:
        event = decorate_event(kafka_msg.value)
        log.info('emitting event: %s', event)
        emit('event', json.dumps(event))


@socketio.on('connect', namespace='/events')
def on_connect_handler():
    client_session_id = str(uuid.uuid4())
    session['client_id'] = client_session_id
    emit('connected', json.dumps({'session_id': client_session_id}))


if __name__ == '__main__':
    socketio.run(app)