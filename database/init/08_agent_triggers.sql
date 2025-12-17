-- =========================================================
-- APPLY AGENT EVENT FUNCTION

CREATE OR REPLACE FUNCTION apply_agent_event()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        -- Validazione minima
        IF NEW.agent_id IS NULL OR NEW.type IS NULL OR NEW.payload IS NULL THEN
            RAISE EXCEPTION 'Missing required fields in agent_event';
        END IF;

        -- Aggiornamento della tabella agents
        -- Inserisce se non esiste, altrimenti aggiorna
        INSERT INTO agents (
            id, type, room, floor, sub_topics, pub_topics, sensors, actuators, controllers,
            created_at, created_by, updated_at, updated_by
        )
        VALUES (
            NEW.agent_id,
            (NEW.payload->>'type')::agent_type,       -- assume payload JSON ha type
            NEW.payload->>'room',
            (NEW.payload->>'floor')::INT,
			COALESCE(NEW.payload->'sub_topics', '[]'::jsonb),
			COALESCE(NEW.payload->'pub_topics', '[]'::jsonb),
			COALESCE(NEW.payload->'sensors', '[]'::jsonb),
			COALESCE(NEW.payload->'actuators', '[]'::jsonb),
			COALESCE(NEW.payload->'controllers', '[]'::jsonb),
            NEW.created_at,
            NEW.created_by,
            NEW.created_at,
            NEW.created_by
        )
        ON CONFLICT (id) DO UPDATE
        SET
            type = EXCLUDED.type,
            room = EXCLUDED.room,
            floor = EXCLUDED.floor,
            sensors = EXCLUDED.sensors,
            actuators = EXCLUDED.actuators,
            controllers = EXCLUDED.controllers,
            updated_at = EXCLUDED.updated_at,
            updated_by = EXCLUDED.updated_by;
        RETURN NEW;

    EXCEPTION WHEN OTHERS THEN
        -- In caso di errore, scrive nella dead letter table
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
-- TRIGGER
-- =========================================================

DROP TRIGGER IF EXISTS trg_apply_agent_event ON agent_event;

CREATE TRIGGER trg_apply_agent_event
AFTER INSERT ON agent_events
FOR EACH ROW
EXECUTE FUNCTION apply_agent_event();
