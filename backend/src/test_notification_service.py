import datetime

import database_service as ds
import unittest
from notification_service import NOTIF_INTERVAL
import notification_service as ns

db = ds.connect_to_database("test")
notifications = db['notifications']
users = db['users']


class TestNotificationService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        notifications.delete_many({})
        users.delete_many({})

    def testWithTimeBoundaries(self):
        users.insert_one({
            'email': 'user 1',
            'startTime': 5,
            'endTime': 24
        })
        users.insert_one({
            'email': 'user 2',
            'startTime': 14,
            'endTime': 15
        })
        current_hour = 9
        notifications_sent = 0
        user_list = list(users.find({}))
        for user in user_list:
            if ('startTime' not in user or 'endTime' not in user) or (
                    user['startTime'] <= current_hour <= user['endTime']):
                notifications_sent += 1
        assert notifications_sent == 1

    def testWithThreshold(self):
        users.insert_one({
            'email': 'user with high threshold',
            'notifications': {'Room 1': 50, 'Room 2': 50}
        })
        users.insert_one({
            'email': 'user with low threshold',
            'notifications': {'Room 1': 1, 'Room 2': 1}
        })

        notifications_sent = 0

        occupancy = 5
        room = 'Room 1'
        user_list = list(users.find({}))
        for user in user_list:

            notifications = user['notifications']
            if room in notifications and notifications[room] > occupancy:
                notifications_sent += 1
        assert notifications_sent == 1

    def testNotExpired(self):
        notifications.insert_one({
            'email': 'test_email',
            'time': datetime.datetime.utcnow()
        })
        notification = notifications.find_one({'email': 'test_email'})
        assert notification is not None
        time = notification['time']
        difference = datetime.datetime.utcnow() - time
        minutes = difference.seconds / 60
        assert minutes < NOTIF_INTERVAL

    @classmethod
    def tearDown(cls):
        users.delete_many({})
