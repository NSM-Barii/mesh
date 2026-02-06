// RUN MAIN LOGIC FROM HERE


// IMPORTS
#include <Arduino.h>
#include <nsm_ui.h>
#include <nsm_spammer.h>



// INIT
UI ui;
BLE_Spammer ble;



void setup() {
  ui.begin();
  ble.begin();

}

void loop() {
  ui.update();
  ble.update(ui.advertising, ui.deviceCount);

}

