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
WEAPON_ICON_MAPPING = {}


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