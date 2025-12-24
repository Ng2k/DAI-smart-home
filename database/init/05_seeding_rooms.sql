-- test@test.com
insert into rooms (user_id, name)
values (
	(select id from users where email='test@test.com'),
	'living'
);
insert into rooms (user_id, name)
values (
	(select id from users where email='test@test.com'),
	'kitchen'
);
insert into rooms (user_id, name)
values (
	(select id from users where email='test@test.com'),
	'bathroom'
);

-- giacomo@test.com
insert into rooms (user_id, name)
values (
	(select id from users where email='giacomo@test.com'),
	'living'
);
insert into rooms (user_id, name)
values (
	(select id from users where email='giacomo@test.com'),
	'kitchen'
);
insert into rooms (user_id, name)
values (
	(select id from users where email='giacomo@test.com'),
	'bathroom'
);
insert into rooms (user_id, name)
values (
	(select id from users where email='giacomo@test.com'),
	'bedroom'
);

-- paolo@test.com
insert into rooms (user_id, name)
values (
	(select id from users where email='paolo@test.com'),
	'kitchen'
);
insert into rooms (user_id, name)
values (
	(select id from users where email='paolo@test.com'),
	'bathroom'
);
insert into rooms (user_id, name)
values (
	(select id from users where email='paolo@test.com'),
	'bedroom'
);


