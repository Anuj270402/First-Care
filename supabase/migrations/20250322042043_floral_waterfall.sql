/*
  # Add More Medicines Data

  1. Sample Data
    - Additional medicines across different categories
    - Realistic pricing and descriptions
    - Mix of prescription and non-prescription medicines
    - Complete product information
*/

-- Insert additional medicines
INSERT INTO medicines (
  name,
  description,
  category_id,
  price,
  discount_price,
  stock_quantity,
  requires_prescription,
  manufacturer,
  dosage,
  side_effects,
  active_ingredients,
  image_url
) VALUES
  -- Additional Digestive Health Products
  ('ProBiotic Ultra', 'Advanced probiotic complex', (SELECT id FROM categories WHERE name = 'Digestive Health'), 34.99, 31.99, 120, false, 'GutHealth', '1 capsule daily', ARRAY['Mild bloating'], ARRAY['Multiple Probiotic Strains'], 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500'),
  ('GastroCalm Plus', 'Fast-acting stomach relief', (SELECT id FROM categories WHERE name = 'Digestive Health'), 19.99, null, 90, false, 'DigestCare', '1-2 tablets as needed', ARRAY['Constipation'], ARRAY['Calcium Carbonate', 'Magnesium'], 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),

  -- Additional Heart & Blood Pressure Products
  ('HeartRhythm Pro', 'Professional heart rhythm management', (SELECT id FROM categories WHERE name = 'Heart & Blood Pressure'), 89.99, 82.99, 40, true, 'CardioHealth', '1 tablet daily', ARRAY['Dizziness', 'Fatigue'], ARRAY['Amiodarone'], 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=500'),
  ('VasoDilate Plus', 'Enhanced blood vessel health', (SELECT id FROM categories WHERE name = 'Heart & Blood Pressure'), 72.99, null, 45, true, 'VascularCare', '1 tablet twice daily', ARRAY['Headache'], ARRAY['Amlodipine'], 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500'),

  -- Additional Diabetes Care Products
  ('GlucoBalance Ultra', 'Long-acting diabetes control', (SELECT id FROM categories WHERE name = 'Diabetes Care'), 94.99, 89.99, 35, true, 'DiabetesCare', '1 tablet daily', ARRAY['Low blood sugar'], ARRAY['Glimepiride'], 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80&w=500'),
  ('DiabetesControl Pro', 'Complete diabetes management', (SELECT id FROM categories WHERE name = 'Diabetes Care'), 86.99, null, 40, true, 'GlucoHealth', '1 tablet with meals', ARRAY['Nausea'], ARRAY['Sitagliptin'], 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=500'),

  -- Additional Skin Care Products
  ('DermaHeal Advanced', 'Professional skin repair treatment', (SELECT id FROM categories WHERE name = 'Skin Care'), 28.99, 25.99, 75, false, 'SkinCare', 'Apply twice daily', ARRAY['Mild irritation'], ARRAY['Ceramides', 'Hyaluronic Acid'], 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500'),
  ('PsoriClear Plus', 'Advanced psoriasis treatment', (SELECT id FROM categories WHERE name = 'Skin Care'), 32.99, null, 60, false, 'DermaCare', 'Apply as directed', ARRAY['Redness'], ARRAY['Calcipotriene'], 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),

  -- Additional First Aid Products
  ('BandageProPlus', 'Advanced wound dressing', (SELECT id FROM categories WHERE name = 'First Aid'), 16.99, 14.99, 150, false, 'WoundCare', 'Apply as needed', ARRAY['None'], ARRAY['Hydrocolloid'], 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=500'),
  ('AntisepticMax', 'Maximum strength antiseptic', (SELECT id FROM categories WHERE name = 'First Aid'), 12.99, null, 120, false, 'FirstAid Pro', 'Apply to affected area', ARRAY['Temporary stinging'], ARRAY['Benzalkonium Chloride'], 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500'),

  -- More Pain Relief Products
  ('ArthritisEase Pro', 'Professional arthritis relief', (SELECT id FROM categories WHERE name = 'Pain Relief'), 36.99, 33.99, 65, false, 'JointCare', '2 tablets daily', ARRAY['Stomach upset'], ARRAY['Glucosamine', 'Chondroitin'], 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80&w=500'),
  ('NeuropathyRelief Plus', 'Advanced nerve pain treatment', (SELECT id FROM categories WHERE name = 'Pain Relief'), 42.99, null, 50, true, 'NerveCare', '1 capsule twice daily', ARRAY['Drowsiness'], ARRAY['Gabapentin'], 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=500'),

  -- More Antibiotics
  ('DoxyCare Pro', 'Broad spectrum antibiotic', (SELECT id FROM categories WHERE name = 'Antibiotics'), 58.99, 54.99, 35, true, 'InfectShield', '1 capsule twice daily', ARRAY['Sun sensitivity', 'Nausea'], ARRAY['Doxycycline'], 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500'),
  ('ClarithroMax Plus', 'Enhanced respiratory infection treatment', (SELECT id FROM categories WHERE name = 'Antibiotics'), 62.99, null, 30, true, 'BacteriaCare', '1 tablet twice daily', ARRAY['Taste changes'], ARRAY['Clarithromycin'], 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),

  -- More Vitamins & Supplements
  ('IronBoost Complex', 'Complete iron supplement', (SELECT id FROM categories WHERE name = 'Vitamins & Supplements'), 26.99, 23.99, 140, false, 'VitaStrength', '1 tablet daily', ARRAY['Constipation'], ARRAY['Iron', 'Vitamin C', 'Folic Acid'], 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=500'),
  ('CalciumPlus D3', 'Advanced bone health support', (SELECT id FROM categories WHERE name = 'Vitamins & Supplements'), 24.99, null, 160, false, 'BoneHealth', '2 tablets daily', ARRAY['Mild nausea'], ARRAY['Calcium', 'Vitamin D3', 'Vitamin K2'], 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500'),

  -- More Cold & Flu Products
  ('ChestClear Ultra', 'Maximum strength chest congestion relief', (SELECT id FROM categories WHERE name = 'Cold & Flu'), 23.99, 21.99, 80, false, 'RespiCare', '10ml every 4 hours', ARRAY['Drowsiness'], ARRAY['Guaifenesin', 'Dextromethorphan'], 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80&w=500'),
  ('FeverReduce Plus', 'Advanced fever reduction', (SELECT id FROM categories WHERE name = 'Cold & Flu'), 18.99, null, 95, false, 'FeverCare', '1-2 tablets every 6 hours', ARRAY['Mild stomach upset'], ARRAY['Acetaminophen'], 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=500'),

  -- More Allergy Products
  ('HayFever Relief', 'Complete seasonal allergy relief', (SELECT id FROM categories WHERE name = 'Allergy'), 29.99, 26.99, 100, false, 'AllerCare', '1 tablet daily', ARRAY['Dry mouth'], ARRAY['Desloratadine'], 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500'),
  ('EyeAllergy Drops', 'Professional strength eye allergy relief', (SELECT id FROM categories WHERE name = 'Allergy'), 21.99, null, 70, false, 'EyeCare', '1-2 drops as needed', ARRAY['Temporary burning'], ARRAY['Ketotifen'], 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500');