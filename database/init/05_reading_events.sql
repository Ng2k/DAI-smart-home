-- =========================================================
-- READINGS EVENTS (SENSORS + ACTUATORS)
-- =========================================================

CREATE TABLE IF NOT EXISTS readings_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL,
    category VARCHAR(16) NOT NULL,
    type VARCHAR(64) NOT NULL,
    value NUMERIC,
    status VARCHAR(32),
    uom VARCHAR(16),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_readings_component_id
    ON readings_events (component_id);

CREATE INDEX IF NOT EXISTS idx_readings_occurred_at
    ON readings_events (created_at);

CREATE TABLE IF NOT EXISTS readings_deadletter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID,
    component_id UUID,
    category VARCHAR(16),
    type VARCHAR(64),
    value NUMERIC,
    status VARCHAR(32),
    uom VARCHAR(16),
    error_message TEXT,
    failed_at TIMESTAMPTZ DEFAULT now(),
    created_by TIMESTAMPTZ,
    created_at VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL,
    category VARCHAR(16),
    type VARCHAR(64),
    value NUMERIC,
    status VARCHAR(32),
    uom VARCHAR(16),
    created_at TIMESTAMPTZ,
    created_by VARCHAR(255)
);
