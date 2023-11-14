import atexit
import json
import logging
import os
import uuid
import sys
import threading
import time

import click

from flask import Flask, render_template, request, url_for, session
from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO, emit

import kafka

from q3web.message_queue import MessageQueueReader

log = logging.getLogger(__name__)

consumers = {}
WEAPON_ICON_MAPPING = {}

from flask import Flask

POLL_TIME = 1  #Seconds

cache = {'games': {}, 'matches': []}
consumer_sessions = {}
KAFKA_ID = str(uuid.uuid4())


def _load_events(consumer, cache):
    log.info('loading old events: %s', KAFKA_ID)
    for kafka_msg in consumer:
        event = kafka_msg.value  #decorate_event(kafka_msg.value)
        cache.push(event)
        log.info("new event: %s" % json.dumps(event))


def _consume_match_data(match_id: str):
    log.debug("consuming match with id %s", match_id)
    consumer = kafka.KafkaConsumer(match_id,
                                   group_id=KAFKA_ID,
                                   client_id=KAFKA_ID,
                                   key_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   bootstrap_servers=['127.0.0.1:9092'])

    cache['games'][match_id] = []
    for kafka_msg in consumer:
        cache['games'][match_id].append(kafka_msg.value)


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


@app.route('/')
def index():
    return render_template('index.html',)


@socketio.on('get_all', namespace='/events')
def get_all(game_id):
    log.info("client '%s' asking for game %s", request.sid, game_id)
    log.info(cache)
    events = cache['games'].get(game_id)
    if events:
        log.info("found events")
        event_queue = MessageQueueReader(events)
        while True:
            event = event_queue.next()
            if event:
                emit('event', json.dumps(decorate_event(event)))
                if event['event'] == 'GameEnded':
                    break
            else:
                time.sleep(0.5)
    else:
        emit('event', json.dumps({'event': 'NoSuchGame'}))
        log.info("client '%s' requested invalid game id '%s'", request.sid, game_id)


@socketio.on('connect', namespace='/events')
def on_connect_handler():
    _setup_weapon_icon_mapping()
    emit('connected', json.dumps({'session_id': request.sid}))


@socketio.on('disconnect', namespace='/events')
def on_disconnect_handler():
    log.debug("client disconnected: %s", request.sid)


def _configure_logging(verbosity):
    loglevel = max(3 - verbosity, 0) * 10
    logging.basicConfig(level=loglevel,
                        format='[%(asctime)s] %(name)s %(levelname)s: %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')
    if loglevel >= logging.DEBUG:
        # Disable debugging logging for external libraries
        for loggername in 'urllib3':
            logging.getLogger(loggername).setLevel(logging.CRITICAL)


@click.command()
@click.option('-v', '--verbosity', help='Verbosity', default=0, count=True)
@click.option('-m', '--match', help='match uuid', required=True)
def cli(verbosity: int, match: str):
    _configure_logging(verbosity)

    background_consumer_thread = threading.Timer(interval=POLL_TIME,
                                                 function=_consume_match_data,
                                                 kwargs={'match_id': match})
    background_consumer_thread.start()
    atexit.register(background_consumer_thread.cancel)

    logging.getLogger('kafka').setLevel(logging.CRITICAL)
    socketio.run(app, port=8000, debug=True)

    return 0


if __name__ == '__main__':
    # pylint: disable=E1120
    sys.exit(cli())