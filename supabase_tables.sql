-- ═══════════════════════════════════════════════════════════════════════════════
-- STACKADVISOR - NEW TABLES FOR ADMIN PANEL
-- Run this SQL in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ANNOUNCEMENTS TABLE
-- For sending messages to app users
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'update', 'promo')),
    target_region TEXT,  -- NULL means all regions
    target_country TEXT, -- NULL means all countries
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_region ON announcements(target_region);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users (app reads announcements)
CREATE POLICY "Allow read announcements" ON announcements
    FOR SELECT USING (true);

-- Allow all operations for service role (admin panel uses service role)
CREATE POLICY "Allow all for service role" ON announcements
    FOR ALL USING (true);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. APP_SETTINGS TABLE
-- For remote configuration
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Allow read settings" ON app_settings
    FOR SELECT USING (true);

-- Allow all operations for service role
CREATE POLICY "Allow all for service role" ON app_settings
    FOR ALL USING (true);

-- Insert default settings
INSERT INTO app_settings (key, value, description) VALUES
    ('trial_days', '30', 'Number of days for free trial'),
    ('subscription_price_gbp', '5.00', 'Monthly subscription price in GBP'),
    ('subscription_price_usd', '6.00', 'Monthly subscription price in USD'),
    ('max_stacking_distance_miles', '2.0', 'Maximum distance (miles) to consider for stacking'),
    ('min_app_version', '1.0.0', 'Minimum required app version'),
    ('maintenance_mode', 'false', 'Enable maintenance mode (disables app)'),
    ('force_update', 'false', 'Force users to update to min_app_version'),
    ('auto_delivery_radius_miles', '0.1', 'Radius for auto-marking orders as delivered'),
    ('order_flash_reminder_minutes', '2', 'Minutes before order flashes reminder')
ON CONFLICT (key) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. BANNED_USERS TABLE
-- For blocking problematic users
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS banned_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    reason TEXT NOT NULL,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    banned_by TEXT DEFAULT 'admin'
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_email ON banned_users(email);

-- Enable RLS
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

-- Allow read for checking if user is banned
CREATE POLICY "Allow read banned_users" ON banned_users
    FOR SELECT USING (true);

-- Allow all operations for service role
CREATE POLICY "Allow all for service role" ON banned_users
    FOR ALL USING (true);


-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE! Your admin panel tables are ready.
-- ═══════════════════════════════════════════════════════════════════════════════
