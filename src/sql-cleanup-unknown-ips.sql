-- Clean up any existing "unknown" IP addresses in the database
-- Run this in your Supabase SQL Editor

-- This will fix any existing "unknown" IP addresses that might be causing INET errors

-- Update user_sessions table - handle both string 'unknown' and any invalid IPs
UPDATE user_sessions 
SET ip_address = NULL 
WHERE ip_address IS NOT NULL 
  AND (
    ip_address::text = 'unknown' 
    OR ip_address::text = '' 
    OR ip_address::text = 'null'
    OR ip_address::text = 'undefined'
  );

-- Update user_actions table - handle both string 'unknown' and any invalid IPs  
UPDATE user_actions 
SET ip_address = NULL 
WHERE ip_address IS NOT NULL 
  AND (
    ip_address::text = 'unknown' 
    OR ip_address::text = '' 
    OR ip_address::text = 'null'
    OR ip_address::text = 'undefined'
  );

-- Create a trigger to prevent invalid IP addresses from being inserted
CREATE OR REPLACE FUNCTION validate_ip_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If ip_address is not a valid IP and not null, set it to null
  IF NEW.ip_address IS NOT NULL THEN
    -- Check if it's one of the invalid string values
    IF NEW.ip_address::text IN ('unknown', '', 'null', 'undefined') THEN
      NEW.ip_address := NULL;
    ELSE
      -- Try to validate it's a real IP address, if not, set to null
      BEGIN
        -- This will throw an error if not a valid IP
        PERFORM NEW.ip_address::inet;
      EXCEPTION 
        WHEN OTHERS THEN
          NEW.ip_address := NULL;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to both tables
DROP TRIGGER IF EXISTS validate_ip_user_sessions ON user_sessions;
CREATE TRIGGER validate_ip_user_sessions
  BEFORE INSERT OR UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION validate_ip_address();

DROP TRIGGER IF EXISTS validate_ip_user_actions ON user_actions;  
CREATE TRIGGER validate_ip_user_actions
  BEFORE INSERT OR UPDATE ON user_actions
  FOR EACH ROW EXECUTE FUNCTION validate_ip_address();

SELECT 'IP address validation triggers created successfully!' as success_message;