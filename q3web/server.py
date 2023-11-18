import atexit
import json
import logging
import os
import threading
import time
import uuid

import kafka

from flask import Flask, render_template, request, url_for
from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO, emit

from q3web.message_queue import MessageQueueReader

log = logging.getLogger(__name__)

consumers = {}
WEAPON_ICON_MAPPING = {}

RUN = True
metadata_thread = None

cache = {'matches': {}}
consumer_sessions = {}
KAFKA_ID = str(uuid.uuid4())

# ToDo: global consumer that handles all kafka messages and subscribes/unsubscribes from topics


def _load_events(consumer, cache):
    log.info('loading old events: %s', KAFKA_ID)
    for kafka_msg in consumer:
        event = kafka_msg.value    #decorate_event(kafka_msg.value)
        cache.push(event)
        log.debug("new event: %s", json.dumps(event))


def _consume_match_data(match_id: str):
    consumer = kafka.KafkaConsumer(match_id,
                                   group_id=KAFKA_ID,
                                   client_id=KAFKA_ID,
                                   key_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   bootstrap_servers=['127.0.0.1:9092'])

    log.debug("consuming match with id %s", match_id)

    running = True
    while running:
        data = consumer.poll()
        log.debug(data)

        for kafka_msg in data.get(match_id, []):
            cache['matches'][match_id]['messages'].append(kafka_msg.value)
            log.debug(kafka_msg.value)
            if kafka_msg.value['event'] == 'GameEnded':
                log.debug("finished consuming %s", match_id)
                running = False
                return
        time.sleep(1)

    log.debug("nothing to consume %s", match_id)


def _consume_match_metadata():
    log.debug("consuming meta information about matches")
    consumer = kafka.KafkaConsumer('matches',
                                   group_id=KAFKA_ID,
                                   client_id=KAFKA_ID,
                                   key_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   bootstrap_servers=['127.0.0.1:9092'])

    log.debug("consuming events ...")
    for kafka_msg in consumer:
        log.debug(kafka_msg.value)
        cache['matches'][kafka_msg.value['id']].update(kafka_msg.value)
        if not RUN:
            return


def _setup_weapon_icon_mapping(WEAPON_ICON_MAPPING):
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
    """ Takes the plain event and adds URLs etc for retrieving the icons for a given event
    """
    decorated = message.copy()

    if 'weapon_name' in message:
        decorated['weapon_icon'] = WEAPON_ICON_MAPPING.get(message['weapon_name'], WEAPON_ICON_MAPPING['NO_ICON'])
    return decorated


def _get_app(secret_key=str(uuid.uuid4())):
    app = Flask(__name__)
    app.secret_key = secret_key
    return app, SocketIO(app), Bootstrap(app)


app, socketio, bootstrap = _get_app(os.getenv('APP_SECRET', str(uuid.uuid4())))


@app.route('/')
def index():
    """ Serve the index page
    """
    return render_template('index.html',)


@socketio.on('subscribe', namespace='/events')
def subscribe(game_id):
    """ Handles a request from the web app to retrieve events for a match
    """
    log.info("client '%s' asking for game %s", request.sid, game_id)

    if not game_id in cache['matches']:
        cache['matches'][game_id] = {'messages': [], 'consumer_thread': None}
        t = threading.Thread(target=_consume_match_data, kwargs={'match_id': game_id})
        t.daemon = True
        t.start()

    game = cache['matches'][game_id]

    log.info("processing game events ...")
    event_queue = MessageQueueReader(game['messages'])
    for event in event_queue:
        if not RUN:
            return

        if event:
            emit('event', json.dumps(decorate_event(event)))
            if event['event'] == 'GameEnded':
                break
        else:
            time.sleep(0.5)
    log.debug("finished handling `subscribe`")


@socketio.on('connect', namespace='/events')
def on_connect_handler():
    """ Stuff to do when new clients are connecting to the websocket
    """
    _setup_weapon_icon_mapping(WEAPON_ICON_MAPPING)
    emit('connected', json.dumps({'session_id': request.sid}))


@socketio.on('disconnect', namespace='/events')
def on_disconnect_handler():
    """ Stuff to do when clients are disconnecting
    """
    log.debug("client disconnected: %s", request.sid)


def _shutdown():
    global RUN
    RUN = False
    if metadata_thread:
        metadata_thread.join()
    for id, data in cache['matches']:
        if data['consumer_thread']:
            data['consumer_thread'].join()


def start(port=8000, debug=True):
    """ Set up background processes to consume kafka topics
    """
    logging.getLogger('kafka').setLevel(logging.ERROR)

    # global metadata_thread
    # metadata_thread = threading.Thread(target=_consume_match_metadata)
    # metadata_thread.daemon = True    # Set the thread as a daemon
    # metadata_thread.start()
    atexit.register(_shutdown)

    log.info("Starting socketio app")
    socketio.run(app, port=port, debug=debug)

    return 0
