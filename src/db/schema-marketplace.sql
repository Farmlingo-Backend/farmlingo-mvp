-- Migration: Create Marketplace and Orders tables
-- This migration adds the marketplace functionality for buying/selling agricultural products and course materials

-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  listing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(512) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  seller_id UUID NOT NULL,
  institution_id UUID, -- NULL for platform-wide listings
  category VARCHAR(128) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'deleted')),
  media_urls JSONB, -- Array of image/video URLs
  quantity INTEGER DEFAULT 1,
  location VARCHAR(256), -- Optional: physical location for pickup
  contact_info JSONB, -- Contact details (phone, email, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE SET NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  institution_id UUID, -- NULL for platform-wide orders
  quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(100),
  shipping_address JSONB,
  order_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(listing_id) ON DELETE CASCADE,
  FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE SET NULL
);

-- Create marketplace_reviews table
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  reviewer_id UUID NOT NULL, -- buyer or seller
  reviewee_id UUID NOT NULL, -- seller or buyer
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('buyer_to_seller', 'seller_to_buyer')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create marketplace_categories table
CREATE TABLE IF NOT EXISTS marketplace_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(128) NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (parent_category_id) REFERENCES marketplace_categories(category_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_institution_id ON marketplace_listings(institution_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_institution_id ON orders(institution_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON marketplace_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON marketplace_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON marketplace_reviews(order_id);

-- Insert default marketplace categories
INSERT INTO marketplace_categories (category_id, name, description, parent_category_id, is_active, created_at)
VALUES 
  (gen_random_uuid(), 'Agricultural Products', 'Fresh produce and agricultural goods', NULL, true, NOW()),
  (gen_random_uuid(), 'Livestock', 'Farm animals and livestock', NULL, true, NOW()),
  (gen_random_uuid(), 'Farming Equipment', 'Tools and equipment for farming', NULL, true, NOW()),
  (gen_random_uuid(), 'Educational Materials', 'Course materials and learning resources', NULL, true, NOW()),
  (gen_random_uuid(), 'Consulting Services', 'Agricultural consulting and services', NULL, true, NOW()),
  (gen_random_uuid(), 'Fruits', 'Fresh fruits and fruit products', (SELECT category_id FROM marketplace_categories WHERE name = 'Agricultural Products'), true, NOW()),
  (gen_random_uuid(), 'Vegetables', 'Fresh vegetables and vegetable products', (SELECT category_id FROM marketplace_categories WHERE name = 'Agricultural Products'), true, NOW()),
  (gen_random_uuid(), 'Grains', 'Cereals and grain products', (SELECT category_id FROM marketplace_categories WHERE name = 'Agricultural Products'), true, NOW()),
  (gen_random_uuid(), 'Cattle', 'Cows, bulls, and other cattle', (SELECT category_id FROM marketplace_categories WHERE name = 'Livestock'), true, NOW()),
  (gen_random_uuid(), 'Poultry', 'Chickens, ducks, and other poultry', (SELECT category_id FROM marketplace_categories WHERE name = 'Livestock'), true, NOW()),
  (gen_random_uuid(), 'Tools', 'Hand tools and small equipment', (SELECT category_id FROM marketplace_categories WHERE name = 'Farming Equipment'), true, NOW()),
  (gen_random_uuid(), 'Machinery', 'Large farming machinery and tractors', (SELECT category_id FROM marketplace_categories WHERE name = 'Farming Equipment'), true, NOW()),
  (gen_random_uuid(), 'Books', 'Agricultural books and publications', (SELECT category_id FROM marketplace_categories WHERE name = 'Educational Materials'), true, NOW()),
  (gen_random_uuid(), 'Online Courses', 'Digital courses and training materials', (SELECT category_id FROM marketplace_categories WHERE name = 'Educational Materials'), true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Add comments to document the tables
COMMENT ON TABLE marketplace_listings IS 'Listings for products and services available in the marketplace';
COMMENT ON TABLE orders IS 'Orders placed by users for marketplace listings';
COMMENT ON TABLE marketplace_reviews IS 'Reviews and ratings for marketplace transactions';
COMMENT ON TABLE marketplace_categories IS 'Categories for organizing marketplace listings';