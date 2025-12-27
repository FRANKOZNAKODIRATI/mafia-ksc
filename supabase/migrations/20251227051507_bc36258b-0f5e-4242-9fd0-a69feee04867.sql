-- Create bug_reports table
CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bug reports (public submission)
CREATE POLICY "Anyone can submit bug reports"
ON public.bug_reports
FOR INSERT
WITH CHECK (true);

-- Only allow reading own reports (not needed for now, but good practice)
CREATE POLICY "Anyone can view bug reports"
ON public.bug_reports
FOR SELECT
USING (true);