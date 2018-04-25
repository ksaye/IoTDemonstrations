FROM ubuntu:xenial

WORKDIR /app

RUN apt update && \
    apt install -y vim python-pip python-setuptools python-opencv libopencv-dev python-dev libboost-python-dev libcurl4-openssl-dev

#RUN apt-get update && \
#    apt-get install -y --no-install-recommends python-setuptools python-opencv libopencv-dev python-dev libcurl4-openssl-dev python-pip libboost-python-dev
#    rm -rf /var/lib/apt/lists/* 

#RUN apt-get install -y cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
#RUN apt-get install -y python-dev python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev

#RUN apt-get install -y python-setuptools
#RUN pip install wheel
#RUN pip install numpy
#RUN pip install matplotlib
#RUN pip install scipy
#RUN pip install imread
#RUN pip install pillow

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

CMD [ "python", "-u", "./main.py" ]
