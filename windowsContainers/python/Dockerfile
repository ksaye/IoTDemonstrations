FROM mcr.microsoft.com/dotnet/core/runtime:2.1.13-nanoserver-1809
SHELL ["cmd", "/S", "/C"]

RUN mkdir c:\temp && cd c:\temp && \
    curl.exe -o python.zip -L https://globalcdn.nuget.org/packages/python.3.7.4.nupkg && \
    tar.exe -xf c:\temp\python.zip -C c:\temp && \
    MOVE c:\temp\tools c:\ && \
    REN c:\tools python && \
    CD \ && \
    RD /S /Q c:\temp

WORKDIR /app

COPY requirements.txt ./
RUN C:\Python\python.exe -m pip install -r requirements.txt

COPY . .

ENTRYPOINT C:\Python\python.exe -u main.py