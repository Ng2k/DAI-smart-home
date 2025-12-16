-- =========================================================
-- APPLY AGENT EVENT FUNCTION
-- =========================================================

CREATE OR REPLACE FUNCTION apply_agent_event()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        IF NEW.agent_id IS NULL OR NEW.type IS NULL OR NEW.payload IS NULL THEN
            RAISE EXCEPTION 'Missing required fields in agent_event';
        END IF;

        INSERT INTO agents (
            id, type, room, floor, sensors, actuators, controllers,
            created_at, created_by, updated_at, updated_by
        )
        VALUES (
            NEW.agent_id,
            (NEW.payload->>'type')::agent_type,
            NEW.payload->>'room',
            (NEW.payload->>'floor')::INT,
            NEW.payload->'sensors',
            NEW.payload->'actuators',
            NEW.payload->'controllers',
            NEW.created_at,
            NEW.created_by,
            NEW.created_at,
            NEW.created_by
        )
        ON CONFLICT (id) DO UPDATE
        SET type = EXCLUDED.type,
            room = EXCLUDED.room,
            floor = EXCLUDED.floor,
            sensors = EXCLUDED.sensors,
            actuators = EXCLUDED.actuators,
            controllers = EXCLUDED.controllers,
            updated_at = EXCLUDED.updated_at,
            updated_by = EXCLUDED.updated_by;

        RETURN NEW;

    EXCEPTION WHEN OTHERS THEN
        INSERT INTO agent_events_deadletter (
            event_id, agent_id, type, payload,
            error_message, failed_at, created_at, created_by
        )
        VALUES (
            NEW.id, NEW.agent_id, NEW.type, NEW.payload,
            SQLERRM, now(), NEW.created_at, NEW.created_by
        );

        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- TRIGGER AGENTS
-- =========================================================

DROP TRIGGER IF EXISTS trg_apply_agent_event ON agent_events;

CREATE TRIGGER trg_apply_agent_event
AFTER INSERT ON agent_events
FOR EACH ROW
EXECUTE FUNCTION apply_agent_event();
