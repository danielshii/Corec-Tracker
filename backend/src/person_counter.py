from numpy.lib.type_check import imag
import cv2
import numpy as np
import imutils
import time
import os

protopath = "resources/MobileNetSSD_deploy.prototxt"
modelpath = "resources/MobileNetSSD_deploy.caffemodel"

detector = cv2.dnn.readNetFromCaffe(protopath, modelpath)

# constants
PERSON_INDEX = 15
CONFIDENCE = 0.9
SNAPSHOT_INTERVAL = 1.0


def count_people_in_image(path):
    try:
        image = cv2.imread(path)
        image = imutils.resize(image, width=600)

        (H, W) = image.shape[:2]

        blob = cv2.dnn.blobFromImage(image, 0.007843, (W, H), 127.5)
        detector.setInput(blob)

        person_detections = detector.forward()

        people = 0
        for i in np.arange(0, person_detections.shape[2]):
            confidence = person_detections[0, 0, i, 2]
            if confidence > CONFIDENCE:
                index = int(person_detections[0, 0, i, 1])
                if index == PERSON_INDEX:
                    people += 1
                    person_box = person_detections[0, 0, i, 3:7] * np.array([W, H, W, H])
                    (startX, startY, endX, endY) = person_box.astype("int")
                    cv2.rectangle(image, (startX, startY), (endX, endY), (0, 255, 0), 2)

        #image = cv2.addWeighted(image, 0.7, image, 0, 0)
        print(str(people) + " people counted")
        os.remove(path)
        cv2.destroyAllWindows()
        return people
    except Exception as e:
        print(e)
        return 0
