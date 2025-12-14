/**
 * @brief File for the room controller component
 * @file room.class.ts
 * @author Nicola Guerra
 */
import {
	type Objectives,
	EnergyMode, logger, MqttConfig,
	type Logger, type OrchestratorConfig
} from "../../utils/";
import { Component } from "../component.abstract";
import objectives from "../../../config/objectives.json";

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
		const key = _config.room as keyof Objectives["rooms"];
		if (!key) {
			this._logger.warn({ key }, "Key does not exist");
			return;
		}
		const roomObj = objectives.rooms[key];
		this._roomState.energyMode = roomObj.energyMode as EnergyMode;

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

			const msg = JSON.stringify(this._evaluate());
			const pubTopic = this._config.topic.publish;
			this._mqttClient.publish(pubTopic, msg);
			this._logger.info(
				{ topic: pubTopic, payload: JSON.parse(msg) },
				"Pubblicato comandi orchestrazione stanza"
			);
		});
	}
	public stop(): void {
		const { room, type, topic: { subscribe } } = this._config;
		this._mqttClient.unsubscribe(subscribe || []);
		this._logger.info(`Orchestrator '${room}/${type}' stopped`);
	}
	// private methods -----------------------------------------------------------------------------
	private _evaluate(): Record<string, boolean> {
		this._logger.debug(this._roomState, "Orchestrator is evaluating");

		const key = this._config.room as keyof Objectives["rooms"];
		if (!key) {
			this._logger.warn({ key }, "Key does not exist");
			return {};
		}
		const roomObj = objectives.rooms[key];


		const temp = roomObj.temperature;
		const humidity = roomObj.humidity;

		const state = this._roomState;

		const needsHeating = state.temperature < temp.min - temp.margin;
		const needsDehumidifying = state.humidity > humidity.max + humidity.margin;

		this._logger.debug({ needsHeating, needsDehumidifying }, "Raw needs calculated");

		// Apply comfort goals
		if (needsHeating) {
			state.heater = true;
			logger.info(
				{ temperature: state.temperature },
				"Heater set to ON"
			);
		}

		if (needsDehumidifying) {
			state.dehumidifier = true;
			logger.info(
				{ humidity: state.humidity },
				"Dehumidifier set to ON"
			);
		}

		if (state.heater && state.dehumidifier) {
			this._logger.debug(
				{ heater: state.heater, dehumidifier: state.dehumidifier },
				"Conflict detected: heater and dehumidifier both ON"
			);

			if (state.energyMode === EnergyMode.ECO) {
				state.dehumidifier = false;
				this._logger.info(
					{ EnergyMode: state.energyMode },
					"Energy mode ECO: dehumidifier turned OFF to save energy"
				);
			}
		}

		// Stop conditions (hysteresis)

		if (state.temperature > temp.max + temp.margin) {
			if (state.heater) {
				state.heater = false;
				logger.info(
					{ temperature: state.temperature, target: temp },
					"Temperature above max, heater turned OFF"
				);
			}
		}

		if (state.humidity < humidity.min - humidity.margin) {
			if (state.dehumidifier) {
				state.dehumidifier = false;
				logger.info(
					{ humidity: state.humidity, target: humidity },
					"Humidity below min, dehumidifier turned OFF"
				);
			}
		}

		this._logger.debug(
			{ state: state },
			"Final actuator intents after evaluation"
		);

		return { heater: state.heater, dehumidifier: state.dehumidifier };
	}
}
