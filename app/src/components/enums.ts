/**
 * @brief Enums for the components package
 * @file enums.ts
 * @author Nicola Guerra
 */

/**
 * This enum defines the types of components that can be used in the system.
 * @enum ComponentType
 */
export enum ComponentType {
    SENSOR = 'sensor',
    CONTROLLER = 'controller',
    ACTUATOR = 'actuator',
}


/**
 * This enum defines the types of sensors that can be used in the system.
 * @enum SensorType
 */
export enum SensorType {
    TEMPERATURE = 'temperature',
    HUMIDITY = 'humidity',
    PRESSURE = 'pressure',
    LIGHT = 'light',
    MOTION = 'motion',
    SOUND = 'sound',
    CO2 = 'co2',
}


/**
 * This enum defines the units of measurement for the sensors.
 * @enum UnitOfMeasurement
 */
export enum UnitOfMeasurement {
    CELSIUS = '°C',
    FAHRENHEIT = '°F',
    PERCENT = '%',
    PASCAL = 'Pa',
    LUX = 'lx',
    WATT = 'W',
    VOLT = 'V',
    AMPERE = 'A',
    HERTZ = 'Hz',
    JOULE = 'J',
    WATT_HOUR = 'Wh',
    VOLT_AMPERE_REACTIVE = 'VAR',
    VOLT_AMPERE_REACTIVE_HOUR = 'VARh',
}
