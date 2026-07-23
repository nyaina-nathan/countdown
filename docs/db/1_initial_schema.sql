create table users(
    id uuid primary key default gen_random_uuid(),
    username varchar(255) not null,
    email varchar not null unique,
    password_hash varchar(60),
    created_at timestamptz default now(),
    updated_at timestamptz
);

create table countdowns(
    id uuid primary key default gen_random_uuid(),
    id_user uuid not null references users(id) on delete cascade,
    title varchar(255) not null,
    description text,
    due_date timestamptz not null,
    created_at timestamptz default now()
);