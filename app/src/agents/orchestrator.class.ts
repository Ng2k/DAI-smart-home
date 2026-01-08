/**
 * @file orchestrator.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path";
import type { MqttClient } from "mqtt";
import { logger, type Logger } from "@/libs/logger.ts";

type EnergyMode = "eco" | "power";

type RoomPolicy = {
	energyMode: EnergyMode;
	allowActuators: boolean;
};

export class Orchestrator {
	private readonly id = crypto.randomUUID();
	private readonly logger: Logger;
	private readonly maxDevices = 2;
	private activeDevices = new Set<string>(); // <roomId>/<actuator>
	private currentPolicy: RoomPolicy = { energyMode: "power", allowActuators: true };

	constructor(private readonly mqtt: MqttClient) {
		this.logger = logger.child({ name: basename(__filename), id: this.id });

		const topics = ["room/+/actuators/+/ack"];
		this.mqtt.subscribe(topics, (err, granted) => err
			? this.logger.error({ err }, "Failed to subscribe")
			: this.logger.debug({ granted }, "Subscribed to actuator ACK topics")
		);

		this.mqtt.on("message", (topic, payload) => this.handleActuatorAck(topic, payload));

		setInterval(async () => this.publishPolicies(), 5_000);
	}

	// private methods -----------------------------------------------------------------------------

	/**
	 * Update the count of the total actuators ON
	 * @param topic {string} mqtt topic
	 * @param payload {Buffer} body of the mqtt message
	 * @returns {void}
	 */
	private handleActuatorAck(topic: string, payload: Buffer): void {
		const { value } = JSON.parse(payload.toString());
		const [, roomId, , actuator] = topic.split("/");
		const key = `${roomId}/${actuator}`;

		if (value) this.activeDevices.add(key);
		else this.activeDevices.delete(key);

		this.logger.debug({ roomId, actuator, value }, "Actuator state updated");
	}

	/**
	 * Publish the policy to the mqtt topic
	 * @returns {Promise<void>}
	 */
	private async publishPolicies(): Promise<void> {
		const activeCount = this.activeDevices.size;

		const energyMode: EnergyMode = activeCount > this.maxDevices ? "eco" : "power";

		const policy: RoomPolicy = {
			energyMode,
			allowActuators: energyMode === "power"
		};

		// Only publish if policy changed
		if (
			this.currentPolicy.energyMode === policy.energyMode &&
			this.currentPolicy.allowActuators === policy.allowActuators
		) return;

		// Broadcast policy to all rooms
		try {
			this.currentPolicy = policy;
			this.mqtt.publishAsync("room/all/policy", JSON.stringify(policy));
			this.logger.info({ activeCount, policy }, "Policy updated");
		} catch (error) {
			this.logger.error({ error }, "Error during policy update");
		}
	}
}
