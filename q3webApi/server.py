import atexit
import json
import logging
import os
import threading
import time
import uuid

from datetime import datetime

import kafka

from flask import Flask, request
from flask_socketio import SocketIO, emit

from q3webApi.message_queue import MessageQueueReader

log = logging.getLogger(__name__)

RUN = True

cache = {'matches': {}}

KAFKA_ID = str(uuid.uuid4())


def _consumer_thread():
    consumer = kafka.KafkaConsumer(group_id=KAFKA_ID,
                                   client_id=KAFKA_ID,
                                   key_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                   bootstrap_servers=['127.0.0.1:9092'],
                                   enable_auto_commit=True,
                                   auto_commit_interval_ms=30 * 1000,
                                   auto_offset_reset='smallest')

    consumer.subscribe(pattern=r'^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$')

    while RUN:
        data = consumer.poll()
        # log.debug(data)

        _process_messages(data)
        consumer.commit()
        time.sleep(0.5)


def _process_messages(data: dict):
    for topic_part in data:
        topic = topic_part.topic

        for kafka_msg in data[topic_part]:
            if not cache['matches'].get(topic):
                cache['matches'][topic] = {'messages': []}
                log.debug("consuming new game: %s", topic)

            cache['matches'][topic]['messages'].append(kafka_msg.value)

            if kafka_msg.value['event'] == 'GameEnded':
                # log.debug("finished consuming %s", topic)
                pass


def _get_latest_match() -> str:
    latest_id = ""
    latest_date = None
    for match_id, match in cache['matches'].items():
        if match['messages'][-1]['event'] != "GameEndet":
            last_event = match['messages'][-1]
            event_timestamp = datetime.fromisoformat(last_event['timestamp'])
            if not latest_date or event_timestamp < latest_date:
                latest_date = event_timestamp
                latest_id = match_id
    return latest_id


def _get_app(secret_key=str(uuid.uuid4())):
    app = Flask(__name__)
    app.secret_key = secret_key
    return app, SocketIO(app, cors_allowed_origins='*')


app, socketio = _get_app(os.getenv('APP_SECRET', str(uuid.uuid4())))


@socketio.on('subscribe', namespace='/events')
def subscribe(game_id):
    """ Handles a request from the web app to retrieve events for a match
    """
    log.info("client '%s' asking for game %s", request.sid, game_id)

    game = cache['matches'].get(game_id, None)
    if game is None:
        emit('event', json.dumps({'error': "Game doesn't exist"}))
        return

    log.info("processing game events ...")
    event_queue = MessageQueueReader(game['messages'])

    while RUN:
        try:
            event = next(event_queue)
            if event:
                emit('event', json.dumps(event))
                if event['event'] == 'GameEnded':
                    next_match = _get_latest_match()
                    if next_match:
                        emit('event', json.dumps({'next_match': next_match}))
        except StopIteration:
            time.sleep(1)


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
