/**
 * @brief Model for simulate room temperature
 * @file temperature_model.class.ts
 * @author Nicola Guerra
 */
import type { TemperatureModelConfig } from "./temperature_config.type.ts";
import type { IModel } from "../model.interface.ts";

/**
 * @brief class for the temperature Model
 * @class TemperatureModel
 */
export class TemperatureModel implements IModel {
	private temperature: number;
	private heaterOn: boolean = false;

	constructor(private readonly config: TemperatureModelConfig) {
		this.temperature = config.initialTemperature;
	}

	//public methods -------------------------------------------------------------------------------

	public setState(state: boolean): void {
		this.heaterOn = state;
	}

	public getValue(): number {
		return this.temperature
	}

	public update(dt: number): void {
		const {
			ambientTemperature,
			heatingRate,
			coolingRate,
			thermalInertia,
			noiseAmplitude
		} = this.config;

		let dT = 0;

		if (this.heaterOn) { dT = heatingRate * dt; }
		else {
			const direction = ambientTemperature > this.temperature ? 1 : -1;
			dT = direction * coolingRate * dt;
		}

		//termal inerthia
		dT *= thermalInertia;

		//noise
		const noise = (Math.random() * 2 - 1) * noiseAmplitude;
		dT += noise;

		this.temperature = +Number(this.temperature + dT).toFixed(2);
	}

}
