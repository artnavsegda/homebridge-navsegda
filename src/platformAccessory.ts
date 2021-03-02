/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import { CrestronHomebridgePlatform } from './platform';

export class CrestronPlatformAccessory {
  private service: Service;

  constructor(
    private readonly platform: CrestronHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly cip,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    if (this.accessory.context.device.type == 'Lightbulb') {
      this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
      this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
      // register handlers for the On/Off Characteristic
      this.service.getCharacteristic(this.platform.Characteristic.On)
        .on('set', this.setOn.bind(this))                // SET - bind to the `setOn` method below
        .on('get', this.getOn.bind(this));               // GET - bind to the `getOn` method below
      this.platform.log.debug(this.accessory.context.device.displayName + ' setOn join ' + this.accessory.context.device.setOn);
      this.platform.log.debug(this.accessory.context.device.displayName + ' getOn join ' + this.accessory.context.device.getOn);
      this.platform.log.debug(this.accessory.context.device.displayName + ' setOff join ' + this.accessory.context.device.setOff);
      if (this.accessory.context.device.setBrightness) {
        // register handlers for the Brightness Characteristic
        this.service.getCharacteristic(this.platform.Characteristic.Brightness)
          .on('set', this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below
        this.platform.log.debug(this.accessory.context.device.displayName + ' setBrightness join ' + this.accessory.context.device.setBrightness);
        if (this.accessory.context.device.getBrightness) {
          this.service.getCharacteristic(this.platform.Characteristic.Brightness)
            .on('get', this.getBrightness.bind(this));       // GET - bind to the 'getBrightness` method below
          this.platform.log.debug(this.accessory.context.device.displayName + ' getBrightness join ' + this.accessory.context.device.setBrightness);
        }
      }
      if (this.accessory.context.device.setHue) {
        // register handlers for the Hue Characteristic
        this.service.getCharacteristic(this.platform.Characteristic.Hue)
          .on('set', this.setHue.bind(this));       // SET - bind to the 'setHue` method below
        this.platform.log.debug(this.accessory.context.device.displayName + ' setHue join ' + this.accessory.context.device.setHue);
        if (this.accessory.context.device.getHue) {
          this.service.getCharacteristic(this.platform.Characteristic.Hue)
            .on('get', this.getHue.bind(this));       // GET - bind to the 'getHue` method below
          this.platform.log.debug(this.accessory.context.device.displayName + ' getHue join ' + this.accessory.context.device.getHue);
        }
      }
      if (this.accessory.context.device.setSaturation) {
        // register handlers for the Saturation Characteristic
        this.service.getCharacteristic(this.platform.Characteristic.Saturation)
          .on('set', this.setSaturation.bind(this));       // SET - bind to the 'setSaturation` method below
        this.platform.log.debug(this.accessory.context.device.displayName + ' setSaturation join ' + this.accessory.context.device.setSaturation);
        if (this.accessory.context.device.getSaturation) {
          this.service.getCharacteristic(this.platform.Characteristic.Saturation)
            .on('get', this.getSaturation.bind(this));       // GET - bind to the 'getSaturation` method below
          this.platform.log.debug(this.accessory.context.device.displayName + ' getSaturation join ' + this.accessory.context.device.getSaturation);
        }
      }
    } else if (this.accessory.context.device.type == 'WindowCovering') {
      this.service = this.accessory.getService(this.platform.Service.WindowCovering) || this.accessory.addService(this.platform.Service.WindowCovering);
      this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

      // create handlers for required characteristics
      this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
        .on('get', this.handleCurrentPositionGet.bind(this));

      this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
        .on('get', this.handleTargetPositionGet.bind(this))
        .on('set', this.handleTargetPositionSet.bind(this));

      this.service.getCharacteristic(this.platform.Characteristic.PositionState)
        .on('get', this.handlePositionStateGet.bind(this));

      if (this.accessory.context.device.setHoldPosition) {
        this.service.getCharacteristic(this.platform.Characteristic.HoldPosition)
          .on('set', this.handleHoldPositionSet.bind(this));
      }
    } else if (this.accessory.context.device.type == 'MotionSensor') {
      this.service = this.accessory.getService(this.platform.Service.MotionSensor) || this.accessory.addService(this.platform.Service.MotionSensor);
      this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
      this.service.getCharacteristic(this.platform.Characteristic.MotionDetected)
        .on('get', this.handleMotionDetectedGet.bind(this));
    } else if (this.accessory.context.device.type == 'Heater') {
      this.service = this.accessory.getService(this.platform.Service.MotionSensor) || this.accessory.addService(this.platform.Service.MotionSensor);
      this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
      this.service.getCharacteristic(this.Characteristic.Active)
        .on('get', this.handleActiveGet.bind(this))
        .on('set', this.handleActiveSet.bind(this));

      this.service.getCharacteristic(this.Characteristic.CurrentHeaterCoolerState)
        .on('get', this.handleCurrentHeaterCoolerStateGet.bind(this));

      this.service.getCharacteristic(this.Characteristic.TargetHeaterCoolerState)
        .on('get', this.handleTargetHeaterCoolerStateGet.bind(this))
        .on('set', this.handleTargetHeaterCoolerStateSet.bind(this));

      this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
        .on('get', this.handleCurrentTemperatureGet.bind(this));
    } else {
      this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    }

    this.accessory.context.eventFeedback.on('update', (payload) => {
      //this.platform.log.info(this.accessory.context.device.displayName + ' payload update ' +  payload.joinType);
      //this.platform.log.info(this.accessory.context.device.displayName + ' payload join ' +  payload.join);
      //this.platform.log.info(this.accessory.context.device.displayName + ' payload value ' +  payload.payloadValue);

      if (payload.joinType == 'digital') {
        if (payload.join == this.accessory.context.device.getOn) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set value to ' + payload.payloadValue);
          this.service.updateCharacteristic(this.platform.Characteristic.On, payload.payloadValue);
        } else if (payload.join == this.accessory.context.device.getGoingMin) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set GoingMin to ' + payload.payloadValue);
          if (payload.payloadValue == 1) {
            this.platform.log.info(this.accessory.context.device.displayName + ' set PositionState to 0');
            this.service.updateCharacteristic(this.platform.Characteristic.PositionState, 0);
          }
        } else if (payload.join == this.accessory.context.device.getGoingMax) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set GoingMax to ' + payload.payloadValue);
          if (payload.payloadValue == 1) {
            this.platform.log.info(this.accessory.context.device.displayName + ' set PositionState to 1');
            this.service.updateCharacteristic(this.platform.Characteristic.PositionState, 1);
          }
        } else if (payload.join == this.accessory.context.device.getStopped) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set Stopped to ' + payload.payloadValue);
          if (payload.payloadValue == 1) {
            this.platform.log.info(this.accessory.context.device.displayName + ' set PositionState to 2');
            this.service.updateCharacteristic(this.platform.Characteristic.PositionState, 2);
          }
        } else if (payload.join == this.accessory.context.device.getMotionDetected) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set MotionDetected to ' + payload.payloadValue);
          this.service.updateCharacteristic(this.platform.Characteristic.MotionDetected, payload.payloadValue);
        }
      } else if (payload.joinType == 'analog') {
        if (payload.join == this.accessory.context.device.getBrightness) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set brightness to ' + payload.payloadValue);
          this.service.updateCharacteristic(this.platform.Characteristic.Brightness, payload.payloadValue);
        } else if (payload.join == this.accessory.context.device.getCurrentPosition) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set CurrentPosition to ' + payload.payloadValue);
          this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, payload.payloadValue);
        } else if (payload.join == this.accessory.context.device.getTargetPosition) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set TargetPosition to ' + payload.payloadValue);
          this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, payload.payloadValue);
        } else if (payload.join == this.accessory.context.device.getHue) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set Hue to ' + payload.payloadValue);
          this.service.updateCharacteristic(this.platform.Characteristic.Hue, payload.payloadValue);
        } else if (payload.join == this.accessory.context.device.getSaturation) {
          this.platform.log.info(this.accessory.context.device.displayName + ' set Saturation to ' + payload.payloadValue);
          this.service.updateCharacteristic(this.platform.Characteristic.Saturation, payload.payloadValue);
        }
      }
    });
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    if (value as boolean) {
      this.cip.pulse(this.accessory.context.device.setOn);
    } else {
      this.cip.pulse(this.accessory.context.device.setOff);
    }

    this.platform.log.debug('Set Characteristic On ->', value);
    callback(null);
  }

  digitalRead(join, returnFn) {
    if (this.cip.dget(join) == 1) {
      returnFn(true);
    } else {
      returnFn(false);
    }
  }

  getOn(callback: CharacteristicGetCallback) {
    this.digitalRead(this.accessory.context.device.getOn, (value) => {
      const isOn = value;
      this.platform.log.debug('Get Characteristic On ->', isOn);
      callback(null, isOn);
    });
  }

  analogRead(join, returnFn) {
    returnFn(this.cip.aget(join));
  }

  setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.cip.aset(this.accessory.context.device.setBrightness, value);
    this.platform.log.debug('Set Characteristic Brightness -> ', value);

    // you must call the callback function
    callback(null);
  }

  getBrightness(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET Brightness');
    this.analogRead(this.accessory.context.device.getBrightness, (value) => {
      const currentBrightness = value;
      this.platform.log.debug('Get Characteristic Brightness ->', currentBrightness);
      callback(null, currentBrightness);
    });
  }

  setHue(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.cip.aset(this.accessory.context.device.setHue, value);
    this.platform.log.debug('Set Characteristic Hue -> ', value);
    callback(null);
  }

  getHue(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET Hue');
    this.analogRead(this.accessory.context.device.getHue, (value) => {
      const currentHue = value;
      this.platform.log.debug('Get Characteristic Hue ->', currentHue);
      callback(null, currentHue);
    });
  }

  setSaturation(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.cip.aset(this.accessory.context.device.setSaturation, value);
    this.platform.log.debug('Set Characteristic Saturation -> ', value);
    callback(null);
  }

  getSaturation(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET Saturation');
    this.analogRead(this.accessory.context.device.getSaturation, (value) => {
      const currentSaturation = value;
      this.platform.log.debug('Get Characteristic Saturation ->', currentSaturation);
      callback(null, currentSaturation);
    });
  }

  handleCurrentPositionGet(callback) {
    this.platform.log.debug('Triggered GET CurrentPosition');
    this.analogRead(this.accessory.context.device.getCurrentPosition, (value) => {
      const CurrentPosition = value;
      this.platform.log.debug('Get Characteristic CurrentPosition ->', CurrentPosition);
      callback(null, CurrentPosition);
    });
  }

  handleTargetPositionGet(callback) {
    this.platform.log.debug('Triggered GET TargetPosition');
    this.analogRead(this.accessory.context.device.setTargetPosition, (value) => {
      const TargetPosition = value;
      this.platform.log.debug('Get Characteristic TargetPosition ->', TargetPosition);
      callback(null, TargetPosition);
    });
  }

  handleTargetPositionSet(value, callback) {
    this.platform.log.debug('Triggered SET TargetPosition:' + value);
    this.cip.aset(this.accessory.context.device.setTargetPosition, value);
    callback(null);
  }

  handleHoldPositionSet(value, callback) {
    this.platform.log.debug('Triggered SET HoldPosition:' + value);
    if (value as boolean) {
      this.cip.pulse(this.accessory.context.device.setHoldPosition);
    }
    callback(null);
  }

  handlePositionStateGet(callback) {
    this.platform.log.debug('Triggered GET PositionState');

    this.digitalRead(this.accessory.context.device.getGoingMin, (value) => {
      this.platform.log.debug('Position getGoingMin ->', value);
      if (value) {
        callback(null, 0);
      }
    });
    this.digitalRead(this.accessory.context.device.getGoingMax, (value) => {
      this.platform.log.debug('Position getGoingMax ->', value);
      if (value) {
        callback(null, 1);
      }
    });
    this.digitalRead(this.accessory.context.device.getStopped, (value) => {
      this.platform.log.debug('Position getStopped ->', value);
      if (value) {
        callback(null, 2);
      }
    });
  }

  handleMotionDetectedGet(callback) {
    this.platform.log.debug('Triggered GET MotionDetected');

    this.digitalRead(this.accessory.context.device.getMotionDetected, (value) => {
      this.platform.log.debug('Position getMotionDetected ->', value);
      callback(null, value);
    });
  }
}
