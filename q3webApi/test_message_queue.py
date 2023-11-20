import unittest

from q3web.message_queue import MessageQueueReader

TEST_DATA = ["foo", "bar", "fizz", "buzz", "fizzbuzz"]


class TestMessageQueueReader(unittest.TestCase):

    def test_if_returns_all_values(self):
        queue_reader = MessageQueueReader(TEST_DATA)

        result_list = []

        for i, item in enumerate(queue_reader):
            self.assertEqual(item, TEST_DATA[i], f"Got '{item}', but expected '{TEST_DATA[i]}'")
            result_list.append(item)
        self.assertEqual(result_list, TEST_DATA, "Generated list is not equal to test data")

    def test_if_returns_all_values_after_changing_index(self):
        base_index = 2
        queue_reader = MessageQueueReader(TEST_DATA)
        queue_reader.set_index(base_index)

        result_list = []

        for i, item in enumerate(queue_reader):
            self.assertEqual(item, TEST_DATA[i + base_index],
                             f"Got '{item}', but expected '{TEST_DATA[i + base_index]}'")
            result_list.append(item)

        self.assertEqual(result_list, TEST_DATA[base_index:], "Generated list is not equal to test data")

    def test_has_next(self):
        queue_reader = MessageQueueReader(TEST_DATA)

        self.assertEqual(queue_reader.has_next(), True, "has_next() returns False before being iterated")

        for _ in queue_reader:
            pass

        self.assertEqual(queue_reader.has_next(), False, "has_next() returns True after being iterated")

    def test_reset(self):
        queue_reader = MessageQueueReader(TEST_DATA)

        for _ in queue_reader:
            pass

        queue_reader.reset()
        self.assertEqual(queue_reader.has_next(), True, "reset() did not reset the iterator")

    def test_if_has_next_after_data_appended(self):
        data = TEST_DATA.copy()
        queue_reader = MessageQueueReader(data)

        for _ in queue_reader:
            pass

        element = "new last element"
        data.append(element)

        self.assertEqual(queue_reader.has_next(), True,
                         "has_next() returns False after data has been appended to queue")

        self.assertEqual(next(queue_reader), element, "returned element is not equal to the appended element")


if __name__ == '__main__':
    unittest.main(verbosity=2)
