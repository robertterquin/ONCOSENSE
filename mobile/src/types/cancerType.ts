import { optionalString, requireString, stringArray, type Row } from './row';

export type CancerType = {
  id: string;
  name: string;
  description: string;
  iconName: string;
  symptoms: string[];
  riskFactors: string[];
  preventionTips: string[];
  screeningMethods: string[];
  earlyDetectionInfo: string;
  statistics: string | null;
};

export function cancerTypeFromRow(row: Row): CancerType {
  return {
    id: requireString(row, 'id'),
    name: requireString(row, 'name'),
    description: requireString(row, 'description'),
    iconName: requireString(row, 'icon_name'),
    symptoms: stringArray(row, 'symptoms'),
    riskFactors: stringArray(row, 'risk_factors'),
    preventionTips: stringArray(row, 'prevention_tips'),
    screeningMethods: stringArray(row, 'screening_methods'),
    earlyDetectionInfo: requireString(row, 'early_detection_info'),
    statistics: optionalString(row, 'statistics'),
  };
}
