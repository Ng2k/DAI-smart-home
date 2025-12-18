-- =========================================================
-- APPLY READING EVENT FUNCTION
-- =========================================================

CREATE OR REPLACE FUNCTION apply_reading_event()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        IF NEW.category IS NULL OR NEW.type IS NULL THEN
            RAISE EXCEPTION 'Missing required fields';
        END IF;

        INSERT INTO readings (
            component_id, type, value, status, uom,
            created_at, created_by
        )
        VALUES (
            NEW.component_id, NEW.category,
            NEW.value, NEW.status, NEW.uom,
            NEW.created_at, NEW.created_by
        );

        RETURN NEW;

    EXCEPTION WHEN OTHERS THEN
        INSERT INTO reading_events_deadletter (
            event_id, component_id, category, type,
            value, status, uom, created_at, created_by, error_message
        )
        VALUES (
            NEW.id, NEW.component_id, NEW.category, NEW.type,
            NEW.value, NEW.status, NEW.uom,
            NEW.created_at, NEW.created_by, SQLERRM
        );
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- TRIGGER READINGS
-- =========================================================

DROP TRIGGER IF EXISTS trg_apply_reading_event ON reading_events;

CREATE TRIGGER trg_apply_reading_event
AFTER INSERT ON reading_events
FOR EACH ROW
EXECUTE FUNCTION apply_reading_event();
