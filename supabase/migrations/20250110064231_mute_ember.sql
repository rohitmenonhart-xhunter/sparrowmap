/*
  # Create Sparrows Table

  1. New Tables
    - `sparrows`
      - `id` (uuid, primary key)
      - `latitude` (double precision)
      - `longitude` (double precision)
      - `count` (integer)
      - `gender` (text)
      - `nest` (boolean)
      - `juveniles` (boolean)
      - `image_url` (text)
      - `user_email` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `sparrows` table
    - Add policies for:
      - Anyone can read sparrow data
      - Only authenticated users can insert sparrow data
      - Users can only update/delete their own records
*/

CREATE TABLE sparrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  count integer NOT NULL DEFAULT 1,
  gender text NOT NULL,
  nest boolean NOT NULL DEFAULT false,
  juveniles boolean NOT NULL DEFAULT false,
  image_url text,
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sparrows ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read sparrow data
CREATE POLICY "Anyone can read sparrow data"
  ON sparrows
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can insert sparrow data
CREATE POLICY "Authenticated users can insert sparrow data"
  ON sparrows
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can only update their own records
CREATE POLICY "Users can update own records"
  ON sparrows
  FOR UPDATE
  TO authenticated
  USING (auth.email() = user_email);

-- Users can only delete their own records
CREATE POLICY "Users can delete own records"
  ON sparrows
  FOR DELETE
  TO authenticated
  USING (auth.email() = user_email);