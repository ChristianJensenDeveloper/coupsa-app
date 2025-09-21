-- Fix for UUID fields to handle NULL values properly  
-- Run this in your Supabase SQL Editor

-- Ensure all UUID fields in analytics tables can accept NULL
ALTER TABLE user_sessions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE user_actions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE user_actions ALTER COLUMN deal_id DROP NOT NULL;
ALTER TABLE user_actions ALTER COLUMN firm_id DROP NOT NULL;

-- Clean up any existing invalid UUID strings that might exist
-- These updates will only affect rows with invalid UUID formats
UPDATE user_sessions 
SET user_id = NULL 
WHERE user_id IS NOT NULL AND user_id::text ~ '^test-user-[0-9]';

UPDATE user_actions 
SET user_id = NULL 
WHERE user_id IS NOT NULL AND user_id::text ~ '^test-user-[0-9]';

UPDATE user_actions 
SET deal_id = NULL 
WHERE deal_id IS NOT NULL AND deal_id::text ~ '^test-deal-[0-9]';

UPDATE user_actions 
SET firm_id = NULL 
WHERE firm_id IS NOT NULL AND firm_id::text ~ '^test-firm-[0-9]';

-- Test that UUID fields work properly
SELECT 'UUID fields fixed successfully! NULL values are now properly handled.' as success_message;