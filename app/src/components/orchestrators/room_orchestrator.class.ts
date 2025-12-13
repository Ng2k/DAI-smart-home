/**
 * @brief File for the room controller component
 * @file room.class.ts
 * @author Nicola Guerra
 */
import {
	EnergyMode, logger, MqttConfig,
	type Logger, type OrchestratorConfig
} from "../../utils/";
import { Component } from "../component.abstract";

type RoomState = {
	temperature: number;
	humidity: number;
	heater: boolean;
	dehumidifier: boolean;
	energyMode: EnergyMode;
};

/**
 * @brief Orchestrator for the room
 * @class RoomOrchestrator
 */
export class RoomOrchestrator extends Component {
	protected override _logger: Logger = logger.child({ name: this.constructor.name });
	private _roomState: RoomState = {
		temperature: 0,
		humidity: 0,
		heater: false,
		dehumidifier: false,
		energyMode: EnergyMode.ECO
	};

	constructor(private readonly _config: OrchestratorConfig, mqttConfig: MqttConfig) {
		super(mqttConfig);
		this._roomState.energyMode = _config.energyMode;

		this._mqttClient.subscribe(_config.topic.subscribe || []);
		this._logger.debug(
			{ sub: this._config.topic.subscribe },
			"Room orchestrator subscribed to topics"
		);

		this._logger.info({ roomState: this._roomState }, "Orchestrator initialized");
	};

	// public methods ------------------------------------------------------------------------------
	public start(): void {
		this._mqttClient.on("message", (topic, message) => {
			this._logger.debug(
				{ topic, message: JSON.parse(message.toString()) },
				"Message received"
			);

			const key = topic.split("/").at(-1) as keyof RoomState | undefined;
			if (!key) return;

			const payload = JSON.parse(message.toString());

			switch (key) {
				case "temperature":
				case "humidity":
					this._roomState[key] = Number(payload.value);
					break;
				case "heater":
				case "dehumidifier":
					this._roomState[key] = Boolean(payload.value);
					break;
				case "energyMode":
					this._roomState[key] = payload.value as EnergyMode;
					break;
				default:
					this._logger.warn(
						{ topic, payload },
						"Unknown topic key for room state"
					);
			}

			this._evaluate();
		});
	}
	public stop(): void {
		const { room, type, topic: { subscribe } } = this._config;
		this._mqttClient.unsubscribe(subscribe || []);
		this._logger.info(`Orchestrator '${room}/${type}' stopped`);
	}
	// private methods -----------------------------------------------------------------------------
	private _evaluate(): void {
		this._logger.debug(this._roomState, "Orchestrator is evaluating");
	}
}
