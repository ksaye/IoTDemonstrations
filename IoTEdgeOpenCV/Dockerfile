FROM ubuntu:xenial

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends libcurl4-openssl-dev python-pip libboost-python-dev 
#    rm -rf /var/lib/apt/lists/* 

# Needed to get the OpenCV python module  -- this takes SEVERAL minutes
# or import   opencv-python==3.4.0.12
RUN apt-get install -y cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
RUN apt-get install -y python-dev python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev

RUN git clone https://github.com/opencv/opencv.git

RUN cd opencv && \
    mkdir release && \
    cd release && \
    cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local .. && \
    make && \
    make install

RUN apt-get install -y python-setuptools
RUN pip install wheel
RUN pip install numpy
RUN pip install matplotlib
RUN pip install scipy
RUN pip install imread
RUN pip install pillow

RUN python -c "import cv2; print(cv2.getBuildInformation())"

# end of OpenCV section

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

CMD [ "python", "-u", "./main.py" ]