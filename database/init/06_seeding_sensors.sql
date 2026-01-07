-- test@test.com
INSERT INTO components (user_id, room_id, type, name, power, power_uom, metadata)
VALUES (
    (select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
    'sensor',
    'co2',
    0.05,
    'W',
    '{
        "uom": "ppm",
        "freq": 3,
        "freq_uom": "sec",
        "actuator": "ventilation",
        "initial_value": 600,
        "max_value": 1000
    }'
);
INSERT INTO components (user_id, room_id, type, name, power, power_uom, metadata)
VALUES (
    (select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
    'sensor',
    'luminosity',
    0.03,
    'kW/s',
    '{
        "uom": "lux",
        "freq": 2,
        "freq_uom": "sec",
        "actuator": "light",
        "initial_value": 400,
        "max_value": 700
    }'
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'temperature',
	0.15,
	'kW/s',
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'humidity',
	0.05,
	'kW/s',
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'temperature',
	0.15,
	'kW/s',
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'humidity',
	0.05,
	'kW/s',
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
INSERT INTO components (user_id, room_id, type, name, power, power_uom, metadata)
VALUES (
    (select id from users where email='test@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='test@test.com')),
    'sensor',
    'co2',
    0.05,
    'W',
    '{
        "uom": "ppm",
        "freq": 3,
        "freq_uom": "sec",
        "actuator": "ventilation",
        "initial_value": 600,
        "max_value": 1000
    }'
);
INSERT INTO components (user_id, room_id, type, name, power, power_uom, metadata)
VALUES (
    (select id from users where email='test@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='test@test.com')),
    'sensor',
    'luminosity',
    0.03,
    'kW/s',
    '{
        "uom": "lux",
        "freq": 2,
        "freq_uom": "sec",
        "actuator": "light",
        "initial_value": 400,
        "max_value": 700
    }'
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'temperature',
	0.15,
	'kW/s',
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
INSERT INTO components (user_id, room_id, type, name, power, power_uom, metadata)
VALUES (
    (select id from users where email='test@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='test@test.com')),
    'sensor',
    'co2',
    0.05,
    'W',
    '{
        "uom": "ppm",
        "freq": 3,
        "freq_uom": "sec",
        "actuator": "ventilation",
        "initial_value": 600,
        "max_value": 1000
    }'
);
INSERT INTO components (user_id, room_id, type, name, power, power_uom, metadata)
VALUES (
    (select id from users where email='test@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='test@test.com')),
    'sensor',
    'luminosity',
    0.03,
    'kW/s',
    '{
        "uom": "lux",
        "freq": 2,
        "freq_uom": "sec",
        "actuator": "light",
        "initial_value": 400,
        "max_value": 700
    }'
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'humidity',
	0.05,
	'kW/s',
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);

-- giacomo@test.com
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'kW/s',
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'kW/s',
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'kW/s',
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'kW/s',
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'kW/s',
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'kW/s',
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
-- paolo@test.com
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='paolo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'kW/s',
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='paolo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'kW/s',
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='paolo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'kW/s',
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='paolo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'kW/s',
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
