CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_roles NOT NULL,
    password_hash TEXT NOT NULL,
    password_changed BOOLEAN DEFAULT FALSE
);

-- Create manager account with default credentials
-- Default credentials are "manager@supherman.com:Suph3rm4n!"
INSERT INTO users (first_name, last_name, email, role, password_hash)
    VALUES ('Supherman', 'Manager', 'manager@supherman.com', 'manager', '$2y$12$DVNWnhqoqkcU9cul8jd7K.gJpYY59NkWFE6ZOWtehX/pn1LGcnaNO');