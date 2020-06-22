import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import { ExampleHomebridgePlatform } from './platform';
import http from "http";

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ExamplePlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  }

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    if (this.accessory.context.device.type == "Lightbulb")
    {
      // get the LightBulb service if it exists, otherwise create a new LightBulb service
      // you can create multiple services for each accessory
      this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

      // To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
      // when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
      // this.accessory.getService('NAME') ?? this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE');

      // set the service name, this is what is displayed as the default name on the Home app
      // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
      this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

      // each service must implement at-minimum the "required characteristics" for the given service type
      // see https://developers.homebridge.io/#/service/Lightbulb

      // register handlers for the On/Off Characteristic
      this.service.getCharacteristic(this.platform.Characteristic.On)
        .on('set', this.setOn.bind(this))                // SET - bind to the `setOn` method below
        .on('get', this.getOn.bind(this));               // GET - bind to the `getOn` method below
      this.platform.log.debug(this.accessory.context.device.displayName + " setOn join " + this.accessory.context.device.setOn);
      this.platform.log.debug(this.accessory.context.device.displayName + " getOn join " + this.accessory.context.device.getOn);
      this.platform.log.debug(this.accessory.context.device.displayName + " setOff join " + this.accessory.context.device.setOff);
      if (this.accessory.context.device.setBrightness)
      {
        // register handlers for the Brightness Characteristic
        this.service.getCharacteristic(this.platform.Characteristic.Brightness)
          .on('set', this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below
        this.platform.log.debug(this.accessory.context.device.displayName + " setBrightness join " + this.accessory.context.device.setBrightness);
        if (this.accessory.context.device.getBrightness)
        {
          this.service.getCharacteristic(this.platform.Characteristic.Brightness)
            .on('get', this.getBrightness.bind(this));       // GET - bind to the 'getBrightness` method below
          this.platform.log.debug(this.accessory.context.device.displayName + " getBrightness join " + this.accessory.context.device.setBrightness);
        }
      }
      if (this.accessory.context.device.setHue)
      {
        // register handlers for the Hue Characteristic
        this.service.getCharacteristic(this.platform.Characteristic.Hue)
          .on('set', this.setHue.bind(this));       // SET - bind to the 'setHue` method below
        this.platform.log.debug(this.accessory.context.device.displayName + " setHue join " + this.accessory.context.device.setHue);
        if (this.accessory.context.device.getHue)
        {
          this.service.getCharacteristic(this.platform.Characteristic.Hue)
            .on('get', this.getHue.bind(this));       // GET - bind to the 'getHue` method below
          this.platform.log.debug(this.accessory.context.device.displayName + " getHue join " + this.accessory.context.device.getHue);
        }
      }
      if (this.accessory.context.device.setSaturation)
      {
        // register handlers for the Saturation Characteristic
        this.service.getCharacteristic(this.platform.Characteristic.Saturation)
          .on('set', this.setSaturation.bind(this));       // SET - bind to the 'setSaturation` method below
        this.platform.log.debug(this.accessory.context.device.displayName + " setSaturation join " + this.accessory.context.device.setSaturation);
        if (this.accessory.context.device.getSaturation)
        {
          this.service.getCharacteristic(this.platform.Characteristic.Saturation)
            .on('get', this.getSaturation.bind(this));       // GET - bind to the 'getSaturation` method below
          this.platform.log.debug(this.accessory.context.device.displayName + " getSaturation join " + this.accessory.context.device.getSaturation);
        }
      }
    }
    else if (this.accessory.context.device.type == "WindowCovering")
    {
      // get the LightBulb service if it exists, otherwise create a new LightBulb service
      // you can create multiple services for each accessory
      this.service = this.accessory.getService(this.platform.Service.WindowCovering) || this.accessory.addService(this.platform.Service.WindowCovering);

      // To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
      // when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
      // this.accessory.getService('NAME') ?? this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE');

      // set the service name, this is what is displayed as the default name on the Home app
      // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
      this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

      // each service must implement at-minimum the "required characteristics" for the given service type
      // see https://developers.homebridge.io/#/service/Lightbulb

      // create handlers for required characteristics
      this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
        .on('get', this.handleCurrentPositionGet.bind(this));

      this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
        .on('get', this.handleTargetPositionGet.bind(this))
        .on('set', this.handleTargetPositionSet.bind(this));

      this.service.getCharacteristic(this.platform.Characteristic.PositionState)
        .on('get', this.handlePositionStateGet.bind(this));
    }
    else
    {
      this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    }

    // EXAMPLE ONLY
    // Example showing how to update the state of a Characteristic asynchronously instead
    // of using the `on('get')` handlers.
    //
    // Here we change update the brightness to a random value every 5 seconds using
    // the `updateCharacteristic` method.
    // setInterval(() => {
    //   // assign the current brightness a random value between 0 and 100
    //   const currentBrightness = Math.floor(Math.random() * 100);
    //
    //   // push the new value to HomeKit
    //   this.service.updateCharacteristic(this.platform.Characteristic.Brightness, currentBrightness);
    //
    //   this.platform.log.debug('Pushed updated current Brightness state to HomeKit:', currentBrightness);
    // }, 10000);

    this.accessory.context.eventFeedback.on('update', (payload) => {
      this.platform.log.info(this.accessory.context.device.displayName + ' payload update ' +  payload.joinType);
      this.platform.log.info(this.accessory.context.device.displayName + ' payload join ' +  payload.join);
      this.platform.log.info(this.accessory.context.device.displayName + ' payload value ' +  payload.payloadValue);

      if (payload.joinType == "digital" && payload.join == this.accessory.context.device.getOn)
      {
        this.platform.log.info(this.accessory.context.device.displayName + " set value to " + payload.payloadValue);
        this.service.updateCharacteristic(this.platform.Characteristic.On, payload.payloadValue);
      }
      else if (payload.joinType == "analog" && payload.join == this.accessory.context.device.getBrightness)
      {
        this.platform.log.info(this.accessory.context.device.displayName + " set brightness to " + payload.payloadValue);
        this.service.updateCharacteristic(this.platform.Characteristic.Brightness, payload.payloadValue);
      }
    });
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to turn your device on/off
    this.exampleStates.On = value as boolean;

    function dwrite(join)
    {
      function pad(num, size){     return ('000000000' + num).substr(-size); }
      http.request({
        host: '192.168.88.41',
        port: '7001',
        path: '/D' + pad(join, 4)
      }, (response) => {
        var str = '';
        response.on('data', (chunk) => str += chunk);
        response.on('end', () => console.log(str));
      }).end();
    }

    if (value as boolean)
      dwrite(this.accessory.context.device.setOn);
    else
      dwrite(this.accessory.context.device.setOff);

    this.platform.log.debug('Set Characteristic On ->', value);

    // you must call the callback function
    callback(null);
  }

  digitalRead(join, returnFn)
  {
    function pad(num, size){     return ('000000000' + num).substr(-size); }
    http.request({
      host: '192.168.88.41',
      port: '7001',
      path: '/G' + pad(join, 4)
    }, (response) => {
      var str = '';
      response.on('data', (chunk) => str += chunk);
      response.on('end', () => {
        console.log("read:" + str);
        returnFn(str);
      });
    }).end();
  }

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
  getOn(callback: CharacteristicGetCallback) {

    // implement your own code to check if the device is on
    //const isOn = this.exampleStates.On;

    this.digitalRead(this.accessory.context.device.getOn, (value) => {
      const isOn = value;
      this.platform.log.debug('Get Characteristic On ->', isOn);
      callback(null, isOn);
    });

    //this.platform.log.debug('Get Characteristic On ->', isOn);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    //callback(null, isOn);
  }

  analogWrite(join, value)
  {
    function pad(num, size){     return ('000000000' + num).substr(-size); }
    http.request({
      host: '192.168.88.41',
      port: '7001',
      path: '/A' + pad(join, 4) + 'V' + pad(value, 5)
    }, (response) => {
      var str = '';
      response.on('data', (chunk) => str += chunk);
      response.on('end', () => console.log(str));
    }).end();
  }

  analogRead(join, returnFn)
  {
    function pad(num, size){     return ('000000000' + num).substr(-size); }
    http.request({
      host: '192.168.88.41',
      port: '7001',
      path: '/R' + pad(join, 4)
    }, (response) => {
      var str = '';
      response.on('data', (chunk) => str += chunk);
      response.on('end', () => {
        console.log("read:" + str);
        returnFn(str);
      });
    }).end();
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to set the brightness
    this.exampleStates.Brightness = value as number;
    this.analogWrite(this.accessory.context.device.setBrightness, value);
    this.platform.log.debug('Set Characteristic Brightness -> ', value);

    // you must call the callback function
    callback(null);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, changing the Brightness
   *
   */
  getBrightness(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET Brightness');
    this.analogRead(this.accessory.context.device.getBrightness, (value) => {
      const currentBrightness = value;
      this.platform.log.debug('Get Characteristic Brightness ->', currentBrightness);
      callback(null, currentBrightness);
    });
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Hue
   */
  setHue(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.analogWrite(this.accessory.context.device.setHue, value);
    this.platform.log.debug('Set Characteristic Hue -> ', value);
    callback(null);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, changing the Hue
   *
   */
  getHue(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET Hue');
    this.analogRead(this.accessory.context.device.getHue, (value) => {
      const currentHue = value;
      this.platform.log.debug('Get Characteristic Hue ->', currentHue);
      callback(null, currentHue);
    });
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Saturation
   */
  setSaturation(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.analogWrite(this.accessory.context.device.setSaturation, value);
    this.platform.log.debug('Set Characteristic Saturation -> ', value);
    callback(null);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, changing the Saturation
   *
   */
  getSaturation(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET Saturation');
    this.analogRead(this.accessory.context.device.getSaturation, (value) => {
      const currentSaturation = value;
      this.platform.log.debug('Get Characteristic Saturation ->', currentSaturation);
      callback(null, currentSaturation);
    });
  }

  /**
   * Handle requests to get the current value of the "Current Position" characteristic
   */
  handleCurrentPositionGet(callback) {
    this.platform.log.debug('Triggered GET CurrentPosition');
    this.analogRead(this.accessory.context.device.getCurrentPosition, (value) => {
      const CurrentPosition = value;
      this.platform.log.debug('Get Characteristic CurrentPosition ->', CurrentPosition);
      callback(null, CurrentPosition);
    });
  }


  /**
   * Handle requests to get the current value of the "Target Position" characteristic
   */
  handleTargetPositionGet(callback) {
    this.platform.log.debug('Triggered GET TargetPosition');
    this.analogRead(this.accessory.context.device.setTargetPosition, (value) => {
      const TargetPosition = value;
      this.platform.log.debug('Get Characteristic TargetPosition ->', TargetPosition);
      callback(null, TargetPosition);
    });
  }

  /**
   * Handle requests to set the "Target Position" characteristic
   */
  handleTargetPositionSet(value, callback) {
    this.platform.log.debug('Triggered SET TargetPosition:' + value);
    this.analogWrite(this.accessory.context.device.setTargetPosition, value);
    callback(null);
  }

  /**
   * Handle requests to get the current value of the "Position State" characteristic
   */
  handlePositionStateGet(callback) {
    this.platform.log.debug('Triggered GET PositionState');

    this.digitalRead(this.accessory.context.device.getGoingMin, (value) => {
      const isOn = value;
      this.platform.log.debug('Position getGoingMin ->', isOn);
      if (isOn)
        callback(null, 0);
    });
    this.digitalRead(this.accessory.context.device.getGoingMax, (value) => {
      const isOn = value;
      this.platform.log.debug('Position getGoingMax ->', isOn);
      if (isOn)
        callback(null, 1);
    });
    this.digitalRead(this.accessory.context.device.getStopped, (value) => {
      const isOn = value;
      this.platform.log.debug('Position getStopped ->', isOn);
      if (isOn)
        callback(null, 2);
    });
  }
}
