/**
 * @brief Custom errors for the projects
 * @file errors.ts
 * @author Nicola Guerra
 */

/**
 * @brief Error thrown when a subscribe fails
 * @class SubscribeError
 * @param topic The topic that failed to subscribe to
 */
export class SubscribeError extends Error {
	constructor(public readonly topic: string) {
		super(`Failed to subscribe to topic: ${topic}`);
		this.name = "SubscribeError";
		this.stack = Bun.env.NODE_ENV !== "prod" ? new Error().stack : undefined;
	}
}

/**
 * @brief Error thrown when a publish fails
 * @class PublishError
 * @param topic The topic that failed to publish to
 */
export class PublishError extends Error {
	constructor(public readonly topic: string) {
		super(`Failed to publish message to topic: ${topic}`);
		this.name = "PublishError";
		this.stack = Bun.env.NODE_ENV !== "prod" ? new Error().stack : undefined;
	}
}

/**
 * @brief Error thrown when a registration fails
 * @class RegistrationError
 */
export class RegistrationError extends Error {
	constructor() {
		super("Registration failed");
		this.name = "RegistrationError";
		this.stack = Bun.env.NODE_ENV !== "prod" ? new Error().stack : undefined;
	}
}
