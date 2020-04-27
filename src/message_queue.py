import time


class MessageQueue():
    _data = []
    _lock = False
    _consumers = []

    def __init__(self):
        self._index = 0
        MessageQueue._consumers.append(self)

    def push(self, item):
        MessageQueue._data.append(item)

    def head(self):
        return self._index >= len(MessageQueue._data)

    def next(self):
        while self.head():
            time.sleep(0.1)

        message = MessageQueue.get(self._index)
        self._index += 1
        return message

    def set_offset(self, offset: int):
        self._index = offset

    @classmethod
    def get(cls, index: int):
        while cls._lock:
            time.sleep(0.1)
        if index >= len(cls._data):
            index = len(cls._data) - 1
        return index + 1, cls._data[index]

    @classmethod
    def truncate(cls):
        cls._lock = True
        time.sleep(0.1)
        cls._data = []
        for instance in cls._consumers:
            instance._index = 0
        log.debug("datastore truncated")
        cls._lock = False


def produce(id: int):
    producer = MessageQueue()
    for item in range(1, 10):
        producer.push("message {}#{}".format(id, item))
        log.debug("producer #%d: message %d#%d", id, id, item)
        time.sleep(randint(1, 10))


def consumer(id: int):
    consumer = MessageQueue()
    while True:
        if not consumer.head():
            log.info("consumer #%d: %s", id, consumer.next())

    log.debug("consumer #%d: ended", id)


if __name__ == "__main__":
    import logging
    import time
    import threading

    from random import seed
    from random import randint

    global log
    logging.basicConfig(
        level=logging.DEBUG, format='[%(asctime)s] %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    log = logging.getLogger(__file__)

    seed(int(time.time()))

    p1 = threading.Thread(target=produce, kwargs={'id': 1})
    p1.start()
    p2 = threading.Thread(target=produce, kwargs={'id': 2})
    p2.start()

    c1 = threading.Thread(target=consumer, kwargs={'id': 1})
    c1.start()

    c2 = threading.Thread(target=consumer, kwargs={'id': 2})
    c2.start()

    truncator = MessageQueue()
    time.sleep(20)
    truncator.truncate()

    c3 = threading.Thread(target=consumer, kwargs={'id': 3})
    c3.start()
