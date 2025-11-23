/**
 * @brief Config for temperature model
 * @file temperature_config.type.ts
 * @author Nicola Guerra
 */

export type TemperatureModelConfig = {
	initialTemperature: number;
	ambientTemperature: number; // “outdoor” or global env temperature
	heatingRate: number;        // °C per second when heater ON
	coolingRate: number;        // °C per second when heater OFF
	thermalInertia: number;     // how slowly room responds (0–1)
	noiseAmplitude: number;     // random variation
}
