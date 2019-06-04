FROM mcr.microsoft.com/windows/servercore:1803-amd64
# 2 GB download, 5 GB on disk

RUN curl -o c:\python-3.7.3-amd64.exe https://www.python.org/ftp/python/3.7.3/python-3.7.3-amd64.exe

RUN python-3.7.3-amd64.exe /quiet InstallAllUsers=1 TargetDir=c:\Python PrependPath=1 Shortcuts=0 Include_doc=0 Include_pip=0 Include_test=0

RUN curl -o c:\get-pip.py https://bootstrap.pypa.io/get-pip.py

RUN python.exe c:\get-pip.py --disable-pip-version-check --no-cache-dir

RUN pip install --upgrade setuptools 
COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT [ "python", "-u", "main.py" ]