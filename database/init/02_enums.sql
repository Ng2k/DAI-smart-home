DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EVENT_TYPE') THEN
        CREATE TYPE EVENT_TYPE AS ENUM (
            'COMPONENT_CREATED',
			'SENSOR_READING',
			'ACTUATOR_ACTION',
			'ORCHESTRATOR_COMMAND'
        );
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'COMPONENT') THEN
        CREATE TYPE COMPONENT AS ENUM (
            'sensor',
			'actuator'
        );
    END IF;
END
$$;
