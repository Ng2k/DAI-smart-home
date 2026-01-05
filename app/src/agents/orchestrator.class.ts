import type { MqttClient } from "mqtt";
import { logger, type Logger } from "@/libs/logger.ts";

type EnergyMode = "eco" | "power";

type RoomPolicy = {
	energyMode: EnergyMode;
	allowActuators: boolean;
};

export class Orchestrator {
	private readonly logger: Logger;
	private readonly maxDevices = 2;
	private activeDevices = new Set<string>(); // <roomId>/<actuator>
	private currentPolicy: RoomPolicy = { energyMode: "power", allowActuators: true };

	constructor(public readonly id: string, private readonly mqtt: MqttClient) {
		this.logger = logger.child({ name: "Orchestrator", id });

		const topics = ["room/+/actuators/+/ack"];
		this.mqtt.subscribe(topics, err => err
			? this.logger.error({ err }, "Failed to subscribe")
			: this.logger.info("Subscribed to actuator ACK topics")
		);

		this.mqtt.on("message", (topic, payload) => this.handleActuatorAck(topic, payload));

		setInterval(() => this.publishPolicies(), 5_000);
	}

	private handleActuatorAck(topic: string, payload: Buffer): void {
		const { value } = JSON.parse(payload.toString());
		const [, roomId, , actuator] = topic.split("/");
		const key = `${roomId}/${actuator}`;

		if (value) this.activeDevices.add(key);
		else this.activeDevices.delete(key);

		this.logger.debug({ roomId, actuator, value }, "Actuator state updated");
	}

	private publishPolicies(): void {
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

		this.currentPolicy = policy;

		this.logger.info({ activeCount, policy }, "Publishing global policy");

		// Broadcast policy to all rooms
		this.mqtt.publish("room/all/policy", JSON.stringify(policy), err =>
			err && this.logger.error({ err }, "Policy publish failed")
		);
	}
}


