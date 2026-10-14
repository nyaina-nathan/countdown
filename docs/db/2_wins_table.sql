-- Active: 1790841303608@@127.0.0.1@5432@countdown
create table if not exists wins (
    id uuid primary key default gen_random_uuid(),
    id_user uuid not null references users(id) on delete cascade,
    title varchar(255) not null,
    description text,
    created_at timestamptz default now()
);