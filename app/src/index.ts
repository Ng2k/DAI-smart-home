import mqtt from "mqtt";
import { logger } from "./utils";

import { AgentClass, AgentType, BaseAgent } from "./agents";

const agent = new BaseAgent("test-agent", AgentType.SENSOR, AgentClass.TEMPERATURE);
