
-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  insurance_company TEXT,
  insurance_policy_number TEXT,
  insurance_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update vehicles table to link with clients
ALTER TABLE public.cars 
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN api_fetched_data JSONB,
ADD COLUMN fetch_date TIMESTAMP WITH TIME ZONE;

-- Update evaluations table with enhanced fields
ALTER TABLE public.evaluations 
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN location_latitude DECIMAL(10,8),
ADD COLUMN location_longitude DECIMAL(11,8),
ADD COLUMN location_address TEXT,
ADD COLUMN ai_damage_analysis JSONB,
ADD COLUMN pdf_invoice_url TEXT,
ADD COLUMN total_cost DECIMAL(10,2),
ADD COLUMN submission_status TEXT DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'approved', 'rejected'));

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients table
CREATE POLICY "Admins can manage all clients" 
  ON public.clients 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their clients" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add indexes for better performance
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_cars_client_id ON public.cars(client_id);
CREATE INDEX idx_evaluations_client_id ON public.evaluations(client_id);
CREATE INDEX idx_evaluations_location ON public.evaluations(location_latitude, location_longitude);
CREATE INDEX idx_evaluations_submission_status ON public.evaluations(submission_status);
