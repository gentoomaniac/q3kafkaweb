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

RUN = True

cache = {'matches': {}}

KAFKA_ID = str(uuid.uuid4())


def _consumer_thread():
    consumer = kafka.KafkaConsumer(group_id=KAFKA_ID,
                                   client_id=KAFKA_ID,
                                   key_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   bootstrap_servers=['127.0.0.1:9092'])

    consumer.subscribe(pattern=r'^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$')

    while RUN:
        data = consumer.poll()
        # log.debug(data)

        _process_messages(data)

        time.sleep(1)


def _process_messages(data: dict):
    for topic_part in data:
        topic = topic_part.topic

        for kafka_msg in data[topic_part]:

            if topic == 'matches':
                cache['matches'][kafka_msg.value['id']].update(kafka_msg.value)
            else:
                if not cache['matches'].get(topic):
                    cache['matches'][topic] = {'messages': []}
                cache['matches'][topic]['messages'].append(kafka_msg.value)
                if kafka_msg.value['event'] == 'GameEnded':
                    log.debug("finished consuming %s", topic)
                    # TODO: how to unsubscribe a given topic?


def _get_weapon_icon_mapping(key):
    return {
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
    }.get(key, url_for('static', filename='img/no_icon_32.png'))


def decorate_event(message):
    """ Takes the plain event and adds URLs etc for retrieving the icons for a given event
    """
    decorated = message.copy()

    if 'weapon_name' in message:
        decorated['weapon_icon'] = _get_weapon_icon_mapping(message['weapon_name'])
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

    log.debug(json.dumps(cache, indent=2, sort_keys=True))
    game = cache['matches'][game_id]

    log.info("processing game events ...")
    event_queue = MessageQueueReader(game['messages'])
    while RUN:
        try:
            event = next(event_queue)
            if event:
                emit('event', json.dumps(decorate_event(event)))
                if event['event'] == 'GameEnded':
                    break
        except:
            time.sleep(1)
    log.debug("finished handling `subscribe`")


@socketio.on('connect', namespace='/events')
def on_connect_handler():
    """ Stuff to do when new clients are connecting to the websocket
    """
    emit('connected', json.dumps({'session_id': request.sid}))


@socketio.on('disconnect', namespace='/events')
def on_disconnect_handler():
    """ Stuff to do when clients are disconnecting
    """
    log.debug("client disconnected: %s", request.sid)


def _shutdown():
    global RUN
    RUN = False


def start(port=8000, debug=True):
    """ Set up background processes to consume kafka topics
    """
    logging.getLogger('kafka').setLevel(logging.ERROR)

    global metadata_thread
    metadata_thread = threading.Thread(target=_consumer_thread)
    metadata_thread.daemon = True    # Set the thread as a daemon
    metadata_thread.start()
    atexit.register(_shutdown)

    log.info("Starting socketio app")
    socketio.run(app, port=port, debug=debug)

    return 0
