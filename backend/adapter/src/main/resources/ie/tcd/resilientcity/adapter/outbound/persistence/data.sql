INSERT INTO district (id, name, centre) VALUES
    ('D01', 'City Centre', ST_SetSRID(ST_MakePoint(-6.2603, 53.3498), 4326)),
    ('D02', 'Docklands', ST_SetSRID(ST_MakePoint(-6.2389, 53.3478), 4326)),
    ('D03', 'Rathmines', ST_SetSRID(ST_MakePoint(-6.2650, 53.3225), 4326))
ON CONFLICT (id) DO NOTHING;
