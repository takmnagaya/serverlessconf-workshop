import time
import os

def handle(req):
    """handle a request to the function
    Args:
        req (str): request body
    """

    sleep_duration = int(os.getenv("sleep_duration", "10"))
    preSleep = "Starting to sleep for %d" % sleep_duration
    time.sleep(sleep_duration)  # Sleep for a number of seconds
    postSleep = "Finished the sleep"
    return preSleep + "\n" + postSleep
