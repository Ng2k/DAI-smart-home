
-- =========================================================
-- EVENT STORE (COMPONENTS)
-- =========================================================

CREATE TABLE IF NOT EXISTS component_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL,
    event_type component_event_type NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_component_events_component_id
    ON component_events (component_id);

CREATE INDEX IF NOT EXISTS idx_component_events_created_at
    ON component_events (created_at);

-- =========================================================
-- DEAD LETTER TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS component_events_deadletter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID,
    component_id UUID,
    event_type component_event_type,
    payload JSONB,
    error_message TEXT,
    failed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ,
    created_by VARCHAR(255)
);

-- =========================================================
-- PROJECTION TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY,
    component_type component_type NOT NULL,
    sensor_type sensor_type,
    actuator_type actuator_type,
    uom VARCHAR(10),
    frequency NUMERIC(10, 0),
    frequency_uom VARCHAR(5),
    power NUMERIC(10,4) not NULL,
    power_uom VARCHAR(16) NOT NULL,
    sub_topics JSONB default '[]'::jsonb,
    pub_topics JSONB default '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(255) NOT NULL
);
