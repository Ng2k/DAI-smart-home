/**
 * @brief Agent types and classes
 * @file agent.enum.ts
 * @author Nicola Guerra
 */
export enum AgentType {
    SENSOR = 'sensor',
    CONTROLLER = 'controller',
    ACTUATOR = 'actuator',
}

export enum AgentClass {
    TEMPERATURE = 'temperature',
    HUMIDITY = 'humidity',
    PRESSURE = 'pressure',
}
