/**
 * @file orchestrator.class.ts
 * @author Nicola Guerra
 */
import { basename } from "path";
import type { MqttClient } from "mqtt";

import { logger, type Logger } from "@/libs/logger.ts";
import { policyBlocksTotal } from "@/metrics/policy.metrics";
import { systemDecisionLatencyMs } from "@/metrics/system.metrics";

type GrantPayload = {
	value: boolean;
	lease_ms?: number;
};

export class Orchestrator {
	private readonly id = crypto.randomUUID();
	private readonly logger: Logger;
	private readonly maxDevices = 5;

	private readonly leaseMs = 10_000;
	private queue: string[] = [];
	private activeDevices = new Map<string, NodeJS.Timeout>();

	constructor(private readonly mqtt: MqttClient) {
		this.logger = logger.child({ name: basename(__filename), id: this.id });

		const topics = ["room/+/actuators/+/request", "room/+/actuators/+/ack"];
		this.mqtt.subscribe(topics, (err, granted) => err
			? this.logger.error({ err }, "Failed to subscribe")
			: this.logger.debug({ granted }, "Subscribed to actuator ACK topics")
		);

		this.mqtt.on(
			"message",
			(topic, payload) => {
				this.routeMessage(topic, payload);
			}
		);
	}

	// private methods -----------------------------------------------------------------------------

	/**
	 * Route the topic message to the right function
	 * @param topic {string} mqtt topic
	 * @param payload {Buffer} message body
	 * @returns {void}
	 */
	private routeMessage(topic: string, payload: Buffer): void {
		if (topic.endsWith("/request")) this.handleRequest(topic, payload);
		else if (topic.endsWith("/ack")) this.handleAck(topic, payload);
		else {
			this.logger.error({ topic }, "Topic not recognized");
		}
	}

	/**
	 * Handles requests from the rooms
	 * @param topic {string} mqtt topic
	 * @param payload {Buffer} message body
	 * @returns {void}
	 */
	private handleRequest(topic: string, payload: Buffer): void {
		const start = Date.now();
		const { value } = JSON.parse(payload.toString());
		const [, roomUUID, , actuator] = topic.split("/");
		if (!roomUUID || !actuator) {
			this.logger.warn("Malformed topic");
			systemDecisionLatencyMs.observe({ room_id: roomUUID }, Date.now() - start)
			return;
		}
		const key = `${roomUUID}/${actuator}`;

		if (!value) {
			this.revoke(key);
			systemDecisionLatencyMs.observe({ room_id: roomUUID }, Date.now() - start)
			return;
		}

		if (this.activeDevices.has(key)) {
			policyBlocksTotal.inc({ room_id: roomUUID, policy: "already_active" })
			systemDecisionLatencyMs.observe({ room_id: roomUUID }, Date.now() - start)
			return;
		}
		if (this.queue.includes(key)) {
			policyBlocksTotal.inc({ room_id: roomUUID, policy: "already_queued" })
			systemDecisionLatencyMs.observe({ room_id: roomUUID }, Date.now() - start)
			return;
		}

		this.queue.push(key);
		this.logger.debug({ key }, "Reqeust enqueued");

		this.schedule();
		systemDecisionLatencyMs.observe({ room_id: roomUUID }, Date.now() - start)
	}

	/**
	 * Revoke the grant on the actuator
	 * @param key {string} Actuator key
	 * @returns {void}
	 */
	private revoke(key: string): void {
		const timer = this.activeDevices.get(key);
		if (timer) clearTimeout(timer);

		this.activeDevices.delete(key);

		const [roomUUID, actuator] = key.split("/");

		this.publishGrant(roomUUID || "", actuator || "", { value: false })
		this.logger.info({ roomUUID, actuator }, "Grant revoked");
	}

	/**
	 * Schedule the permissions
	 * @returns {void}
	 */
	private schedule(): void {
		while (
			this.activeDevices.size < this.maxDevices &&
			this.queue.length > 0
		) {
			const key = this.queue.shift() || "";
			if (!key) continue;
			this.grant(key);
		}
	}

	/**
	 * Grants actuator lease
	 * @param key {string} Actuator key
	 * @returns {void}
	 */
	private grant(key: string): void {
		const [roomUUID, actuator] = key.split("/");
		this.publishGrant(roomUUID || "", actuator || "", { value: true, lease_ms: 10_000 });

		const timer = setTimeout(() => {
			this.logger.info({ key }, "Lease expired");
			this.revoke(key);
			this.queue.push(key); // RR rotation
			this.schedule();
		}, this.leaseMs);

		this.activeDevices.set(key, timer);
	}

	/**
	 * Handles actautors ack
	 * @param topic {string} mqtt topic
	 * @param value {Buffer} body message
	 * @returns {void}
	 */
	private handleAck(topic: string, payload: Buffer): void {
		const { value } = JSON.parse(payload.toString());
		const [, roomUUID, , actuator] = topic.split("/");
		const key = `${roomUUID}/${actuator}`;

		if (!value) {
			this.revoke(key);
			this.schedule();
		};

		this.logger.debug({ roomUUID, actuator, value }, "ACK received");
	}

	/**
	 * Publish to the mqtt topic the grant for the device
	 * @param roomUUID {string} Room UUID
	 * @param actuator {string} Actuator name
	 * @param value {boolean} Grant value
	 * @param leaseMs {number} Ms for grant validity
	 * @returns {void}
	 */
	private publishGrant(
		roomUUID: string,
		actuator: string,
		payload: GrantPayload
	): void {
		const topic = `room/${roomUUID}/actuators/${actuator}/grant`;
		this.mqtt.publish(topic, JSON.stringify(payload), { qos: 1 }, (error) => {
			if (error) {
				this.logger.error({ error }, "Grant error");
				return;
			}

			this.logger.info("Grant published");
		});
		this.logger.info({ payload }, "Grant published");
	}
}
