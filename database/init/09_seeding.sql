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
        "power": 0.15,
        "power_uom": "kW",
		"frequency": 2,
		"frequency_uom": "sec",
		"pub_topics": ["home/floor/1/room/living-room/sensors/temperature"],
		"sensor_type": "temperature",
		"uom": "°C"
    }',
    'nicola guerra'
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
		"power": 0.15,
        "power_uom": "kW",
		"frequency": 2,
		"frequency_uom": "sec",
		"pub_topics": ["home/floor/1/room/living-room/sensors/humidity"],
		"sensor_type": "humidity",
		"uom": "%"
    }',
    'nicola guerra'
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
        "power": 0.20,
        "power_uom": "kW",
		"actuator_type": "heater",
		"sub_topics": ["home/floor/1/room/living-room/controllers/temperature"],
		"pub_topics": ["home/floor/1/room/living-room/actuators/heater"]
    }',
    'nicola guerra'
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
        "power": 0.20,
        "power_uom": "kW",
		"actuator_type": "dehumidifier",
		"sub_topics": ["home/floor/1/room/living-room/controllers/humidity"],
		"pub_topics": ["home/floor/1/room/living-room/actuators/dehumidifier"]
    }',
    'nicola guerra'
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
