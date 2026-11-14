-- Migration: 004_reference_data.sql
-- Description: Seed reference data for all 12 Goa talukas with micro-hubs and standard categories

-- 1. Categories
INSERT INTO categories (category_name) VALUES
  ('Food & Beach Dining'),
  ('Travel & Villas'),
  ('Nightlife & Sunsets'),
  ('Resort Fashion'),
  ('Wellness & Surf'),
  ('Goan Heritage')
ON CONFLICT (category_name) DO NOTHING;

-- 2. Locations (All 12 Goa Talukas and their micro-hubs)
-- North Goa Talukas: Bardez, Tiswadi, Pernem, Bicholim, Sattari, Ponda
-- South Goa Talukas: Salcete, Mormugao, Canacona, Quepem, Sanguem, Dharbandora

INSERT INTO locations (area_name, taluka, district) VALUES
  -- Bardez (North Goa)
  ('Assagao', 'Bardez', 'North Goa'),
  ('Calangute', 'Bardez', 'North Goa'),
  ('Anjuna', 'Bardez', 'North Goa'),
  ('Vagator', 'Bardez', 'North Goa'),
  ('Siolim', 'Bardez', 'North Goa'),
  ('Mapusa', 'Bardez', 'North Goa'),
  ('Candolim', 'Bardez', 'North Goa'),
  ('Saligao', 'Bardez', 'North Goa'),
  ('Porvorim', 'Bardez', 'North Goa'),
  ('Arpora', 'Bardez', 'North Goa'),
  ('Moira', 'Bardez', 'North Goa'),
  ('Aldona', 'Bardez', 'North Goa'),

  -- Tiswadi (North Goa)
  ('Panjim', 'Tiswadi', 'North Goa'),
  ('Fontainhas', 'Tiswadi', 'North Goa'),
  ('Miramar', 'Tiswadi', 'North Goa'),
  ('Dona Paula', 'Tiswadi', 'North Goa'),
  ('Bambolim', 'Tiswadi', 'North Goa'),
  ('Old Goa', 'Tiswadi', 'North Goa'),
  ('Ribandar', 'Tiswadi', 'North Goa'),
  ('Caranzalem', 'Tiswadi', 'North Goa'),

  -- Pernem (North Goa)
  ('Morjim', 'Pernem', 'North Goa'),
  ('Arambol', 'Pernem', 'North Goa'),
  ('Mandrem', 'Pernem', 'North Goa'),
  ('Ashwem', 'Pernem', 'North Goa'),
  ('Pernem Town', 'Pernem', 'North Goa'),
  ('Querim', 'Pernem', 'North Goa'),

  -- Bicholim (North Goa)
  ('Bicholim Town', 'Bicholim', 'North Goa'),
  ('Sanquelim', 'Bicholim', 'North Goa'),
  ('Mayem', 'Bicholim', 'North Goa'),

  -- Sattari (North Goa)
  ('Valpoi', 'Sattari', 'North Goa'),
  ('Honda', 'Sattari', 'North Goa'),

  -- Ponda (North Goa)
  ('Ponda Town', 'Ponda', 'North Goa'),
  ('Bandora', 'Ponda', 'North Goa'),
  ('Mardol', 'Ponda', 'North Goa'),
  ('Shiroda', 'Ponda', 'North Goa'),

  -- Salcete (South Goa)
  ('Margao', 'Salcete', 'South Goa'),
  ('Colva', 'Salcete', 'South Goa'),
  ('Benaulim', 'Salcete', 'South Goa'),
  ('Cavelossim', 'Salcete', 'South Goa'),
  ('Majorda', 'Salcete', 'South Goa'),
  ('Betalbatim', 'Salcete', 'South Goa'),
  ('Varca', 'Salcete', 'South Goa'),
  ('Fatorda', 'Salcete', 'South Goa'),

  -- Mormugao (South Goa)
  ('Vasco', 'Mormugao', 'South Goa'),
  ('Bogmalo', 'Mormugao', 'South Goa'),
  ('Chicalim', 'Mormugao', 'South Goa'),
  ('Dabolim', 'Mormugao', 'South Goa'),
  ('Baina', 'Mormugao', 'South Goa'),
  ('Sancoale', 'Mormugao', 'South Goa'),

  -- Canacona (South Goa)
  ('Palolem', 'Canacona', 'South Goa'),
  ('Agonda', 'Canacona', 'South Goa'),
  ('Patnem', 'Canacona', 'South Goa'),
  ('Chaudi', 'Canacona', 'South Goa'),
  ('Galgibaga', 'Canacona', 'South Goa'),

  -- Quepem (South Goa)
  ('Quepem Town', 'Quepem', 'South Goa'),
  ('Curchorem', 'Quepem', 'South Goa'),
  ('Chandor', 'Quepem', 'South Goa'),

  -- Sanguem (South Goa)
  ('Sanguem Town', 'Sanguem', 'South Goa'),
  ('Uguem', 'Sanguem', 'South Goa'),

  -- Dharbandora (South Goa)
  ('Dharbandora', 'Dharbandora', 'South Goa'),
  ('Mollem', 'Dharbandora', 'South Goa'),
  ('Collem', 'Dharbandora', 'South Goa')
ON CONFLICT (area_name, taluka) DO NOTHING;

