select
    id,
    c.component_type,
    c.sensor_type,
    c.room,
    c.uom
from components as c
where c.sensor_type = $1 and c.room = $2
