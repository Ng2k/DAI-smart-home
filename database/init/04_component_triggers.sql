-- =========================================================
-- TRIGGER FUNCTION COMPONENTS
-- =========================================================

CREATE OR REPLACE FUNCTION apply_component_event()
RETURNS TRIGGER AS $$
DECLARE
    comp_type text;
    required_fields text[];
    missing_fields text[];
BEGIN
    BEGIN
        ----------------------------------------------------------------
        -- COMPONENT CREATED
        ----------------------------------------------------------------
        IF NEW.event_type = 'COMPONENT_CREATED' THEN

            -- Preleva il component_type dal payload
            comp_type := NEW.payload ->> 'component_type';

            -- Campi obbligatori generali
            required_fields := ARRAY['component_type', 'power', 'power_uom'];

            -- Aggiunge campi specifici in base al tipo
            IF comp_type = 'sensor' THEN
                required_fields := required_fields || ARRAY['uom','sensor_type'];
            ELSIF comp_type = 'actuator' THEN
                required_fields := required_fields || ARRAY['actuator_type'];
            ELSIF comp_type = 'controller' THEN
                required_fields := required_fields || ARRAY['controller_type'];
            END IF;

            -- Controlla quali campi mancano
            missing_fields := ARRAY(
                SELECT f
                FROM unnest(required_fields) AS t(f)
                WHERE NOT (NEW.payload ? f)
            );

            IF array_length(missing_fields, 1) > 0 THEN
                RAISE EXCEPTION 'Missing required fields: %', array_to_string(missing_fields, ', ');
            END IF;

            -- Validazione tipi
            PERFORM comp_type::component_type;
            IF NEW.payload ? 'sensor_type' THEN
                PERFORM (NEW.payload ->> 'sensor_type')::sensor_type;
            END IF;
            IF NEW.payload ? 'actuator_type' THEN
                PERFORM (NEW.payload ->> 'actuator_type')::actuator_type;
            END IF;
            IF NEW.payload ? 'power' THEN
                PERFORM (NEW.payload ->> 'power')::NUMERIC;
            END IF;

            -- Applica proiezione
            INSERT INTO components (
                id,
                component_type,
                sensor_type,
                actuator_type,
                uom,
				frequency,
				frequency_uom,
            	power,
                power_uom,
				sub_topics,
				pub_topics,
                created_at,
                created_by,
                updated_at,
                updated_by
            )
            VALUES (
                NEW.component_id,
                comp_type::component_type,
                (NEW.payload ->> 'sensor_type')::sensor_type,
                (NEW.payload ->> 'actuator_type')::actuator_type,
                NEW.payload ->> 'uom',
				(NEW.payload ->> 'frequency')::NUMERIC,
                NEW.payload ->> 'frequency_uom',
                (NEW.payload ->> 'power')::NUMERIC,
                NEW.payload ->> 'power_uom',
				COALESCE(NEW.payload->'sub_topics', '[]'::jsonb),
				COALESCE(NEW.payload->'pub_topics', '[]'::jsonb),
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
                NEW.payload ? 'power' AND
                NEW.payload ? 'power_uom'
            ) THEN
                RAISE EXCEPTION 'Missing required fields';
            END IF;

            -- Validazione tipi
            PERFORM (NEW.payload ->> 'power')::NUMERIC;

            -- Applica proiezione
            UPDATE components
            SET
                energy_consumption_value = (NEW.payload ->> 'power')::NUMERIC,
                energy_consumption_uom = NEW.payload ->> 'power_uom',
                updated_at = NEW.created_at,
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
            NEW.id,
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
-- TRIGGER COMPONENTS
-- =========================================================

DROP TRIGGER IF EXISTS trg_apply_component_event ON component_events;

CREATE TRIGGER trg_apply_component_event
AFTER INSERT ON component_events
FOR EACH ROW
EXECUTE FUNCTION apply_component_event();
