
-- Create cars table for vehicle management
CREATE TABLE public.cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vin TEXT UNIQUE,
  license_plate TEXT,
  color TEXT,
  mileage INTEGER,
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evaluations table for damage assessments
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  damage_description TEXT,
  damage_severity TEXT CHECK (damage_severity IN ('léger', 'modéré', 'grave', 'total')),
  estimated_cost DECIMAL(10,2),
  repair_time_days INTEGER,
  photos_urls TEXT[],
  status TEXT DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'complété', 'approuvé', 'rejeté')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create other_data table for miscellaneous system data
CREATE TABLE public.other_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for cars table
CREATE POLICY "Admins can manage all cars" 
  ON public.cars 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view cars" 
  ON public.cars 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- RLS policies for evaluations table
CREATE POLICY "Admins can manage all evaluations" 
  ON public.evaluations 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their evaluations" 
  ON public.evaluations 
  FOR SELECT 
  USING (auth.uid() = evaluator_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can create evaluations" 
  ON public.evaluations 
  FOR INSERT 
  WITH CHECK (auth.uid() = evaluator_id);

-- RLS policies for other_data table
CREATE POLICY "Admins can manage other_data" 
  ON public.other_data 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active other_data" 
  ON public.other_data 
  FOR SELECT 
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- Add indexes for better performance
CREATE INDEX idx_cars_make_model ON public.cars(make, model);
CREATE INDEX idx_evaluations_car_id ON public.evaluations(car_id);
CREATE INDEX idx_evaluations_evaluator_id ON public.evaluations(evaluator_id);
CREATE INDEX idx_evaluations_status ON public.evaluations(status);
CREATE INDEX idx_other_data_category ON public.other_data(category);
