-- Fix for INET fields to handle NULL values properly
-- Run this in your Supabase SQL Editor

-- Ensure ip_address fields can accept NULL and handle 'unknown' strings
-- This update will convert any existing 'unknown' string values to NULL

-- Update user_sessions table
UPDATE user_sessions 
SET ip_address = NULL 
WHERE ip_address::text = 'unknown';

-- Update user_actions table  
UPDATE user_actions 
SET ip_address = NULL 
WHERE ip_address::text = 'unknown';

-- Ensure columns allow NULL (they should already, but let's be explicit)
ALTER TABLE user_sessions ALTER COLUMN ip_address DROP NOT NULL;
ALTER TABLE user_actions ALTER COLUMN ip_address DROP NOT NULL;

-- Create a function to safely cast IP addresses
CREATE OR REPLACE FUNCTION safe_inet_cast(ip_text TEXT)
RETURNS INET AS $$
BEGIN
  -- Return NULL for 'unknown' or invalid IP addresses
  IF ip_text IS NULL OR ip_text = 'unknown' OR ip_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Try to cast to INET, return NULL if invalid
  BEGIN
    RETURN ip_text::INET;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT safe_inet_cast('192.168.1.1') as valid_ip,
       safe_inet_cast('unknown') as unknown_ip,
       safe_inet_cast(NULL) as null_ip;

SELECT 'INET fields fixed successfully! NULL values are now properly handled.' as success_message;