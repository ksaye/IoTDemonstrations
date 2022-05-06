import webrepl

## connect to wifi at boot time.

def connect():
    import network
    sta_if = network.WLAN(network.STA_IF)
    if not sta_if.isconnected():
        print('connecting to network...')
        sta_if.active(True)
        sta_if.connect('mywifi', 'mywifipassword1')
        while not sta_if.isconnected():
            pass
    print('network config:', sta_if.ifconfig())
    print('my ip is ' + str(sta_if.ifconfig()[0]))

def no_debug():
    import esp
    # you can run this from the REPL as well
    esp.osdebug(None)

#no_debug()
connect()

webrepl.start()