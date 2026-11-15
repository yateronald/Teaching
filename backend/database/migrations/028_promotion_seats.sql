-- Migration 028: seats of a campaign taken outside the site, and how the seats left are shown.
--
--   seats_offline  people registered outside the site (phone, WhatsApp, in
--                  person). Real seats: they count as taken, so the site shows
--                  the true number left, and a group full with them puts the
--                  next person on the waiting list.
--   seats_display  « auto »: the site says « only 3 seats left » once few
--                  remain, and the size of the group before (« small group of
--                  8 »); « always »; « never » (show_seats = false until now).
--
-- Additive and safe to run twice.

ALTER TABLE promotions ADD COLUMN IF NOT EXISTS seats_offline INTEGER NOT NULL DEFAULT 0;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS seats_display VARCHAR(8) NOT NULL DEFAULT 'auto';

-- Campaigns that hid their seats keep them hidden.
UPDATE promotions SET seats_display = 'never' WHERE show_seats = false AND seats_display = 'auto';
