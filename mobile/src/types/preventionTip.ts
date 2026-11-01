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
