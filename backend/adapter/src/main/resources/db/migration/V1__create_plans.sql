CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE plans (
    id uuid PRIMARY KEY,
    -- Keep the length equal to Plan.MAX_NAME_LENGTH in the domain module.
    name varchar(200) NOT NULL,
    created_at timestamptz NOT NULL
);
