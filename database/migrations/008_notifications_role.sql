-- Migration 008: Add role, reference_id, is_read columns to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS role VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_id VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
