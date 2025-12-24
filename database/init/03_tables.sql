create table if not exists users (
	id UUID primary key default gen_random_uuid(),
	email VARCHAR(50) not null,
	created_at TIMESTAMPTZ not null default now()
);

create table if not exists rooms (
	id UUID primary key default gen_random_uuid(),
	user_id UUID not null references users(id),
	name VARCHAR(16) not null,
	created_at TIMESTAMPTZ not null default now()
);

create table if not exists components (
	id UUID primary key default gen_random_uuid(),
	user_id UUID not null references users(id),
	room_id UUID not null references rooms(id),
	type COMPONENT not null,
	name VARCHAR(16) not null default '',
	power DECIMAL(10, 2) not null default 0,
	power_uom VARCHAR(16) not null default 'kW/s',
	metadata JSONB not null default '{}'::jsonb,
	created_at TIMESTAMPTZ not null default now()
);

create table if not exists events (
	id UUID primary key default gen_random_uuid(),
	created_by UUID not null references components(id),
	type EVENT_TYPE not null,
	payload JSONB not null default '{}'::jsonb,
	created_at TIMESTAMPTZ not null default now()
);
