import { supabase } from '@/lib/supabase';
import { resourceFromRow, type Resource, type ResourceType } from '@/types/resource';

import { check, ilikeValue } from './errors';

// Port of lib/services/resources_service.dart. Like the Flutter app, a built-in list
// is returned if the `resources` table can't be read.

function verifiedResources() {
  return supabase.from('resources').select().eq('is_verified', true).eq('is_active', true);
}

export async function fetchAllResources(): Promise<Resource[]> {
  try {
    const { data, error } = await verifiedResources().order('name');
    check(error, 'Failed to fetch resources');
    return (data ?? []).map(resourceFromRow);
  } catch (error) {
    console.warn(error);
    return fallbackResources();
  }
}

export async function fetchResourcesByType(type: ResourceType): Promise<Resource[]> {
  try {
    const { data, error } = await verifiedResources().eq('type', type).order('name');
    check(error, 'Failed to fetch resources');
    return (data ?? []).map(resourceFromRow);
  } catch (error) {
    console.warn(error);
    return fallbackResources().filter((resource) => resource.type === type);
  }
}

export async function searchResources(query: string): Promise<Resource[]> {
  try {
    const value = ilikeValue(query);
    const { data, error } = await verifiedResources()
      .or(`name.ilike.${value},description.ilike.${value}`)
      .order('name');
    check(error, 'Failed to search resources');
    return (data ?? []).map(resourceFromRow);
  } catch (error) {
    console.warn(error);
    const lower = query.toLowerCase();
    return fallbackResources().filter(
      (resource) =>
        resource.name.toLowerCase().includes(lower) ||
        resource.description.toLowerCase().includes(lower),
    );
  }
}

export type AllResources = {
  hotlines: Resource[];
  screeningCenters: Resource[];
  financialSupport: Resource[];
  supportGroups: Resource[];
};

export async function fetchResourcesByCategory(): Promise<AllResources> {
  const [hotlines, screeningCenters, financialSupport, supportGroups] = await Promise.all([
    fetchResourcesByType('hotline'),
    fetchResourcesByType('screening_center'),
    fetchResourcesByType('financial_support'),
    fetchResourcesByType('support_group'),
  ]);
  return { hotlines, screeningCenters, financialSupport, supportGroups };
}

function fallbackResources(): Resource[] {
  const createdAt = new Date();
  const base = {
    location: null,
    address: null,
    website: null,
    email: null,
    isVerified: true,
    isActive: true,
    createdAt,
  };
  const items: [string, string, ResourceType, string, string, string][] = [
    [
      '1',
      'Department of Health',
      'hotline',
      'National health hotline for health concerns and emergencies',
      '1555',
      'Philippines',
    ],
    [
      '2',
      'Philippine Cancer Society',
      'hotline',
      'Cancer support, information, and counseling hotline',
      '(02) 8508-7777',
      'Metro Manila',
    ],
    [
      '3',
      'Philippine Red Cross',
      'hotline',
      'Emergency medical services and blood donation',
      '143',
      'Philippines',
    ],
    [
      '4',
      'Philippine General Hospital',
      'screening_center',
      'Cancer screening and treatment facility',
      '(02) 8554-8400',
      'Manila',
    ],
    [
      '5',
      'Philippine Heart Center',
      'screening_center',
      'Comprehensive health screening including cancer detection',
      '(02) 8925-2401',
      'Quezon City',
    ],
    [
      '6',
      'PhilHealth',
      'financial_support',
      'Government health insurance coverage for cancer treatment',
      '(02) 8441-7442',
      'Philippines',
    ],
    [
      '7',
      'PCSO Medical Assistance',
      'financial_support',
      'Financial aid for medicines, chemotherapy, and hospital bills',
      '(02) 8733-8384',
      'Philippines',
    ],
    [
      '8',
      'Cancer Warriors Foundation',
      'support_group',
      'Peer support for cancer patients and survivors',
      '(02) 8705-2110',
      'Metro Manila',
    ],
    [
      '9',
      'ICanServe Foundation',
      'support_group',
      'Breast cancer support community and education',
      '(02) 8820-6363',
      'Online & Local',
    ],
  ];
  return items.map(([id, name, type, description, phone, location]) => ({
    ...base,
    id,
    name,
    type,
    description,
    phone,
    location,
  }));
}
