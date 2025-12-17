/**
 * @brief Config file for humidity model
 * @file humidity_config.type.ts
 * @author Nicola Guerra
 */

export type HumidityModelConfig = {
	initialHumidity: number;      // %
	ambientHumidity: number;      // %
	dehumidifyingRate: number;    // % per second
	humidityRiseRate: number;     // % per second (natural increase)
	thermalInteraction: number;   // factor [0..1], will use later
	noiseAmplitude: number;       // e.g., 0.2
}
