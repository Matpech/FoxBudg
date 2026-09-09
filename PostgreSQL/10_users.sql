CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_roles NOT NULL,
    password_hash TEXT NOT NULL,
    password_changed BOOLEAN DEFAULT FALSE
);

CREATE TABLE sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create manager account with default credentials
-- Default credentials are "manager@supherman.com:Suph3rm4n!"
INSERT INTO users (first_name, last_name, email, role, password_hash)
    VALUES ('Supherman', 'Manager', 'manager@supherman.com', 'manager', '$2b$12$U1sBCjNk7J20xOq2mqDvTeQQybjSTVYsFWX1Xm..v7PsDQ8jniw3m');