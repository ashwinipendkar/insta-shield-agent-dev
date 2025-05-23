

import time
import ctypes
import sys

def get_idle_duration():
    class LASTINPUTINFO(ctypes.Structure):
        _fields_ = [("cbSize", ctypes.c_uint), ("dwTime", ctypes.c_uint)]

    lii = LASTINPUTINFO()
    lii.cbSize = ctypes.sizeof(lii)
    if ctypes.windll.user32.GetLastInputInfo(ctypes.byref(lii)):
        millis = ctypes.windll.kernel32.GetTickCount() - lii.dwTime
        return millis / 1000.0
    return 0

last_status = None  # Track status to avoid redundant prints

while True:
    idle_seconds = get_idle_duration()
    if idle_seconds >= 60:
        current_status = "idle"
    else:
        current_status = "active"
    
    if current_status != last_status:
        print(f"Status: {current_status}", flush=True)
        last_status = current_status

    time.sleep(5)
