-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  image_url TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.reviews
FOR SELECT
USING (is_approved = true);

-- Insert MarkoKofs review as approved
INSERT INTO public.reviews (name, text, image_url, rating, is_approved)
VALUES ('MarkoKofs', 'Pa igrica je dobra, a igrica ti je više onak aplikaciski kao board games. Super je! Neznam točno kako se igra kužiš, ali vjerujem da će biti onak fora. Samo trebate nastavit', '/markokofs-profile.webp', 5, true);