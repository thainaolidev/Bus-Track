-- Proposed PostgreSQL schema for a future backend; this file is NOT applied by the current app.
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Viajante',
  avatar TEXT NOT NULL DEFAULT '🙂',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'green' CHECK (theme IN ('green','blue','pink')),
  bus_color TEXT NOT NULL DEFAULT '#19a879',
  show_location BOOLEAN NOT NULL DEFAULT true,
  show_nearby_stops BOOLEAN NOT NULL DEFAULT true,
  show_arrival_times BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE routes (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL,
  origin TEXT NOT NULL, destination TEXT NOT NULL,
  geometry JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE stops (
  id TEXT PRIMARY KEY, name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180)
);
CREATE TABLE route_stops (
  route_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  stop_id TEXT NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL CHECK (sequence >= 0),
  PRIMARY KEY (route_id, stop_id), UNIQUE (route_id, sequence)
);
CREATE TABLE favorite_lines (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  line_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (user_id,line_id)
);
CREATE TABLE favorite_stops (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stop_id TEXT NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (user_id,stop_id)
);
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY, route_id TEXT NOT NULL REFERENCES routes(id), status TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX vehicles_route_updated_idx ON vehicles(route_id, updated_at DESC);
CREATE TABLE arrivals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES routes(id), stop_id TEXT NOT NULL REFERENCES stops(id),
  estimated_minutes INTEGER NOT NULL CHECK (estimated_minutes >= 0), updated_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE service_alerts (
  id UUID PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
  route_id TEXT REFERENCES routes(id), stop_id TEXT REFERENCES stops(id),
  severity TEXT NOT NULL CHECK (severity IN ('info','warning','critical')),
  start_at TIMESTAMPTZ NOT NULL, end_at TIMESTAMPTZ
);
CREATE TABLE operational_incidents (
  id UUID PRIMARY KEY, type TEXT NOT NULL CHECK (type IN ('breakdown','accident','operational','heavy_traffic','road_restriction','significant_delay','cancelled_trip','route_change')),
  status TEXT NOT NULL CHECK (status IN ('reported','under_review','in_progress','resolved','closed')),
  route_id TEXT NOT NULL REFERENCES routes(id), vehicle_id TEXT REFERENCES vehicles(id),
  internal_latitude DOUBLE PRECISION, internal_longitude DOUBLE PRECISION,
  reported_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  estimated_resolution TIMESTAMPTZ, impact_minutes INTEGER CHECK (impact_minutes >= 0),
  operator_note TEXT
);
-- Production access policy: passenger roles must not read operational_incidents or raw vehicle coordinates.
-- Expose only this sanitized projection to passengers; enforce grants/RLS in the deployed backend.
CREATE VIEW passenger_incident_feed AS
  SELECT id, type, status, route_id, reported_at, updated_at, estimated_resolution, impact_minutes
  FROM operational_incidents WHERE status <> 'closed';
CREATE VIEW passenger_vehicle_positions AS
  SELECT v.id, v.route_id, v.latitude, v.longitude, v.updated_at
  FROM vehicles v
  WHERE NOT EXISTS (
    SELECT 1 FROM operational_incidents i
    WHERE i.vehicle_id = v.id AND i.type IN ('breakdown','accident')
      AND i.status IN ('reported','under_review','in_progress')
  );
CREATE TABLE trip_records (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id TEXT NOT NULL REFERENCES routes(id), vehicle_id TEXT REFERENCES vehicles(id),
  origin_stop_id TEXT NOT NULL REFERENCES stops(id), destination_stop_id TEXT REFERENCES stops(id),
  service_date DATE NOT NULL, boarding_time TIME, scheduled_departure TIMESTAMPTZ,
  scheduled_arrival TIMESTAMPTZ, actual_arrival TIMESTAMPTZ,
  estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes >= 0),
  delay_minutes INTEGER CHECK (delay_minutes >= 0), incident_id UUID REFERENCES operational_incidents(id),
  source TEXT NOT NULL CHECK (source IN ('operator','authorized_vehicle_system','demo')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX trip_records_user_date_idx ON trip_records(user_id, service_date DESC);
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  approaching BOOLEAN NOT NULL DEFAULT true, service_changes BOOLEAN NOT NULL DEFAULT true,
  favorite_reminders BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE notifications (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX notifications_user_created_idx ON notifications(user_id, created_at DESC);
