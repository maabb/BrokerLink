/*
# Admin role, admin account, and seed company

1. Plain-English summary
   - Adds an ADMIN role alongside customer and provider.
   - Creates a ready-to-use admin account so the site owner can open the
     Admin Portal and see every user, company, request, deal and review.
   - Seeds one demo company, "Aliif Software" (tagline: "Idea to product."),
     owned by the admin account, so the marketplace is not empty on launch.

2. Modified tables
   - `profiles`: the `role` check now also allows 'admin'
     (customer | provider | admin). No existing rows are changed.

3. New data
   - Admin auth user: admin@brokerlink.com (password Admin123!), confirmed.
   - Profile row for the admin with role 'admin'.
   - Company "Aliif Software" in the Software Development category,
     owned by the admin account, with a short description and a starter
     products & services list.

4. Security
   - No new policies needed: profiles and companies are already publicly
     readable, and only the owner can modify the company. The admin portal
     reads the same public data but is gated in the app by the admin role.

5. Important notes
   - Idempotent: re-running inserts nothing new (fixed admin user id,
     ON CONFLICT DO NOTHING, existence checks before inserting the company).
   - Change the admin password from the account settings after first sign-in.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'provider', 'admin'));

DO $$
DECLARE
  admin_id uuid := '11111111-1111-4111-8111-111111111111';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change, email_change_token_new
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      'admin@brokerlink.com', crypt('Admin123!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}',
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      admin_id, admin_id,
      json_build_object('sub', admin_id::text, 'email', 'admin@brokerlink.com', 'email_verified', true),
      'email', admin_id::text, now(), now(), now()
    );
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (admin_id, 'admin@brokerlink.com', 'BrokerLink Admin', 'admin')
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE name = 'Aliif Software') THEN
    INSERT INTO public.companies (
      owner_id, name, description, category_id, num_partners, employees_count, products_services
    )
    SELECT
      admin_id,
      'Aliif Software',
      'Idea to product. We design, build and ship custom software — from first concept to a production-ready product.',
      c.id, 3, 12,
      ARRAY['Web applications', 'Mobile apps', 'Product design', 'MVP development']
    FROM public.categories c
    WHERE c.slug = 'software-development';
  END IF;
END $$;
