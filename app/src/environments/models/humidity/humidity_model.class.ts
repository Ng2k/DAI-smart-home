/**
 * @brief File for the humidity model
 * @file humidity_model.class.ts
 * @author Nicola Guerra
 */
import type { IModel } from "@/environments/models/model.interface.ts";
import type { HumidityModelConfig } from "@/environments/models/humidity/humidity_config.type.ts";

/**
 * @class HumidityModel
 * @brief Class for the humidity simulator model
 */
export class HumidityModel implements IModel {
	private humidity: number;
	private dehumidifierOn: boolean = false;

	constructor(private readonly config: HumidityModelConfig) {
		this.humidity = config.initialHumidity;
	}

	public setState(state: boolean): void {
		this.dehumidifierOn = state;
	}

	public getValue(): number {
		return this.humidity;
	}

	public update(dt: number): void {
		const {
			ambientHumidity,
			dehumidifyingRate,
			humidityRiseRate,
			noiseAmplitude
		} = this.config;

		let dH = 0;

		if (this.dehumidifierOn) {
			dH = -dehumidifyingRate * dt;
		} else {
			const direction = ambientHumidity > this.humidity ? 1 : -1;
			dH = direction * humidityRiseRate * dt;
		}

		// Add noise
		dH += (Math.random() * 2 - 1) * noiseAmplitude;

		this.humidity += dH;

		// Clamp to physical limits
		this.humidity = +Number(Math.max(0, Math.min(100, this.humidity))).toFixed(2);
	}
}
