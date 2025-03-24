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
  ('EnzymeDigest Pro', 'Professional strength digestive enzymes', (SELECT id FROM categories WHERE name = 'Digestive Health'), 38.99, 34.99, 85, false, 'GutHealth', '1 capsule with meals', ARRAY['Mild bloating'], ARRAY['Amylase', 'Lipase', 'Protease'], 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500'),
  ('IBSRelief Plus', 'Advanced IBS symptom management', (SELECT id FROM categories WHERE name = 'Digestive Health'), 42.99, null, 70, false, 'DigestCare', '1 tablet twice daily', ARRAY['Mild cramping'], ARRAY['Peppermint Oil', 'Probiotics'], 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),

  -- Additional Heart & Blood Pressure Products
  ('BetaBlock Pro', 'Professional beta blocker medication', (SELECT id FROM categories WHERE name = 'Heart & Blood Pressure'), 78.99, 72.99, 40, true, 'HeartCare', '1 tablet daily', ARRAY['Fatigue', 'Cold hands'], ARRAY['Metoprolol Succinate'], 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=500'),
  ('StatinCare Plus', 'Advanced cholesterol management', (SELECT id FROM categories WHERE name = 'Heart & Blood Pressure'), 84.99, null, 35, true, 'CardioHealth', '1 tablet daily', ARRAY['Muscle pain'], ARRAY['Atorvastatin'], 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500'),

  -- Additional Diabetes Care Products
  ('InsulinSense Pro', 'Enhanced insulin sensitivity promoter', (SELECT id FROM categories WHERE name = 'Diabetes Care'), 96.99, 89.99, 30, true, 'DiabetesCare', '1 tablet daily', ARRAY['Stomach upset'], ARRAY['Rosiglitazone'], 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80&w=500'),
  ('GlucoseControl Max', 'Maximum strength glucose control', (SELECT id FROM categories WHERE name = 'Diabetes Care'), 92.99, null, 35, true, 'GlucoHealth', '1 tablet twice daily', ARRAY['Diarrhea'], ARRAY['Metformin HCl'], 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=500'),

  -- Additional Skin Care Products
  ('EczemaShield Advanced', 'Professional eczema treatment', (SELECT id FROM categories WHERE name = 'Skin Care'), 34.99, 31.99, 65, false, 'DermaCare', 'Apply twice daily', ARRAY['Mild burning'], ARRAY['Tacrolimus'], 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500'),
  ('AcneControl Ultra', 'Maximum strength acne treatment', (SELECT id FROM categories WHERE name = 'Skin Care'), 29.99, null, 80, false, 'SkinCare', 'Apply once daily', ARRAY['Dryness'], ARRAY['Adapalene'], 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),

  -- Additional First Aid Products
  ('BurnGuard Professional', 'Professional burn treatment', (SELECT id FROM categories WHERE name = 'First Aid'), 19.99, 17.99, 90, false, 'BurnCare', 'Apply as needed', ARRAY['Cooling sensation'], ARRAY['Silver Sulfadiazine', 'Aloe'], 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=500'),
  ('WoundSeal Pro', 'Advanced wound sealing powder', (SELECT id FROM categories WHERE name = 'First Aid'), 15.99, null, 100, false, 'WoundCare', 'Apply to wound', ARRAY['Stinging'], ARRAY['Potassium Ferrate'], 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500'),

  -- Additional Pain Relief Products
  ('MigraineCare Advanced', 'Professional migraine treatment', (SELECT id FROM categories WHERE name = 'Pain Relief'), 44.99, 39.99, 45, true, 'NeuroCare', '1 tablet at onset', ARRAY['Dizziness'], ARRAY['Rizatriptan'], 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80&w=500'),
  ('FibromyalgiaEase', 'Comprehensive fibromyalgia relief', (SELECT id FROM categories WHERE name = 'Pain Relief'), 48.99, null, 40, true, 'PainCare', '1 capsule twice daily', ARRAY['Drowsiness'], ARRAY['Duloxetine'], 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=500'),

  -- Additional Antibiotics
  ('QuinoFlex Pro', 'Advanced quinolone antibiotic', (SELECT id FROM categories WHERE name = 'Antibiotics'), 68.99, 62.99, 30, true, 'InfectShield', '1 tablet daily', ARRAY['Joint pain'], ARRAY['Levofloxacin'], 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500'),
  ('CephalexPro Plus', 'Enhanced cephalosporin antibiotic', (SELECT id FROM categories WHERE name = 'Antibiotics'), 54.99, null, 35, true, 'BacteriaCare', '1 capsule four times daily', ARRAY['Nausea'], ARRAY['Cefadroxil'], 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),

  -- Additional Vitamins & Supplements
  ('PregnaCare Complete', 'Comprehensive prenatal vitamin', (SELECT id FROM categories WHERE name = 'Vitamins & Supplements'), 32.99, 29.99, 120, false, 'VitaStrength', '1 tablet daily', ARRAY['Nausea'], ARRAY['Folic Acid', 'Iron', 'DHA'], 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=500'),
  ('JointHealth Pro', 'Advanced joint support formula', (SELECT id FROM categories WHERE name = 'Vitamins & Supplements'), 36.99, null, 100, false, 'JointCare', '2 capsules daily', ARRAY['Mild gas'], ARRAY['Glucosamine', 'Chondroitin', 'MSM'], 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500'),

  -- Additional Cold & Flu Products
  ('ImmuneBoost Max', 'Maximum strength immune support', (SELECT id FROM categories WHERE name = 'Cold & Flu'), 26.99, 23.99, 85, false, 'ImmuneCare', '1 packet daily', ARRAY['None'], ARRAY['Vitamin C', 'Zinc', 'Elderberry'], 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80&w=500'),
  ('SinusClear Ultra', 'Ultra-strength sinus relief', (SELECT id FROM categories WHERE name = 'Cold & Flu'), 22.99, null, 90, false, 'RespiCare', '2 sprays each nostril', ARRAY['Nasal irritation'], ARRAY['Oxymetazoline'], 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=500'),

  -- Additional Allergy Products
  ('AllergyBlock Pro', 'Professional allergy prevention', (SELECT id FROM categories WHERE name = 'Allergy'), 31.99, 28.99, 75, false, 'AllerCare', '1 tablet daily', ARRAY['Dry mouth'], ARRAY['Bilastine'], 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500'),
  ('NasalCare Plus', 'Advanced nasal congestion relief', (SELECT id FROM categories WHERE name = 'Allergy'), 27.99, null, 80, false, 'NasalHealth', '2 sprays per nostril', ARRAY['Sneezing'], ARRAY['Fluticasone'], 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500');