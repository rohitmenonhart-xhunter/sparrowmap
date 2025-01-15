-- Add status column to sparrows table
ALTER TABLE sparrows ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Update existing records to be approved (since they were created before the approval system)
UPDATE sparrows SET status = 'approved' WHERE status = 'pending'; 