CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  document_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  selfie_key TEXT NOT NULL,
  document_image_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verifications_email ON verifications (email);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications (status);