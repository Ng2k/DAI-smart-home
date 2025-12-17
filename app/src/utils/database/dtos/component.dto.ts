/**
 * @brief Data Transfer Object for component
 * @file component.dto.ts
 * @author Nicola Guerra
 */

import type {
	ActuatorConfig, ControllerConfig, OrchestratorConfig, SensorConfig
} from "../../types";
import type { SensorType } from "../../enums";

export interface ComponentDTO {
	id: string;
	component_type: string;
	energy_consumption_value: number;
	energy_consumption_uom: string;
	created_at: string;
	created_by: string;
	updated_at: string;
	updated_by: string;
}

export interface SensorDTO extends ComponentDTO {
	sensor_type: SensorType;
	uom: string;
}

export interface ActuatorDTO extends ComponentDTO {
	actuator_type: string;
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
	switch (dto.component_type) {
		case "sensor":
			return {
				id: dto.id,
				type: (dto as SensorDTO).sensor_type,
				uom: (dto as SensorDTO).uom,
				power: dto.energy_consumption_value,
				powerUom: dto.energy_consumption_uom
			} as SensorConfig;
		default:
			return {
				id: dto.id,
				type: (dto as ActuatorDTO).actuator_type,
				power: dto.energy_consumption_value,
				powerUom: dto.energy_consumption_uom
			} as ActuatorConfig;
	}
}
