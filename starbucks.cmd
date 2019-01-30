REM a single Azure Sphere Script for Starbucks
REM waiting for a device to be connected
@ECHO OFF
CLS
time /t

REM adding Sphere to the path.
set PATH=%PATH%;"C:\Program Files (x86)\Microsoft Azure Sphere SDK\Tools\"
set webHost="http://kevinsay.azurewebsites.net/api/StarbucksDemo?code=oVXpsRSwny4vQcmJCHDmaQmLUv9j9afLJhQK5vSPDCxhUAONMf07BQ=="
set AvnetSSID="IOTDEMO"
set AvnetPass="iotDemo1"
set unique-dg-id="96cb06c1-00e3-40a8-b0ef-37e06265a842"
set unique-sku-id="3a85b7f1-3d20-4563-ab15-e833d43450f2"
set IMAGE="Mt3620AzureIoTHub7.imagepackage"

:updateQA
REM need to add 'git update' logic if new, have it download and restart the script
REM Mark, can you add this section?

:waiting
REM checking to see if we are logged in
azsphere tenant show-selected | find /I "Default Azure Sphere tenant" > NULL
	if NOT %ERRORLEVEL% == 0 ( goto errorH)

REM only starts when the Sphere device is connected.  We know this by the ERRORLEVEL.
REM gets the deviceID of the attached sphere into a variable
azsphere dev show-attached | find "Device" > deviceid.txt
if %ERRORLEVEL% == 0 (
	echo Device found.
	for /F "tokens=3 delims=: " %%A in (deviceid.txt) do set deviceID="%%A"
REM	set /p deviceID= < deviceid.txt
	goto realWork 
	) else (
	REM looping until we see a device connected
	goto waiting)
 
:realWork
REM ask the user for the serial number
set /p serialNumber=What is the Avnet Device Serial Number (Control+C to exit)?
if '%serialNumber%' == '' goto waiting

set /p confirm=You entered '%serialNumber%', if correct hit enter, else type restart to restart
if NOT '%confirm%' == '' goto updateQA

REM starting the real processing 
azsphere device recover
 	if NOT %ERRORLEVEL% == 0 ( goto errorH)
timeout /t 5 /nobreak && azsphere device claim
	if NOT %ERRORLEVEL% == 0 ( goto errorH)
timeout /t 5 /nobreak && azsphere device restart
	if NOT %ERRORLEVEL% == 0 ( goto errorH)
timeout /t 5 /nobreak && azsphere device wifi add --ssid %AvnetSSID% --key %AvnetPass%
	if NOT %ERRORLEVEL% == 0 ( goto errorH)
timeout /t 5 /nobreak && azsphere device restart
	if NOT %ERRORLEVEL% == 0 ( goto errorH)
timeout /t 5 /nobreak && azsphere device prep-debug
REM load the ethernet module 
azsphere img package-board-config --preset lan-enc28j60-isu0-int5 --output ethernetModule
timeout /t 5 /nobreak && azsphere device sideload deploy -p ethernetModule
REM	if NOT %ERRORLEVEL% == 0 ( goto errorH)
timeout /t 5 /nobreak && azsphere device sideload deploy -p %IMAGE%
	if NOT %ERRORLEVEL% == 0 ( goto errorH)

REM write the serial number an Sphere Device ID to a file and posting it to a web host
echo %serialNumber%,%deviceID% >> assetdatabase.csv
curl -m 60 -X POST --data-ascii "{'serialNumber': '%serialNumber%' , 'deviceId':'%deviceID%'}" %webHost% > output.txt
if %ERRORLEVEL% == 0 (
	REM we are continuing
	) else (
	echo ERROR: we had an error
	type output.txt
	pause)

timeout /t 5 /nobreak && azsphere device prep-field --devicegroupid %unique-dg-id% --skuid %unique-sku-id%
	if NOT %ERRORLEVEL% == 0 ( goto errorH)

REM final verification
timeout /t 5 /nobreak && azsphere device restart
	if NOT %ERRORLEVEL% == 0 ( goto errorH)

for /L %%a in (1,1, 20) Do (
	timeout /t 15 /nobreak
REM	azsphere dev img list-installed | find /I "lan-enc" && azsphere dev img list-installed | find /I "siot"
	azsphere dev img list-installed | find /I "No installed"
		if %ERRORLEVEL% == 0 (
			time /t
			echo Success: Provisioning complete.  Remove the Sphere module and when you plug one in the script will restart
			goto endVerifyLoop
			)
)
REM if we are here, we must have timed out
goto errorH

:endVerifyLoop
echo Waiting for the device to be unplugged.
azsphere dev show-attached > NULL
	REM here we are waiting for an error -- meaning the board is unplugged
	if %ERRORLEVEL% == 1 goto updateQA
timeout /t 15 > NULL
goto endVerifyLoop

:errorH
	Echo we had an error, script stopping
	goto eof

:eof
echo end of script
time /t
@ECHO ON