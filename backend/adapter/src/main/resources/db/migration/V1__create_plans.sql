CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE plans (
    id uuid PRIMARY KEY,
    name varchar(200) NOT NULL,
    created_at timestamptz NOT NULL
);
