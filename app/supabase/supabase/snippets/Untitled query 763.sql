ALTER TABLE profiles 
ALTER COLUMN birthdate TYPE date 
USING to_date(birthdate, 'DD/MM/YYYY');