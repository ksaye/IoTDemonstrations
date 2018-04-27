FROM ubuntu:xenial

WORKDIR /app

RUN apt update && \
    apt install -y vim python-pip python-setuptools python-opencv libopencv-dev python-dev libboost-python-dev libcurl4-openssl-dev

RUN pip install azure-iothub-device-client==1.3.0.0b0 scipy

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

CMD [ "python", "-u", "./main.py" ]
