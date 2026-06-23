-- =========================================================
-- El Chino Americano — Vehicle Brands & Models (Extended)
-- Run after 002_seed.sql
-- Focused on: Chevrolet, Ford (American) + Chinese brands in Ecuador
-- =========================================================

-- ─────────────────────────────────────────
-- NEW VEHICLE BRANDS
-- ─────────────────────────────────────────
INSERT INTO vehicle_brands (name, origin, sort_order) VALUES
  -- Chinese (additional)
  ('Haval',    'chinese',  11),
  ('Geely',    'chinese',  12),
  ('Changan',  'chinese',  13),
  ('Foton',    'chinese',  14),
  ('Lifan',    'chinese',  15),
  ('Zotye',    'chinese',  16),
  -- Korean (popular in Ecuador, often grouped with Chinese market)
  ('Kia',      'korean',   17),
  ('Hyundai',  'korean',   18),
  -- Japanese (high demand for spare parts)
  ('Toyota',   'japanese', 19),
  ('Nissan',   'japanese', 20),
  ('Mazda',    'japanese', 21);

-- ─────────────────────────────────────────
-- CHEVROLET — Línea americana full-size
-- Trucks, SUVs y musclecars del mercado USA
-- (los modelos economía/mercado emergente van aparte si aplica)
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  -- Silverado 1500 — half-ton pickup
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Silverado 1500', '5.3', 'gasoline', 2014, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Silverado 1500', '6.2', 'gasoline', 2014, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Silverado 1500', '2.7T','gasoline', 2019, NULL),
  -- Silverado 2500 HD — heavy-duty pickup
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Silverado 2500 HD', '6.6', 'diesel',   2019, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Silverado 2500 HD', '6.0', 'gasoline', 2014, NULL),
  -- Silverado 3500 HD
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Silverado 3500 HD', '6.6', 'diesel',   2019, NULL),

  -- Colorado — mid-size truck (American spec, gasolina)
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Colorado',       '3.6', 'gasoline', 2015, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Colorado',       '2.8', 'diesel',   2015, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Colorado ZR2',   '3.6', 'gasoline', 2017, NULL),

  -- Tahoe — full-size SUV
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Tahoe',          '5.3', 'gasoline', 2015, 2020),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Tahoe',          '6.2', 'gasoline', 2021, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Tahoe',          '3.0', 'diesel',   2021, NULL),

  -- Suburban — full-size SUV (extended)
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Suburban',       '5.3', 'gasoline', 2015, 2020),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Suburban',       '6.2', 'gasoline', 2021, NULL),

  -- Traverse — crossover 3 filas
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Traverse',       '3.6', 'gasoline', 2018, NULL),

  -- Blazer — midsize SUV (renacimiento 2019)
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Blazer',         '2.0T','gasoline', 2019, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Blazer',         '3.6', 'gasoline', 2019, NULL),

  -- TrailBlazer — compact SUV (sold in LatAm & Asia)
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'TrailBlazer',    '1.3T','gasoline', 2021, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'TrailBlazer',    '3.5', 'gasoline', 2002, 2009),

  -- Equinox — compact SUV
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Equinox',        '1.5T','gasoline', 2018, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Equinox',        '2.0T','gasoline', 2018, NULL),

  -- Camaro — muscle car / sports
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Camaro',         '2.0T','gasoline', 2016, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Camaro',         '3.6', 'gasoline', 2012, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Camaro SS',      '6.2', 'gasoline', 2010, NULL),

  -- Corvette — sports car
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Corvette C7',    '6.2', 'gasoline', 2014, 2019),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chevrolet'), 'Corvette C8',    '6.2', 'gasoline', 2020, NULL);

-- ─────────────────────────────────────────
-- FORD — Extended model lineup
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  -- EcoSport — compact SUV, very popular
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'EcoSport',      '1.5', 'gasoline', 2014, 2021),
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'EcoSport',      '2.0', 'gasoline', 2017, 2021),
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'EcoSport',      '1.0T','gasoline', 2019, 2022),

  -- Escape — mid-size SUV
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Escape',        '1.5T', 'gasoline', 2013, 2019),
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Escape',        '2.0T', 'gasoline', 2013, 2023),

  -- Edge — mid-size SUV
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Edge',          '2.0T', 'gasoline', 2015, 2023),

  -- Territory — mid-size SUV (Chinese-produced, popular in LatAm)
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Territory',     '1.5T', 'gasoline', 2021, NULL),

  -- Bronco Sport — compact SUV
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Bronco Sport',  '1.5T', 'gasoline', 2021, NULL),

  -- Ranger — pickup, best seller (already has 2.5 entry, adding more)
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Ranger',        '3.2', 'diesel',   2015, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Ranger',        '2.0', 'diesel',   2019, NULL),

  -- F-150 (already has 3.5 entry, adding more)
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'F-150',         '2.7T', 'gasoline', 2015, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'F-150',         '5.0', 'gasoline', 2011, NULL),

  -- Explorer (already has 2.3 entry, adding more)
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Explorer',      '3.5T', 'gasoline', 2017, 2023),

  -- Expedition
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Expedition',    '3.5T', 'gasoline', 2018, NULL),

  -- Mustang
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Mustang',       '2.3T', 'gasoline', 2015, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Ford'), 'Mustang',       '5.0', 'gasoline', 2015, NULL);

-- ─────────────────────────────────────────
-- CHERY — Extended (market leader in Chinese segment)
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Chery'), 'Tiggo 2',       '1.5', 'gasoline', 2019, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chery'), 'Tiggo 2 Pro',   '1.5', 'gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chery'), 'Tiggo 4',       '1.5', 'gasoline', 2017, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chery'), 'Tiggo 4 Pro',   '1.5T','gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chery'), 'Tiggo 7 Pro',   '1.5T','gasoline', 2021, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chery'), 'Tiggo 8 Pro',   '1.6T','gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chery'), 'Arrizo 6',      '1.5T','gasoline', 2020, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Chery'), 'Arrizo 6 Pro',  '1.6T','gasoline', 2023, NULL);

-- ─────────────────────────────────────────
-- GREAT WALL — Extended
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Great Wall'), 'Wingle 7',    '2.0', 'diesel',   2021, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Great Wall'), 'Poer',        '2.0', 'diesel',   2021, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Great Wall'), 'Jolion',      '1.5T','gasoline', 2021, NULL);

-- ─────────────────────────────────────────
-- HAVAL (sub-brand of Great Wall, own brand in Ecuador)
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Haval'), 'H2',     '1.5T', 'gasoline', 2016, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Haval'), 'H6',     '1.5T', 'gasoline', 2018, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Haval'), 'H6',     '2.0T', 'gasoline', 2018, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Haval'), 'Jolion', '1.5T', 'gasoline', 2022, NULL);

-- ─────────────────────────────────────────
-- BYD — Extended (growing EV presence)
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'BYD'), 'Atto 3',     NULL,  'electric', 2023, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'BYD'), 'Sea Lion 05','1.5T','hybrid',   2024, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'BYD'), 'Yuan Plus',  NULL,  'electric', 2023, NULL);

-- ─────────────────────────────────────────
-- DFSK — Extended
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'DFSK'), 'Glory 500',    '1.5', 'gasoline', 2019, 2023),
  ((SELECT id FROM vehicle_brands WHERE name = 'DFSK'), 'Glory 560',    '1.5T','gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'DFSK'), 'K01',          '1.3', 'gasoline', 2017, NULL);

-- ─────────────────────────────────────────
-- JETOUR — Extended
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Jetour'), 'X70',       '1.5T', 'gasoline', 2020, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Jetour'), 'X70 Plus',  '1.5T', 'gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Jetour'), 'X90',       '2.0T', 'gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Jetour'), 'Dashing',   '1.5T', 'gasoline', 2023, NULL);

-- ─────────────────────────────────────────
-- MG — Extended
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'MG'), 'MG3',    '1.5', 'gasoline', 2021, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'MG'), 'MG5',    '1.5T','gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'MG'), 'HS',     '1.5T','gasoline', 2020, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'MG'), 'ZS EV',  NULL,  'electric', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'MG'), 'RX5',    '2.0T','gasoline', 2020, NULL);

-- ─────────────────────────────────────────
-- JAC — Extended
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'JAC'), 'Sei3',  '1.5', 'gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'JAC'), 'Sei7',  '1.5T','gasoline', 2023, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'JAC'), 'JS4',   '1.5T','gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'JAC'), 'T9',    '2.0T','diesel',   2023, NULL);

-- ─────────────────────────────────────────
-- SHINERAY — Extended (popular pickup in Ecuador)
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Shineray'), 'Jet (X30)',  '1.5', 'gasoline', 2018, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Shineray'), 'T22',        '2.2', 'gasoline', 2017, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Shineray'), 'X30L',       '1.5', 'gasoline', 2021, NULL);

-- ─────────────────────────────────────────
-- GEELY
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Geely'), 'Emgrand',   '1.5', 'gasoline', 2016, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Geely'), 'Coolray',   '1.5T','gasoline', 2020, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Geely'), 'Atlas',     '2.4', 'gasoline', 2018, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Geely'), 'Atlas Pro',  '1.8T','gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Geely'), 'Tugella',   '2.0T','gasoline', 2023, NULL);

-- ─────────────────────────────────────────
-- CHANGAN
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Changan'), 'CS35 Plus',      '1.4T', 'gasoline', 2019, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Changan'), 'CS55',           '1.5T', 'gasoline', 2018, 2023),
  ((SELECT id FROM vehicle_brands WHERE name = 'Changan'), 'CS55 Plus',      '1.5T', 'gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Changan'), 'CS75 Plus',      '1.5T', 'gasoline', 2021, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Changan'), 'Hunter Plus',    '2.0T', 'gasoline', 2022, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Changan'), 'Alsvin',         '1.4T', 'gasoline', 2021, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Changan'), 'Oshan Z6',       '1.5T', 'gasoline', 2023, NULL);

-- ─────────────────────────────────────────
-- FOTON
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Foton'), 'Tunland E',  '2.0T', 'diesel',   2020, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Foton'), 'Gratour T3', '1.5',  'gasoline', 2018, NULL);

-- ─────────────────────────────────────────
-- LIFAN
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Lifan'), '520',    '1.3', 'gasoline', 2010, 2018),
  ((SELECT id FROM vehicle_brands WHERE name = 'Lifan'), '620',    '1.6', 'gasoline', 2012, 2019),
  ((SELECT id FROM vehicle_brands WHERE name = 'Lifan'), 'X60',    '1.8', 'gasoline', 2013, 2020),
  ((SELECT id FROM vehicle_brands WHERE name = 'Lifan'), 'Foison', '1.5', 'gasoline', 2018, NULL);

-- ─────────────────────────────────────────
-- KIA — popular in Ecuador, high parts demand
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Kia'), 'Rio Xcite',   '1.4', 'gasoline', 2010, 2017),
  ((SELECT id FROM vehicle_brands WHERE name = 'Kia'), 'Rio',         '1.4', 'gasoline', 2017, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Kia'), 'Sportage',    '2.0', 'gasoline', 2011, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Kia'), 'Stinger',     '2.0T','gasoline', 2018, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Kia'), 'Sorento',     '2.4', 'gasoline', 2015, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Kia'), 'Picanto',     '1.0', 'gasoline', 2012, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Kia'), 'Seltos',      '1.4T','gasoline', 2021, NULL);

-- ─────────────────────────────────────────
-- HYUNDAI
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Hyundai'), 'Accent',    '1.4', 'gasoline', 2012, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Hyundai'), 'Elantra',   '1.6', 'gasoline', 2011, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Hyundai'), 'Tucson',    '2.0', 'gasoline', 2010, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Hyundai'), 'Santa Fe',  '2.4', 'gasoline', 2013, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Hyundai'), 'Creta',     '1.6', 'gasoline', 2017, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Hyundai'), 'Venue',     '1.0T','gasoline', 2021, NULL);

-- ─────────────────────────────────────────
-- TOYOTA
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Toyota'), 'Hilux',       '2.4', 'diesel',   2016, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Toyota'), 'Hilux',       '2.8', 'diesel',   2016, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Toyota'), 'Land Cruiser','4.0', 'gasoline', 2010, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Toyota'), 'SW4 / Prado', '2.8', 'diesel',   2015, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Toyota'), '4Runner',     '4.0', 'gasoline', 2010, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Toyota'), 'Corolla',     '1.8', 'gasoline', 2014, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Toyota'), 'Yaris',       '1.5', 'gasoline', 2014, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Toyota'), 'RAV4',        '2.5', 'hybrid',   2019, NULL);

-- ─────────────────────────────────────────
-- NISSAN
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Nissan'), 'Frontier',   '2.5', 'diesel',   2016, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Nissan'), 'Navara',     '2.3', 'diesel',   2016, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Nissan'), 'Sentra',     '1.8', 'gasoline', 2013, 2023),
  ((SELECT id FROM vehicle_brands WHERE name = 'Nissan'), 'X-Trail',    '2.5', 'gasoline', 2014, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Nissan'), 'Kicks',      '1.6', 'gasoline', 2017, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Nissan'), 'Pathfinder', '3.5', 'gasoline', 2013, NULL);

-- ─────────────────────────────────────────
-- MAZDA
-- ─────────────────────────────────────────
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  ((SELECT id FROM vehicle_brands WHERE name = 'Mazda'), 'CX-5',     '2.0', 'gasoline', 2013, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Mazda'), 'CX-30',    '2.0', 'gasoline', 2021, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Mazda'), 'Mazda3',   '2.0', 'gasoline', 2014, NULL),
  ((SELECT id FROM vehicle_brands WHERE name = 'Mazda'), 'BT-50',    '3.2', 'diesel',   2012, 2022),
  ((SELECT id FROM vehicle_brands WHERE name = 'Mazda'), 'BT-50',    '3.0', 'diesel',   2022, NULL);

-- ─────────────────────────────────────────
-- ADDITIONAL PART BRANDS (extended list)
-- ─────────────────────────────────────────
INSERT INTO part_brands (name, origin_country) VALUES
  ('Delphi',         'USA'),
  ('ACDelco',        'USA'),
  ('Motorcraft',     'USA'),     -- Ford OEM brand
  ('Mopar',          'USA'),
  ('Mahle',          'Germany'),
  ('KYB',            'Japan'),
  ('Tokico',         'Japan'),
  ('NTK / NGK',      'Japan'),
  ('Valeo',          'France'),
  ('Hella',          'Germany'),
  ('Exide',          'USA'),
  ('Bosch China',    'China'),
  ('Filtron',        'Poland'),
  ('WIX',            'USA'),
  ('Corteco',        'Germany'),
  ('LUK',            'Germany'),
  ('SKF',            'Sweden'),
  ('FAG / Schaeffler','Germany'),
  ('Aisin',          'Japan'),
  ('Nissens',        'Denmark');
