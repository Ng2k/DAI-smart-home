-- test@test.com
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
	'actuator',
	'heater',
	0.05,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
	'actuator',
	'ventilation',
	0.12,
	'kW/s',
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
	'actuator',
	'light',
	0.015,
	'kW/s',
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='test@test.com')),
	'actuator',
	'dehumidifier',
	0.20,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='test@test.com')),
	'actuator',
	'heater',
	0.05,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='test@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='test@test.com')),
	'actuator',
	'dehumidifier',
	0.20,
	'{}'::jsonb
);

-- giacomo@test.com
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='giacomo@test.com')),
	'actuator',
	'heater',
	0.05,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='living' and user_id = (select id from users where email='giacomo@test.com')),
	'actuator',
	'dehumidifier',
	0.20,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='giacomo@test.com')),
	'actuator',
	'heater',
	0.05,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='giacomo@test.com')),
	'actuator',
	'dehumidifier',
	0.20,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='giacomo@test.com')),
	'actuator',
	'heater',
	0.05,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='giacomo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='giacomo@test.com')),
	'actuator',
	'dehumidifier',
	0.20,
	'{}'::jsonb
);

-- paolo@test.com
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='bathroom' and user_id = (select id from users where email='paolo@test.com')),
	'actuator',
	'heater',
	0.05,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='kitchen' and user_id = (select id from users where email='paolo@test.com')),
	'actuator',
	'dehumidifier',
	0.20,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='paolo@test.com')),
	'actuator',
	'heater',
	0.05,
	'{}'::jsonb
);
insert into components (user_id, room_id, type, name, power, power_uom, metadata)
values (
	(select id from users where email='paolo@test.com'),
	(select id from rooms where name='bedroom' and user_id = (select id from users where email='paolo@test.com')),
	'actuator',
	'dehumidifier',
	0.20,
	'{}'::jsonb
);
