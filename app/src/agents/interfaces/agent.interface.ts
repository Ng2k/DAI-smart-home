/**
 * @brief Agent interface
 * @file agent.interface.ts
 * @author Nicola Guerra
 */
import type { AgentClass, AgentType } from "../agent.enum";

export interface IAgent {
    id: string;
    name: string;
	type: AgentType;
    agentClass: AgentClass;
}
