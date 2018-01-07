int MUXPinS0 = D7;
int MUXPinS1 = D6;
int MUXPinS2 = D5;
int MUXPinS3 = D4;
// wire (multiplexor)EN to (ESP)GND, SIG to A0, VCC to 3v3 and GND to GND

void setup()
{
	Serial.begin(115200);
	pinMode(MUXPinS0, OUTPUT);
	pinMode(MUXPinS1, OUTPUT);
	pinMode(MUXPinS2, OUTPUT);
	pinMode(MUXPinS3, OUTPUT);
}

void loop()
{
	Serial.println("Values");
	while (true) {
		for (int i = 0; i < 16; i++)
		{
			Serial.print("C");
			Serial.print(i);
			Serial.print(" = ");
			Serial.print(getAnalog(i));
			Serial.print(", ");
			delay(2000);
		}
		Serial.println("");
	}
}

float getAnalog(int MUXyPin) {
	//MUXyPin must be 0 to 15 representing the analog pin you want to read
	//MUXPinS3 to MUXPinS0 are the Arduino pins connected to the selector pins of this board.
	digitalWrite(MUXPinS3, HIGH && (MUXyPin & B00001000));
	digitalWrite(MUXPinS2, HIGH && (MUXyPin & B00000100));
	digitalWrite(MUXPinS1, HIGH && (MUXyPin & B00000010));
	digitalWrite(MUXPinS0, HIGH && (MUXyPin & B00000001));
	return (float)analogRead(A0);
}