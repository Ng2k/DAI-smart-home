-- ========================================
-- Seeding database
-- ========================================

-- SENSORI
-- -----------------------------------------

-- Temperatura
INSERT INTO component_events (
    component_id,
    event_type,
    payload,
    created_by
)
VALUES (
    gen_random_uuid(),
    'COMPONENT_CREATED',
    '{
        "component_type": "sensor",
        "energy_consumption_value": 0.15,
        "energy_consumption_uom": "kW",
		"sensor_type": "temperature",
		"uom": "°C"
    }',
    'Nicola Guerra'
);

-- Humidità
INSERT INTO component_events (
    component_id,
    event_type,
    payload,
    created_by
)
VALUES (
    gen_random_uuid(),
    'COMPONENT_CREATED',
    '{
        "component_type": "sensor",
        "energy_consumption_value": 0.01,
        "energy_consumption_uom": "kW",
		"sensor_type": "humidity",
		"uom": "%"
    }',
    'Nicola Guerra'
);


-- ATTUATORI

-- Heater
INSERT INTO component_events (
    component_id,
    event_type,
    payload,
    created_by
)
VALUES (
    gen_random_uuid(),
    'COMPONENT_CREATED',
    '{
        "component_type": "actuator",
        "energy_consumption_value": 0.20,
        "energy_consumption_uom": "kW",
		"actuator_type": "heater"
    }',
    'discovery-agent'
);

-- Dehumidifier
INSERT INTO component_events (
    component_id,
    event_type,
    payload,
    created_by
)
VALUES (
    gen_random_uuid(),
    'COMPONENT_CREATED',
    '{
        "component_type": "actuator",
        "energy_consumption_value": 0.20,
        "energy_consumption_uom": "kW",
		"actuator_type": "dehumidifier"
    }',
    'discovery-agent'
);

-- Agenti
-- -----------------------------------------

-- Registry
insert into agent_events (
	agent_id,
	type,
	payload,
	created_by
)
values (
	gen_random_uuid(),
	'AGENT_CREATED',
	'{
		"type": "registry",
		"pub_topics": ["home/registry/agents/ack"],
		"sub_topics": ["home/registry/agents"]
	}',
	'nicola guerra'
);

-- Rooms
INSERT INTO agent_events (
    agent_id,
    type,
    payload,
    created_by
)
VALUES (
	gen_random_uuid(),
	'AGENT_CREATED',
	jsonb_build_object(
	    'type', 'room',
        'room', 'living',
        'floor', 0,
        'orchestrator', '',
        'sensors', coalesce((
        	select jsonb_agg(id)
            from components
            where component_type = 'sensor'
        ), '[]'::jsonb),
        'actuators', coalesce((
        	select jsonb_agg(id)
            from components
            where component_type = 'actuator'
        ), '[]'::jsonb),
        'controllers', coalesce((
        	select jsonb_agg(id)
            from components
            where component_type = 'controller'
        ), '[]'::jsonb)
    ),
    'nicola guerra'
);
