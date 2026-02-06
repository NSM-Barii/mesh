#pragma once
#include <M5StickCPlus2.h>

class UI {
    public:
    int deviceCount = 5;
    bool advertising = false;

    void begin() {
        M5.begin();
        M5.Display.setRotation(1);
        draw();
    }

    void update() {
        M5.update();

        if (M5.BtnA.wasPressed()) {
        if (deviceCount < 10) {
            deviceCount++;
            draw();
        }
        }

        if (M5.BtnB.wasPressed()) {
        advertising = !advertising;
        draw();
        }
    }

    private:
    void draw() {
        M5.Display.clear();
        M5.Display.setTextSize(2);
        M5.Display.setCursor(10, 30);
        M5.Display.printf("Devices: %d\n\n", deviceCount);
        M5.Display.printf("Status: %s", advertising ? "ON" : "OFF");
    }
};
