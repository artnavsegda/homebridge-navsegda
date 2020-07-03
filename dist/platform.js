"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleHomebridgePlatform = void 0;
const settings_1 = require("./settings");
const platformAccessory_1 = require("./platformAccessory");
const net_1 = __importDefault(require("net"));
const events_1 = __importDefault(require("events"));
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
class ExampleHomebridgePlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        // this is used to track restored cached accessories
        this.accessories = [];
        this.log.debug('Finished initializing platform:', this.config.name);
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            // run the method to discover / register your devices as accessories
            this.discoverDevices(config.host);
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.accessories.push(accessory);
    }
    /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices(hostname) {
        const eventFeedback = new events_1.default.EventEmitter();
        const client = new net_1.default.Socket();
        var intervalConnect;
        intervalConnect = false;
        function connect() {
            client.connect({ port: 6666, host: hostname });
        }
        function launchIntervalConnect() {
            if (false != intervalConnect)
                return;
            intervalConnect = setInterval(connect, 5000);
        }
        function clearIntervalConnect() {
            if (false == intervalConnect)
                return;
            clearInterval(intervalConnect);
            intervalConnect = false;
        }
        client.on('connect', () => {
            clearIntervalConnect();
            console.log('connected to server', 'TCP');
            client.write('CLIENT connected');
        });
        client.on('error', (err) => {
            console.log('TCP ERROR');
            launchIntervalConnect();
        });
        client.on('close', launchIntervalConnect);
        client.on('end', launchIntervalConnect);
        client.on('data', (data) => {
            let parseString = data.toString("utf8");
            //console.log('INRAW: ' + parseString);
            let commands = parseString.split('X');
            commands.pop();
            commands.forEach((value) => {
                //console.log("section: " + value);
                let joinType;
                switch (value.charAt(0)) {
                    case 'D':
                        joinType = "digital";
                        break;
                    case 'A':
                        joinType = "analog";
                        break;
                }
                let join = value.substr(1, 4);
                let payloadValue = value.substr(6, 5);
                eventFeedback.emit('update', { joinType: joinType, join: join, payloadValue: payloadValue });
            });
        });
        connect();
        // loop over the discovered devices and register each one if it has not already been registered
        for (const device of this.config.accessories) {
            // generate a unique id for the accessory this should be generated from
            // something globally unique, but constant, for example, the device serial
            // number or MAC address
            const uuid = this.api.hap.uuid.generate(device.uniqueId);
            // see if an accessory with the same uuid has already been registered and restored from
            // the cached devices we stored in the `configureAccessory` method above
            const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
            if (existingAccessory) {
                // the accessory already exists
                this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
                // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
                existingAccessory.context.device = device;
                existingAccessory.context.eventFeedback = eventFeedback;
                this.api.updatePlatformAccessories([existingAccessory]);
                // create the accessory handler for the restored accessory
                // this is imported from `platformAccessory.ts`
                new platformAccessory_1.ExamplePlatformAccessory(this, existingAccessory);
            }
            else {
                // the accessory does not yet exist, so we need to create it
                this.log.info('Adding new accessory:', device.displayName);
                // create a new accessory
                const accessory = new this.api.platformAccessory(device.displayName, uuid);
                // store a copy of the device object in the `accessory.context`
                // the `context` property can be used to store any data about the accessory you may need
                accessory.context.device = device;
                accessory.context.eventFeedback = eventFeedback;
                accessory.context.hostname = hostname;
                // create the accessory handler for the newly create accessory
                // this is imported from `platformAccessory.ts`
                new platformAccessory_1.ExamplePlatformAccessory(this, accessory);
                // link the accessory to your platform
                this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
            }
            // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
            // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
    }
}
exports.ExampleHomebridgePlatform = ExampleHomebridgePlatform;
//# sourceMappingURL=platform.js.map