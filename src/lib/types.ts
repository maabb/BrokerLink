export type Role = 'customer' | 'provider' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  category_id: string | null;
  city: string;
  country: string;
  website: string;
  logo_url: string;
  num_partners: number;
  employees_count: number;
  products_services: string[];
  deal_count: number;
  avg_rating: number | null;
  review_count: number;
  created_at: string;
  category?: Pick<Category, 'name' | 'slug' | 'icon'> | null;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  category_id: string | null;
  budget: number | null;
  status: 'open' | 'closed';
  created_at: string;
  category?: Pick<Category, 'name' | 'slug' | 'icon'> | null;
}

export interface Proposal {
  id: string;
  request_id: string;
  company_id: string;
  provider_id: string;
  price: number | null;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  company?: Pick<Company, 'id' | 'name' | 'avg_rating' | 'review_count' | 'deal_count' | 'city' | 'country'> | null;
}

export interface Deal {
  id: string;
  request_id: string;
  proposal_id: string;
  company_id: string;
  customer_id: string;
  created_at: string;
  company?: Pick<Company, 'id' | 'name'> | null;
}

export interface Review {
  id: string;
  deal_id: string;
  company_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer?: { full_name: string } | null;
}
