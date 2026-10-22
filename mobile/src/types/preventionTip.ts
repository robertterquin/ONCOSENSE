import { parseOptionalDbTimestamp } from '@/lib/dates';

import { booleanOr, numberOr, optionalString, requireString, type Row } from './row';

export type PreventionTip = {
  id: string;
  iconName: string;
  title: string;
  description: string;
  category: string;
  detailedInfo: string | null;
  sourceName: string;
  sourceUrl: string;
  dateVerified: Date | null;
  displayOrder: number;
  isActive: boolean;
};

export function preventionTipFromRow(row: Row): PreventionTip {
  return {
    id: requireString(row, 'id'),
    iconName: requireString(row, 'icon_name'),
    title: requireString(row, 'title'),
    description: requireString(row, 'description'),
    category: requireString(row, 'category'),
    detailedInfo: optionalString(row, 'detailed_info'),
    sourceName: requireString(row, 'source_name'),
    sourceUrl: requireString(row, 'source_url'),
    dateVerified: parseOptionalDbTimestamp(row.date_verified),
    displayOrder: numberOr(row, 'display_order', 0),
    isActive: booleanOr(row, 'is_active', true),
  };
}
