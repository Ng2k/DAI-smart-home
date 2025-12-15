-- =========================================================
-- EXTENSIONS
-- =========================================================

-- UUID generation support
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- ENUM TYPES
-- =========================================================

-- Component domain type (stable)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'component_type') THEN
        CREATE TYPE component_type AS ENUM (
            'sensor',
            'actuator',
            'controller',
            'orchestrator',
            'n/a'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'component_event_type') THEN
        CREATE TYPE component_event_type AS ENUM (
            'COMPONENT_CREATED',
            'ENERGY_CONSUMPTION_UPDATED'
        );
    END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sensor_type') THEN
        CREATE TYPE sensor_type AS ENUM (
            'temperature',
            'humidity',
            'n/a'
        );
    END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'actuator_type') THEN
        CREATE TYPE actuator_type AS ENUM (
            'heater',
            'dehumidifier',
            'n/a'
        );
    END IF;
END
$$;
-- =========================================================
-- EVENT STORE (SOURCE OF TRUTH)
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
-- READ MODEL / PROJECTION
-- =========================================================

CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY,
    component_type component_type NOT NULL,
    sensor_type sensor_type,
    actuator_type actuator_type,
    room VARCHAR(16) not null,
    energy_consumption_value NUMERIC(10,4) not NULL,
    energy_consumption_uom   VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(255) NOT NULL
);

-- =========================================================
-- TRIGGER: AUTO UPDATE updated_at
-- =========================================================

CREATE OR REPLACE FUNCTION apply_component_event()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        ----------------------------------------------------------------
        -- COMPONENT CREATED
        ----------------------------------------------------------------
        IF NEW.event_type = 'COMPONENT_CREATED' THEN

            -- Validazione campi obbligatori
            IF NOT (
                NEW.payload ? 'component_type' AND
                NEW.payload ? 'room' AND
                NEW.payload ? 'energy_consumption_value' AND
                NEW.payload ? 'energy_consumption_uom'
            ) THEN
                RAISE EXCEPTION
                    'Missing required fields';
            END IF;

            -- Validazione tipi
            PERFORM (NEW.payload ->> 'component_type')::component_type;
            PERFORM (NEW.payload ->> 'energy_consumption_value')::NUMERIC;
			PERFORM (NEW.payload ->> 'sensor_type')::sensor_type;
            PERFORM (NEW.payload ->> 'actuator_type')::actuator_type;

            -- Applica proiezione
            INSERT INTO components (
                id,
                component_type,
				sensor_type,
				actuator_type,
				room,
                energy_consumption_value,
                energy_consumption_uom,
                created_at,
                created_by,
                updated_at,
                updated_by
            )
            VALUES (
                NEW.component_id,
                (NEW.payload ->> 'component_type')::component_type,
				(NEW.payload ->> 'sensor_type')::sensor_type,
				(NEW.payload ->> 'actuator_type')::actuator_type,
				NEW.payload ->> 'room',
                (NEW.payload ->> 'energy_consumption_value')::NUMERIC,
                NEW.payload ->> 'energy_consumption_uom',
                NEW.created_at,
                NEW.created_by,
                NEW.created_at,
                NEW.created_by
            )
            ON CONFLICT (id) DO NOTHING;

        END IF;

        ----------------------------------------------------------------
        -- ENERGY CONSUMPTION UPDATED
        ----------------------------------------------------------------
        IF NEW.event_type = 'ENERGY_CONSUMPTION_UPDATED' THEN

            -- Validazione campi obbligatori
            IF NOT (
                NEW.payload ? 'energy_consumption_value' AND
                NEW.payload ? 'energy_consumption_uom'
            ) THEN
                RAISE EXCEPTION
                    'Missing required fields';
            END IF;

            -- Validazione tipi
            PERFORM (NEW.payload ->> 'energy_consumption_value')::NUMERIC;

            -- Applica proiezione
            UPDATE components
            SET
                energy_consumption_value =
                    (NEW.payload ->> 'energy_consumption_value')::NUMERIC,
                energy_consumption_uom =
                    NEW.payload ->> 'energy_consumption_uom',
                updated_by = NEW.created_by
            WHERE id = NEW.component_id;

        END IF;

        RETURN NEW;

    EXCEPTION WHEN OTHERS THEN
        -- In caso di errore, salva l'evento nella dead letter table
        INSERT INTO component_events_deadletter (
		    event_id,
		    component_id,
		    event_type,
		    payload,
		    created_at,
		    created_by,
		    error_message
		)
		VALUES (
		    NEW.id,             -- riferimento all'evento originale
		    NEW.component_id,
		    NEW.event_type,
		    NEW.payload,
		    NEW.created_at,
		    NEW.created_by,
		    SQLERRM
		);
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- TRIGGER: APPLY EVENT AFTER INSERT
-- =========================================================

DROP TRIGGER IF EXISTS trg_apply_component_event ON component_events;

CREATE TRIGGER trg_apply_component_event
AFTER INSERT ON component_events
FOR EACH ROW
EXECUTE FUNCTION apply_component_event();

-- =========================================================
-- READINGS EVENT STORE (SENSORS + ACTUATORS)
-- =========================================================

CREATE TABLE IF NOT EXISTS component_readings_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL,
    reading_category VARCHAR(16) NOT NULL, -- 'sensor' o 'actuator'
    reading_type VARCHAR(64) NOT NULL,
    reading_value NUMERIC,
    reading_status VARCHAR(32),
    reading_uom VARCHAR(16),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_component_readings_component_id
    ON component_readings_events (component_id);

CREATE INDEX IF NOT EXISTS idx_component_readings_occurred_at
    ON component_readings_events (created_at);

-- =========================================================
-- DEAD LETTER TABLE READINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS component_readings_deadletter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID,
    component_id UUID,
    reading_category VARCHAR(16),
    reading_type VARCHAR(64),
    reading_value NUMERIC,
    reading_status VARCHAR(32),
    reading_uom VARCHAR(16),
    error_message TEXT,
    failed_at TIMESTAMPTZ DEFAULT now(),
    created_by TIMESTAMPTZ,
    created_at VARCHAR(255)
);

-- =========================================================
-- PROJECTION TABLE READINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS component_readings(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL,
    reading_category VARCHAR(16),
    reading_type VARCHAR(64),
    reading_value NUMERIC,
    reading_status VARCHAR(32),
    reading_uom VARCHAR(16),
    created_at TIMESTAMPTZ,
    created_by VARCHAR(255)
);

-- =========================================================
-- APPLY READING EVENT FUNCTION (WITH VALIDATION + DLT)
-- =========================================================

CREATE OR REPLACE FUNCTION apply_component_reading_event()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        -- Validazione minima
        IF NEW.reading_category IS NULL OR NEW.reading_type IS NULL THEN
            RAISE EXCEPTION 'Missing required fields';
        END IF;

        -- Scrive sulla PROIEZIONE, non sull'event store
        INSERT INTO component_readings (
            component_id, reading_category, reading_type,
            reading_value, reading_status, reading_uom,
            created_at, created_by
        )
        VALUES (
            NEW.component_id, NEW.reading_category, NEW.reading_type,
            NEW.reading_value, NEW.reading_status, NEW.reading_uom,
            NEW.created_at, NEW.created_by
        );

        RETURN NEW;

    EXCEPTION WHEN OTHERS THEN
        INSERT INTO component_readings (
            event_id, component_id, reading_category, reading_type,
            reading_value, reading_status, reading_uom,
            created_at, created_by, error_message
        )
        VALUES (
            NEW.id, NEW.component_id, NEW.reading_category, NEW.reading_type,
            NEW.reading_value, NEW.reading_status, NEW.reading_uom,
            NEW.created_at, NEW.created_by, SQLERRM
        );

        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- TRIGGER AFTER INSERT READINGS EVENTS
-- =========================================================

DROP TRIGGER IF EXISTS trg_apply_component_reading_event ON component_readings_events;

CREATE TRIGGER trg_apply_component_reading_event
AFTER INSERT ON component_readings_events
FOR EACH ROW
EXECUTE FUNCTION apply_component_reading_event();
