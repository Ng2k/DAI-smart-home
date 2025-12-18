-- =========================================================
-- ENUM TYPES
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_event_type') THEN
        CREATE TYPE agent_event_type AS ENUM (
            'AGENT_CREATED'
        );
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reading_event_type') THEN
        CREATE TYPE reading_event_type AS ENUM (
            'READING_CREATED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_type') THEN
        CREATE TYPE agent_type AS ENUM (
            'registry',
            'room'
        );
    END IF;

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
