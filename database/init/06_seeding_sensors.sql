-- test@test.com
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'temperature',
	0.15,
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'humidity',
	0.05,
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'temperature',
	0.15,
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='test@test.com')),
	'sensor',
	'humidity',
	0.05,
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);

-- giacomo@test.com
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='giacomo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
-- paolo@test.com
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='paolo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='paolo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='paolo@test.com')),
	'sensor',
	'temperature',
	0.15,
	'{"initial_value": 20, "max_value": 25, "uom": "°C", "freq": 2, "freq_uom": "sec", "actuator": "heater"}'::jsonb
);
insert into components (user_id, room_id, type, name, power, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='paolo@test.com')),
	'sensor',
	'humidity',
	0.05,
	'{"initial_value": 40, "max_value": 50, "uom": "%", "freq": 5, "freq_uom": "sec", "actuator": "dehumidifier"}'::jsonb
);

