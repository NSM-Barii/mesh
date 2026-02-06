// THIS WILL HOUSE M5 BT SPAM LOGIC


// IMPORTS
#pragma once
#include <Arduino.h>
#include <NimBLEDevice.h>

class BLE_Spammer {
  public:

    void begin() {
      NimBLEDevice::init("");
      adv = NimBLEDevice::getAdvertising();
      adv->setMinInterval(0x20);
      adv->setMaxInterval(0x40);
    }

    void update(bool enabled, int count) {
      if (!enabled) {
        stop();
        return;
      }

      unsigned long now = millis();
      if (now - lastRotate < rotateDelay) return;
      lastRotate = now;

      advertiseOne(currentIndex);
      currentIndex = (currentIndex + 1) % count;
    }

    void stop() {
      if (adv) adv->stop();
    }

  private:
    NimBLEAdvertising* adv = nullptr;
    int currentIndex = 0;
    unsigned long lastRotate = 0;
    const unsigned long rotateDelay = 200;

    void advertiseOne(int index) {
      if (!adv) return;

      adv->stop();

      NimBLEAdvertisementData data;

      String name = "BLE_Device_" + String(index + 1);
      data.setName(name.c_str());

      uint8_t mfg[4] = {
        0x01,
        (uint8_t)index,
        0xAA,
        0x55
      };

      data.setManufacturerData(
        std::string((char*)mfg, sizeof(mfg))
      );

      adv->setAdvertisementData(data);
      adv->start();
    }
};



// The n word only offends people who want to be offended