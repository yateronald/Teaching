-- Add is_active column (default TRUE for existing users)
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Add failed_login_attempts column (default 0)
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;

-- Add last_failed_login timestamp
ALTER TABLE users ADD COLUMN last_failed_login DATETIME;

-- Add account_locked_until timestamp for temporary locks
ALTER TABLE users ADD COLUMN account_locked_until DATETIME;

-- Create index for performance on is_active column
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Create index for failed login attempts
CREATE INDEX IF NOT EXISTS idx_users_failed_attempts ON users(failed_login_attempts);

-- Update existing users to be active by default
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;