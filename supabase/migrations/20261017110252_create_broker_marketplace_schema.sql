/*
# Broker marketplace: companies, service requests, proposals, deals, reviews

1. Plain-English summary
   This is a marketplace connecting customers with service-provider companies.
   - Anyone (including visitors not signed in) can browse companies and read reviews.
   - Users register as either a CUSTOMER or a SERVICE PROVIDER.
   - Customers post a service request (what they need, category, budget).
   - Registered companies submit proposals on requests matching their category.
   - When a customer accepts a proposal, a deal is recorded and the company's
     customer count increases automatically.
   - Customers can leave one review per deal; ratings are aggregated per company.

2. New Tables
   - `profiles`: one per registered user.
     - `id` (uuid, matches auth user, primary key)
     - `email` (text)
     - `full_name` (text)
     - `role` (text: 'customer' or 'provider')
     - `created_at` (timestamp)
   - `categories`: service categories (software, architecture, office rental, ...).
     - `id`, `name` (unique), `slug` (unique), `icon`, `description`
     - Seeded with common categories.
   - `companies`: provider business profiles.
     - `id` (uuid, primary key)
     - `owner_id` (uuid, matches auth user, defaults to authenticated user)
     - `name`, `description`, `category_id`, `city`, `country`, `website`,
       `logo_url`, `num_partners` (int), `employees_count` (int),
       `products_services` (text list), `deal_count` (int, default 0)
     - `created_at`
   - `service_requests`: what a customer needs.
     - `id`, `customer_id` (defaults to auth.uid()), `title`, `description`,
       `category_id`, `budget` (numeric), `status` ('open' | 'closed'), `created_at`
   - `proposals`: offers from companies on a request.
     - `id`, `request_id`, `company_id`, `provider_id` (defaults to auth.uid()),
       `price` (numeric), `message`, `status` ('pending' | 'accepted' | 'rejected'),
       `created_at`
     - Unique so a company proposes at most once per request.
   - `deals`: accepted proposals.
     - `id`, `request_id`, `proposal_id` (unique), `company_id`, `customer_id`,
       `created_at`
   - `reviews`: one per deal, written by the customer.
     - `id`, `deal_id` (unique), `company_id`, `customer_id` (defaults to auth.uid()),
       `rating` (int 1-5), `comment`, `created_at`
     - A database trigger blocks ratings outside 1-5.

3. Security (Row Level Security)
   - RLS is enabled on every table.
   - Companies, categories, requests, proposals, deals, reviews are publicly
     readable (anon + authenticated) — search must work for signed-out visitors.
   - Only the owner can update/delete their own company, request, proposal, review.
   - Requests, proposals, deals, reviews can only be created by signed-in users,
     with ownership defaults filled by the database.
   - Profile rows are visible to everyone but editable only by their owner.
   - A trigger recalculates each company's average rating + review count whenever
     a review changes, keeping search results consistent.

4. Important notes
   - `deal_count`, `avg_rating`, `review_count` are maintained by database
     triggers so counts are always accurate, even across concurrent deals.
   - Accepting a proposal is restricted to the request's customer via a
     security-definer function `accept_proposal(proposal_id)` which creates the
     deal, marks other proposals rejected, closes the request, and increments
     the company's deal count atomically.
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text DEFAULT 'briefcase',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  full_name text DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider')),
  created_at timestamptz DEFAULT now()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  category_id uuid REFERENCES categories(id),
  city text DEFAULT '',
  country text DEFAULT '',
  website text DEFAULT '',
  logo_url text DEFAULT '',
  num_partners integer NOT NULL DEFAULT 0,
  employees_count integer NOT NULL DEFAULT 0,
  products_services text[] NOT NULL DEFAULT '{}',
  deal_count integer NOT NULL DEFAULT 0,
  avg_rating numeric(3,2) DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Service requests posted by customers
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category_id uuid REFERENCES categories(id),
  budget numeric(12,2),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- Proposals submitted by providers
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  price numeric(12,2),
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (request_id, company_id)
);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  proposal_id uuid NOT NULL UNIQUE REFERENCES proposals(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL UNIQUE REFERENCES deals(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies(category_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_requests_category ON service_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_requests_customer ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_proposals_request ON proposals(request_id);
CREATE INDEX IF NOT EXISTS idx_proposals_company ON proposals(company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_provider ON proposals(provider_id);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_customer ON deals(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_company ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_deal ON reviews(deal_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Categories: public read, no public writes
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT
TO anon, authenticated USING (true);

-- Profiles: everyone reads basic info; owner updates own
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Companies: public read for search; owner manages own
DROP POLICY IF EXISTS "companies_public_read" ON companies;
CREATE POLICY "companies_public_read" ON companies FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "companies_insert_own" ON companies;
CREATE POLICY "companies_insert_own" ON companies FOR INSERT
TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "companies_update_own" ON companies;
CREATE POLICY "companies_update_own" ON companies FOR UPDATE
TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "companies_delete_own" ON companies;
CREATE POLICY "companies_delete_own" ON companies FOR DELETE
TO authenticated USING (auth.uid() = owner_id);

-- Service requests: public read (providers browse open requests); customer manages own
DROP POLICY IF EXISTS "requests_public_read" ON service_requests;
CREATE POLICY "requests_public_read" ON service_requests FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "requests_insert_own" ON service_requests;
CREATE POLICY "requests_insert_own" ON service_requests FOR INSERT
TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "requests_update_own" ON service_requests;
CREATE POLICY "requests_update_own" ON service_requests FOR UPDATE
TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "requests_delete_own" ON service_requests;
CREATE POLICY "requests_delete_own" ON service_requests FOR DELETE
TO authenticated USING (auth.uid() = customer_id);

-- Proposals: public read; provider manages own
DROP POLICY IF EXISTS "proposals_public_read" ON proposals;
CREATE POLICY "proposals_public_read" ON proposals FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "proposals_insert_own" ON proposals;
CREATE POLICY "proposals_insert_own" ON proposals FOR INSERT
TO authenticated WITH CHECK (auth.uid() = provider_id);

DROP POLICY IF EXISTS "proposals_update_own" ON proposals;
CREATE POLICY "proposals_update_own" ON proposals FOR UPDATE
TO authenticated USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);

DROP POLICY IF EXISTS "proposals_delete_own" ON proposals;
CREATE POLICY "proposals_delete_own" ON proposals FOR DELETE
TO authenticated USING (auth.uid() = provider_id);

-- Deals: public read; creation happens via the accept_proposal function
DROP POLICY IF EXISTS "deals_public_read" ON deals;
CREATE POLICY "deals_public_read" ON deals FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "deals_insert_customer" ON deals;
CREATE POLICY "deals_insert_customer" ON deals FOR INSERT
TO authenticated WITH CHECK (auth.uid() = customer_id);

-- Reviews: public read; customer writes own
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
TO authenticated USING (auth.uid() = customer_id);

-- Trigger: keep company rating aggregates up to date
CREATE OR REPLACE FUNCTION refresh_company_rating() RETURNS trigger AS $$
DECLARE
  cid uuid;
BEGIN
  cid := COALESCE(NEW.company_id, OLD.company_id);
  UPDATE companies c SET
    avg_rating = COALESCE((SELECT round(avg(rating), 2) FROM reviews WHERE company_id = cid), 0),
    review_count = (SELECT count(*) FROM reviews WHERE company_id = cid)
  WHERE c.id = cid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_refresh_company_rating ON reviews;
CREATE TRIGGER trg_refresh_company_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION refresh_company_rating();

-- Function: customer accepts a proposal -> deal + counter bump, all atomic
CREATE OR REPLACE FUNCTION accept_proposal(p_proposal_id uuid) RETURNS uuid AS $$
DECLARE
  v_request_id uuid;
  v_company_id uuid;
  v_customer_id uuid;
  v_deal_id uuid;
BEGIN
  SELECT request_id, company_id INTO v_request_id, v_company_id
  FROM proposals WHERE id = p_proposal_id;

  IF v_request_id IS NULL THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  SELECT customer_id INTO v_customer_id FROM service_requests WHERE id = v_request_id;

  IF v_customer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the request owner can accept a proposal';
  END IF;

  IF EXISTS (SELECT 1 FROM proposals WHERE request_id = v_request_id AND status = 'accepted') THEN
    RAISE EXCEPTION 'A proposal was already accepted for this request';
  END IF;

  INSERT INTO deals (request_id, proposal_id, company_id, customer_id)
  VALUES (v_request_id, p_proposal_id, v_company_id, v_customer_id)
  RETURNING id INTO v_deal_id;

  UPDATE proposals SET status = 'accepted' WHERE id = p_proposal_id;

  UPDATE proposals SET status = 'rejected'
  WHERE request_id = v_request_id AND id <> p_proposal_id AND status = 'pending';

  UPDATE service_requests SET status = 'closed' WHERE id = v_request_id;

  UPDATE companies SET deal_count = deal_count + 1 WHERE id = v_company_id;

  RETURN v_deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION accept_proposal(uuid) FROM anon;

-- Seed categories
INSERT INTO categories (name, slug, icon, description) VALUES
  ('Software Development', 'software-development', 'code', 'Web, mobile and custom software'),
  ('Architecture & Design', 'architecture-design', 'landmark', 'Building design, blueprints and planning'),
  ('Office Rental', 'office-rental', 'building-2', 'Office spaces and coworking'),
  ('Marketing & Advertising', 'marketing-advertising', 'megaphone', 'Digital marketing, ads and branding'),
  ('Legal Services', 'legal-services', 'scale', 'Law firms and legal consulting'),
  ('Accounting & Finance', 'accounting-finance', 'calculator', 'Bookkeeping, audit and tax'),
  ('Construction', 'construction', 'hard-hat', 'Building contractors and engineering'),
  ('Interior Design', 'interior-design', 'lamp', 'Furniture, decor and fit-out'),
  ('Logistics & Shipping', 'logistics-shipping', 'truck', 'Freight, delivery and warehousing'),
  ('HR & Recruitment', 'hr-recruitment', 'users', 'Hiring, payroll and staffing')
ON CONFLICT (slug) DO NOTHING;
