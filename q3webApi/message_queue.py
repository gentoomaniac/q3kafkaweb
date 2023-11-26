import logging

log = logging.getLogger(__name__)


class MessageQueueReader():
    """ A reader of a given list.
        The Reader manages the index to the last read element.
    """

    def __init__(self, data: list):
        self._index = 0
        self._base_index = None
        self._data = data

    def __iter__(self):
        if self._base_index:
            self._index = self._base_index
        return self

    def __next__(self) -> dict:
        """ Return the next message in the queue
        """
        if self._index < len(self._data):
            event = self._data[self._index]
            self._index += 1
            return event
        raise StopIteration

    def has_next(self) -> bool:
        """ Return true if there is new elements in the data
            else return false
        """
        return self._index < len(self._data)

    def set_index(self, index: int):
        """ Set the internal index to the given value
        """
        self._base_index = index

    def reset(self):
        """ Set the internal index to the given value
        """
        self._index = 0

    def seek_end(self):
        self._index = len(self._data) - 1

    def __len__(self) -> int:
        return len(self._data)
