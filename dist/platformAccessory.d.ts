import { PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import { ExampleHomebridgePlatform } from './platform';
export declare class ExamplePlatformAccessory {
    private readonly platform;
    private readonly accessory;
    private service;
    constructor(platform: ExampleHomebridgePlatform, accessory: PlatformAccessory);
    pad(num: any, size: any): string;
    fetchRetry(url: any): any;
    digitalWrite(join: any): void;
    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
     */
    setOn(value: CharacteristicValue, callback: CharacteristicSetCallback): void;
    digitalRead(join: any, returnFn: any): void;
    /**
     * Handle the "GET" requests from HomeKit
     * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
     *
     * GET requests should return as fast as possbile. A long delay here will result in
     * HomeKit being unresponsive and a bad user experience in general.
     *
     * If your device takes time to respond you should update the status of your device
     * asynchronously instead using the `updateCharacteristic` method instead.
  
     * @example
     * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
     */
    getOn(callback: CharacteristicGetCallback): void;
    analogWrite(join: any, value: any): void;
    analogRead(join: any, returnFn: any): void;
    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, changing the Brightness
     */
    setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback): void;
    /**
     * Handle the "GET" requests from HomeKit
     * These are sent when HomeKit wants to know the current state of the accessory, for example, changing the Brightness
     *
     */
    getBrightness(callback: CharacteristicGetCallback): void;
    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, changing the Hue
     */
    setHue(value: CharacteristicValue, callback: CharacteristicSetCallback): void;
    /**
     * Handle the "GET" requests from HomeKit
     * These are sent when HomeKit wants to know the current state of the accessory, for example, changing the Hue
     *
     */
    getHue(callback: CharacteristicGetCallback): void;
    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, changing the Saturation
     */
    setSaturation(value: CharacteristicValue, callback: CharacteristicSetCallback): void;
    /**
     * Handle the "GET" requests from HomeKit
     * These are sent when HomeKit wants to know the current state of the accessory, for example, changing the Saturation
     *
     */
    getSaturation(callback: CharacteristicGetCallback): void;
    /**
     * Handle requests to get the current value of the "Current Position" characteristic
     */
    handleCurrentPositionGet(callback: any): void;
    /**
     * Handle requests to get the current value of the "Target Position" characteristic
     */
    handleTargetPositionGet(callback: any): void;
    /**
     * Handle requests to set the "Target Position" characteristic
     */
    handleTargetPositionSet(value: any, callback: any): void;
    /**
     * Handle requests to set the "Hold Position" characteristic
     */
    handleHoldPositionSet(value: any, callback: any): void;
    /**
     * Handle requests to get the current value of the "Position State" characteristic
     */
    handlePositionStateGet(callback: any): void;
}
//# sourceMappingURL=platformAccessory.d.ts.map