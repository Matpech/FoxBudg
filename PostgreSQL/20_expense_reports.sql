CREATE TABLE expense_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount DOUBLE PRECISION NOT NULL CHECK (amount >= 0),
    status report_status NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    comment TEXT
);

CREATE TABLE document_metadata (
    id UUID PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES expense_reports(id) ON DELETE RESTRICT,
    original_name TEXT
);