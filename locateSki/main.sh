#!/bin/sh
while [ True ]
do
    ps -auxww | grep /opt/gps/main.py | grep -v grep > /dev/null
    if [ $? -ne 0 ]
        then
        /opt/gps/main.py &      # Run the python code, if not running
    fi

    ps -auxww | grep /opt/gps/receive.py | grep -v grep > /dev/null
    if [ $? -ne 0 ]
        then
        /opt/gps/receive.py &      # Run the python code, if not running
    fi
    
    sleep 3      # sleep and 
done
