import datetime
import random
import unittest
import database_service as ds
import record_service as rs
import statistics

db = ds.connect_to_database("test")
records = db["records"]

EXPECTED_STD_DEV = statistics.stdev([i for i in range(1, 51)])

TEST_ROOMS = ['Room {}'.format(i) for i in range(1, 5)]


def create_dummy_data():
    for i in range(1, 51):
        rs.create_record('Room 1', i, records)
    for i in range(2, 5):
        rs.create_record('Room {}'.format(i), i * 10, records)


class TestRecordService(unittest.TestCase):
    def testCreate(self):
        rs.create_record('room 1', 87, records)
        record = records.find_one({'room': 'room 1'})
        assert record is not None
        # records.delete_many({})

    # def testGet(self):
    #     for i in range(1, 11):
    #         rs.create_record('room 1', i, records)
    #     record_list = list(records.find({"hour": datetime.datetime.utcnow().hour}))
    #     occupancies = [record['occupancy'] for record in record_list]
    #     if not occupancies:
    #         average = 0
    #     else:
    #         average = sum(occupancies) / len(occupancies)
    #     assert average == 5.5

    def testExpired(self):
        rs.create_record('room 1', 87, records)
        records.update_one({'room': 'room 1'},
                           {'$set': {'time': datetime.datetime.utcnow() - datetime.timedelta(days=8)}})
        expired_records = records.find({'time': {'$lt': datetime.datetime.utcnow() - datetime.timedelta(days=7)}})
        assert expired_records.count() > 0

    def testGetWeeklyOccupancies(self):
        for day in range(0, 7):
            for occupancy in range(1, 11):
                records.insert_one({
                    'room': 'Room 1', 'day': day, 'occupancy': occupancy
                })
        weekly_occupancies = []
        for day in range(0, 7):
            data = list(records.find({'$and': [{'room': 'Room 1'}, {'day': day}]}))
            occupancies = [record['occupancy'] for record in data]
            weekly_occupancies.append(statistics.mean(occupancies))
        for average in weekly_occupancies:
            assert average == (11 * 10) / (2 * 10)

    def testGetAdvancedData(self):
        create_dummy_data()
        data = list(records.find({'room': 'Room 1'}))
        occupancies = [record['occupancy'] for record in data]
        assert min(occupancies) == 1
        assert max(occupancies) == 50
        assert sum(occupancies) == (51 * 50) / 2

    def testMedianAndStdDev(self):
        create_dummy_data()
        data = list(records.find({'room': 'Room 1'}))
        occupancies = [record['occupancy'] for record in data]
        assert statistics.stdev(occupancies) == EXPECTED_STD_DEV
        assert statistics.median(occupancies) == 25.5

    def testTotalPercentage(self):
        create_dummy_data()
        expected_occupancies = [50, 20, 30, 40]
        total = 0
        for room in TEST_ROOMS:
            record = list(records.find({'room': room}).sort([('time', -1)]).limit(1))
            occupancy = record[0]['occupancy']
            total += occupancy
        index = 0
        for room in TEST_ROOMS:
            record = list(records.find({'room': room}).sort([('time', -1)]).limit(1))
            occupancy = record[0]['occupancy']
            assert occupancy / total == expected_occupancies[index] / sum(expected_occupancies)
            index += 1

    def testHourlyRecords(self):
        for _ in range(5):
            records.insert_one({
                'room': 'Room 1', 'hour': 5, 'occupancy': 5
            })
        record_list = list(
            records.find({'$and': [{'room': 'Room 1'}, {'hour': 5}]}))
        occupancies = [record['occupancy'] for record in record_list]
        assert sum(occupancies) == 25

    @classmethod
    def tearDown(cls) -> None:
        records.delete_many({})
