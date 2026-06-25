ALTER TABLE vehicle_brands
ADD COLUMN IF NOT EXISTS is_visible_on_web BOOLEAN DEFAULT FALSE;

UPDATE vehicle_brands
SET is_visible_on_web = TRUE
WHERE LOWER(name) IN (
  'chery',
  'great wall',
  'swm',
  'dfsk',
  'jetour',
  'shineray',
  'jac',
  'ford',
  'chevrolet'
);

UPDATE vehicle_brands
SET is_visible_on_web = FALSE
WHERE is_visible_on_web IS NULL;

ALTER TABLE vehicle_brands
ALTER COLUMN is_visible_on_web SET DEFAULT FALSE;
