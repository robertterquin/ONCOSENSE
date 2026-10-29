import { searchUniversal, SUGGESTED_SEARCHES, type SearchableData } from '../search';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';
import type { Question } from '@/types/question';
import type { Resource } from '@/types/resource';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

const mockCancer: CancerType = {
  id: 'breast-cancer',
  name: 'Breast Cancer',
  description: 'Abnormal cell growth in breast tissue',
  iconName: 'breast',
  symptoms: ['Lump in breast', 'Skin dimpling'],
  riskFactors: ['Family history', 'Age'],
  preventionTips: ['Regular screening', 'Healthy lifestyle'],
  screeningMethods: ['Mammogram', 'Clinical exam'],
  earlyDetectionInfo: 'Early detection increases survival rate',
  statistics: '1 in 8 women',
};

const mockGuide: SelfCheckGuide = {
  id: 'bse',
  title: 'Breast Self-Exam (BSE)',
  description: 'Monthly breast self-examination guide',
  cancerType: 'Breast Cancer',
  frequency: 'Monthly',
  ageRecommendation: '20+',
  steps: [{ step: 1, instruction: 'Look in mirror', detail: 'Check for changes' }],
  warningSigns: ['Nipple discharge', 'Inverted nipple'],
  whenToSeeDoctor: 'Consult doctor if lump is found',
  sourceName: 'WHO',
  sourceUrl: 'https://who.int',
  dateVerified: new Date('2025-01-01'),
  displayOrder: 1,
  isActive: true,
};

const mockTip: PreventionTip = {
  id: 'quit-smoking',
  iconName: 'cigarette-off',
  title: 'Quit Smoking',
  description: 'Tobacco is the leading cause of lung and other cancers',
  category: 'Lifestyle',
  detailedInfo: 'Smoking cessation significantly cuts cancer risk within years',
  sourceName: 'CDC',
  sourceUrl: 'https://cdc.gov',
  dateVerified: new Date('2025-01-01'),
  displayOrder: 1,
  isActive: true,
};

const mockResource: Resource = {
  id: 'hope-center',
  name: 'Hope Screening Center',
  type: 'screening_center',
  description: 'Low-cost mammograms and oncology checkups',
  phone: '02-8999-0000',
  location: 'Manila, Philippines',
  address: '123 Health Ave, Manila',
  website: 'https://hope.org',
  email: 'info@hope.org',
  isVerified: true,
  isActive: true,
  createdAt: new Date('2025-01-01'),
};

const mockQuestion: Question = {
  id: 'q-fatigue',
  title: 'How do you cope with chemotherapy fatigue?',
  content: 'Feeling exhausted after my second chemo session. Any tips for nutrition or mild exercise?',
  category: 'Treatment',
  userId: 'user-1',
  userName: 'Elena',
  profilePictureUrl: null,
  isAnonymous: false,
  upvotes: 14,
  answerCount: 5,
  createdAt: new Date('2025-02-01'),
  updatedAt: new Date('2025-02-02'),
  isResolved: false,
  tags: ['chemotherapy', 'fatigue', 'wellness'],
};

const mockData: SearchableData = {
  cancers: [mockCancer],
  guides: [mockGuide],
  tips: [mockTip],
  resources: [mockResource],
  questions: [mockQuestion],
};

describe('searchUniversal', () => {
  it('returns empty results for empty or whitespace query', () => {
    const resEmpty = searchUniversal(mockData, '');
    expect(resEmpty.totalCount).toBe(0);
    expect(resEmpty.cancers).toHaveLength(0);

    const resSpace = searchUniversal(mockData, '   ');
    expect(resSpace.totalCount).toBe(0);
  });

  it('matches cancer types by name, description, symptoms, or risk factors', () => {
    const resByName = searchUniversal(mockData, 'breast');
    expect(resByName.cancers).toHaveLength(1);
    expect(resByName.cancers[0].id).toBe('breast-cancer');

    const resBySymptom = searchUniversal(mockData, 'dimpling');
    expect(resBySymptom.cancers).toHaveLength(1);

    const resByRisk = searchUniversal(mockData, 'family history');
    expect(resByRisk.cancers).toHaveLength(1);
  });

  it('matches self-check guides by title, cancer type, description, or warning signs', () => {
    const resByTitle = searchUniversal(mockData, 'Self-Exam');
    expect(resByTitle.guides).toHaveLength(1);
    expect(resByTitle.guides[0].id).toBe('bse');

    const resByWarning = searchUniversal(mockData, 'discharge');
    expect(resByWarning.guides).toHaveLength(1);
  });

  it('matches prevention habits and tips by title, description, category, or source', () => {
    const resByTitle = searchUniversal(mockData, 'smoking');
    expect(resByTitle.tips).toHaveLength(1);
    expect(resByTitle.tips[0].id).toBe('quit-smoking');

    const resByDetail = searchUniversal(mockData, 'cessation');
    expect(resByDetail.tips).toHaveLength(1);
  });

  it('matches resources by name, location, address, or description', () => {
    const resByName = searchUniversal(mockData, 'Hope');
    expect(resByName.resources).toHaveLength(1);
    expect(resByName.resources[0].id).toBe('hope-center');

    const resByLoc = searchUniversal(mockData, 'Manila');
    expect(resByLoc.resources).toHaveLength(1);
  });

  it('matches community questions by title, content, or tags', () => {
    const resByTitle = searchUniversal(mockData, 'fatigue');
    expect(resByTitle.questions).toHaveLength(1);
    expect(resByTitle.questions[0].id).toBe('q-fatigue');

    const resByTag = searchUniversal(mockData, 'chemotherapy');
    expect(resByTag.questions).toHaveLength(1);
  });

  it('aggregates totalCount across multiple matching categories', () => {
    // "breast" matches cancer and guide
    const res = searchUniversal(mockData, 'breast');
    expect(res.cancers).toHaveLength(1);
    expect(res.guides).toHaveLength(1);
    expect(res.totalCount).toBe(2);
  });

  it('has non-empty suggested searches', () => {
    expect(SUGGESTED_SEARCHES.length).toBeGreaterThan(0);
    expect(SUGGESTED_SEARCHES).toContain('Breast self-exam');
  });
});
