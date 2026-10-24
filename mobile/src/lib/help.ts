import type { AllResources } from '@/api/resources';
import type { Resource, ResourceType } from '@/types/resource';

// Help tab helpers (redesign Phase 5): the "Near" filter's regions and the sections.

export const REGIONS = [
  'Metro Manila',
  'Central Luzon',
  'Cebu',
  'Davao',
  'Nationwide',
  'Online',
] as const;

export type Region = (typeof REGIONS)[number];

/** Places in each region, lower case; a `location` matches when it names one of them. */
const PLACES: { region: Region; places: string[] }[] = [
  { region: 'Online', places: ['online'] },
  {
    region: 'Metro Manila',
    places: [
      'metro manila',
      'ncr',
      'manila',
      'quezon city',
      'makati',
      'pasig',
      'taguig',
      'mandaluyong',
      'san juan',
      'pasay',
      'parañaque',
      'paranaque',
      'las piñas',
      'las pinas',
      'muntinlupa',
      'marikina',
      'caloocan',
      'malabon',
      'navotas',
      'valenzuela',
    ],
  },
  {
    region: 'Central Luzon',
    places: [
      'central luzon',
      'pampanga',
      'angeles',
      'san fernando',
      'bulacan',
      'tarlac',
      'zambales',
      'bataan',
      'nueva ecija',
      'aurora',
      'olongapo',
    ],
  },
  { region: 'Cebu', places: ['cebu', 'mandaue', 'lapu-lapu'] },
  { region: 'Davao', places: ['davao'] },
  { region: 'Nationwide', places: ['philippines', 'nationwide'] },
];

/**
 * The region a resource's `location` is in, or null when it isn't one we know. Online
 * wins over a place ("Online & Local"), so it shows for everyone.
 */
export function regionFor(location: string | null): Region | null {
  const text = location?.trim().toLowerCase();
  if (!text) return null;
  return PLACES.find((entry) => entry.places.some((place) => text.includes(place)))?.region ?? null;
}

/**
 * Whether a resource shows for the chosen region. Nationwide and online resources show
 * everywhere; resources in an unknown place only show for "All of the Philippines".
 */
export function isNear(resource: Pick<Resource, 'location'>, region: Region | null): boolean {
  if (!region) return true;
  const own = regionFor(resource.location);
  return own === region || own === 'Nationwide' || own === 'Online';
}

export type HelpSection = {
  type: ResourceType;
  /** Where `useAllResources()` keeps this section's rows. */
  list: keyof AllResources;
  title: string;
  /** For opening Help at this section (`/help?section=screening`). */
  key: string;
  empty: string;
};

/** In order, with the `?section=` key each can be opened at. */
export const HELP_SECTIONS: HelpSection[] = [
  {
    type: 'hotline',
    list: 'hotlines',
    title: 'Hotlines',
    key: 'hotlines',
    empty: 'No hotlines here yet.',
  },
  {
    type: 'screening_center',
    list: 'screeningCenters',
    title: 'Screening centers',
    key: 'screening',
    empty: 'No screening centers listed near you yet.',
  },
  {
    type: 'financial_support',
    list: 'financialSupport',
    title: 'Help with costs',
    key: 'costs',
    empty: 'No financial help listed here yet.',
  },
  {
    type: 'support_group',
    list: 'supportGroups',
    title: 'Support groups',
    key: 'groups',
    empty: 'No support groups listed near you yet.',
  },
];

/** "Call Philippine Cancer Society, (02) 8508-7777" */
export function callLabel(resource: Pick<Resource, 'name' | 'phone'>): string {
  return `Call ${resource.name}, ${resource.phone ?? ''}`.replace(/, $/, '');
}
