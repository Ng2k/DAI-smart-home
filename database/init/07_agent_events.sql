-- =========================================================
-- EVENT STORE AGENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    type agent_event_type NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_events_agent_id
    ON agent_events (agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_events_created_at
    ON agent_events (created_at);

CREATE TABLE IF NOT EXISTS agent_events_deadletter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID,
    agent_id UUID,
    type agent_event_type,
    payload JSONB,
    error_message TEXT,
    failed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ,
    created_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY,
    type agent_type NOT NULL,
    room VARCHAR(16),
    floor INT,
	sub_topics JSONB not null default '[]'::jsonb,
    pub_topics JSONB not null default '[]'::jsonb,
    orchestrator UUID,
    sensors JSONB,
    actuators JSONB,
    controllers JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(255) NOT NULL
);
