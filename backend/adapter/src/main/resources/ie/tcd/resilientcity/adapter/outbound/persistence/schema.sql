CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS district (
    id     VARCHAR(64)           PRIMARY KEY,
    name   VARCHAR(255)          NOT NULL,
    centre geometry(Point, 4326) NOT NULL
);
