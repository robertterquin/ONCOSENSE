import { parseOptionalDbTimestamp } from '@/lib/dates';

import { booleanOr, optionalString, stringOr, type Row } from './row';

export type ResourceType = 'hotline' | 'screening_center' | 'financial_support' | 'support_group';

export type Resource = {
  id: string;
  name: string;
 
  type: string;
  description: string;
  phone: string | null;
  location: string | null;
  address: string | null;
  website: string | null;
  email: string | null;
 
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
};

export function resourceFromRow(row: Row): Resource {
  return {
    id: stringOr(row, 'id', ''),
    name: stringOr(row, 'name', ''),
    type: stringOr(row, 'type', ''),
    description: stringOr(row, 'description', ''),
    phone: optionalString(row, 'phone'),
    location: optionalString(row, 'location'),
    address: optionalString(row, 'address'),
    website: optionalString(row, 'website'),
    email: optionalString(row, 'email'),
    isVerified: booleanOr(row, 'is_verified', false),
    isActive: booleanOr(row, 'is_active', true),
    createdAt: parseOptionalDbTimestamp(row.created_at) ?? new Date(),
  };
}
