/**
 * @brief Data Transfer Object for component
 * @file component.dto.ts
 * @author Nicola Guerra
 */

import type { ActuatorConfig, SensorConfig } from "../../types";
import type { SensorType } from "../../enums";

export interface ComponentDTO {
	id: string;
	component_type: string;
	power: number;
	power_uom: string;
	created_at: string;
	created_by: string;
	updated_at: string;
	updated_by: string;
}

export interface SensorDTO extends ComponentDTO {
	sensor_type: SensorType;
	pub_topics: [string, ...string[]];
	sub_topics: string[];
	frequency: number;
	frequency_uom: string;
	uom: string;
}

export interface ActuatorDTO extends ComponentDTO {
	actuator_type: string;
	sub_topics: string[];
	pub_topics: [string, string[]];
}

export interface AgentComponentsDTO {
	sensors: SensorDTO[];
	actuators: ActuatorDTO[];
	controllers: [],
	orchestrator: object | null;
}

/**
 * @brief Maps dto to domain type
 * @param dto {ComponentDTO} component dto
 * @return domain type
 */
export const domainMapper = (dto: ComponentDTO): SensorConfig | ActuatorConfig => {
	const baseConfig = {
		id: dto.id,
		power: dto.power,
		powerUom: dto.power_uom
	};
	switch (dto.component_type) {
		case "sensor":
			const sensorDTO = dto as SensorDTO;
			return {
				...baseConfig,
				type: sensorDTO.sensor_type,
				uom: sensorDTO.uom,
				subTopics: sensorDTO.sub_topics,
				pubTopics: sensorDTO.pub_topics,
				frequency: sensorDTO.frequency,
				frequencyUom: sensorDTO.frequency_uom
			} as SensorConfig;
		case "actuator":
			const actuatorDTO = dto as ActuatorDTO;
			return {
				...baseConfig,
				type: actuatorDTO.actuator_type,
				subTopics: actuatorDTO.sub_topics,
				pubTopics: actuatorDTO.pub_topics
			} as ActuatorConfig;
		default:
			return {
				id: dto.id,
				type: (dto as ActuatorDTO).actuator_type,
				power: dto.power,
				powerUom: dto.power_uom
			} as ActuatorConfig;
	}
}
