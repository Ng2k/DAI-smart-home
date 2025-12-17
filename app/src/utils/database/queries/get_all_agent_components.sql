SELECT jsonb_build_object(
    'sensors',
    COALESCE(
        (
            SELECT jsonb_agg(c)
            FROM jsonb_array_elements_text(a.sensors) AS sid(sensor_uuid)
            JOIN components c
              ON c.id = sid.sensor_uuid::uuid
             AND c.component_type = 'sensor'
        ),
        '[]'::jsonb
    ),

    'actuators',
    COALESCE(
        (
            SELECT jsonb_agg(c)
            FROM jsonb_array_elements_text(a.actuators) AS aid(actuator_uuid)
            JOIN components c
              ON c.id = aid.actuator_uuid::uuid
             AND c.component_type = 'actuator'
        ),
        '[]'::jsonb
    ),

    'controllers',
    COALESCE(
        (
            SELECT jsonb_agg(c)
            FROM jsonb_array_elements_text(a.controllers) AS cid(controller_uuid)
            JOIN components c
              ON c.id = cid.controller_uuid::uuid
             AND c.component_type = 'controller'
        ),
        '[]'::jsonb
    ),

    'orchestrator',
    (
        SELECT c
        FROM components c
        WHERE c.id = a.orchestrator
    )
) AS components
FROM agents a
WHERE a.id = $1::uuid;
