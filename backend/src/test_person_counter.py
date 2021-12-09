import person_counter as pc
import unittest


class TestPersonCounter(unittest.TestCase):
    def testCount(self):
        assert pc.count_people_in_image('../images/test/Frame1.jpg') == 1
        #assert pc.count_people_in_image('../images/test/input_image3.png') == 3
