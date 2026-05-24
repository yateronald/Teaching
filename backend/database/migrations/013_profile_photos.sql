-- Add profile_photo_kdrive_file_id column to users
-- Stores the kDrive file ID of the user's profile photo (if any).
-- Photos are uploaded to a `Profile_Photos` folder on Infomaniak kDrive.
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_kdrive_file_id VARCHAR(255);
