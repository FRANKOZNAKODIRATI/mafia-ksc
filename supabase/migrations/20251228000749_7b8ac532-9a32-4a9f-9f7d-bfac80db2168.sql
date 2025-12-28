-- Allow anyone to insert reviews (for admin panel without auth)
CREATE POLICY "Anyone can insert reviews"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update reviews (for admin panel without auth)
CREATE POLICY "Anyone can update reviews"
ON public.reviews
FOR UPDATE
USING (true);

-- Allow anyone to delete reviews (for admin panel without auth)
CREATE POLICY "Anyone can delete reviews"
ON public.reviews
FOR DELETE
USING (true);

-- Allow service role to view all reviews (for admin)
CREATE POLICY "Service role can view all reviews"
ON public.reviews
FOR SELECT
USING (true);