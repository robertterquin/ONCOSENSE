import { answerDisplayName, answerFromRow } from '@/types/answer';
import { journeyEntryFromRow, journeyEntryToRow } from '@/types/journeyEntry';
import { milestoneFromRow } from '@/types/milestone';
import { questionDisplayName, questionFromRow } from '@/types/question';
import { resourceFromRow } from '@/types/resource';
import { selfCheckGuideFromRow } from '@/types/selfCheckGuide';
import { treatmentFromRow, treatmentProgress, treatmentToRow } from '@/types/treatment';

// Sample rows shaped like the Supabase responses.

const questionRow = {
  id: 'q1',
  title: 'How do I prepare for chemo?',
  content: 'Any tips?',
  category: 'Lifestyle',
  user_id: '1234567890abcdef',
  user_name: null,
  profile_picture_url: null,
  is_anonymous: false,
  upvotes: 3,
  answer_count: null,
  created_at: '2026-10-20T09:00:00+00:00',
  updated_at: '2026-10-20T09:00:00+00:00',
  is_resolved: false,
  tags: null,
};

describe('questionFromRow', () => {
  it('maps columns and applies Flutter defaults', () => {
    const question = questionFromRow(questionRow);
    expect(question).toMatchObject({ id: 'q1', upvotes: 3, answerCount: 0, tags: [] });
    expect(question.createdAt.getHours()).toBe(9);
  });

  it('builds display names', () => {
    expect(questionDisplayName(questionFromRow(questionRow))).toBe('User 12345678');
    expect(questionDisplayName(questionFromRow({ ...questionRow, user_name: 'Rosa' }))).toBe(
      'Rosa',
    );
    // The database hides the author of other people's anonymous questions.
    const anonymous = questionFromRow({ ...questionRow, is_anonymous: true, user_id: null });
    expect(anonymous.userId).toBe('');
    expect(questionDisplayName(anonymous)).toBe('Anonymous');
  });

  it('throws when a required column is missing', () => {
    expect(() => questionFromRow({ ...questionRow, title: undefined })).toThrow('title');
  });
});

describe('answerFromRow', () => {
  it('maps columns and display name', () => {
    const answer = answerFromRow({
      id: 'a1',
      question_id: 'q1',
      content: 'Rest well',
      user_id: 'u1',
      user_name: 'Ana',
      is_anonymous: true,
      created_at: '2026-10-20T09:00:00',
      updated_at: '2026-10-20T09:00:00',
    });
    expect(answer).toMatchObject({ upvotes: 0, isAccepted: false, parentAnswerId: null });
    expect(answerDisplayName(answer)).toBe('Anonymous');
  });
});

describe('selfCheckGuideFromRow', () => {
  const guide = {
    id: 'g1',
    title: 'Breast Self-Exam',
    description: 'Monthly check',
    cancer_type: 'Breast',
    frequency: 'Monthly',
    when_to_see_doctor: 'If you find a lump',
    source_name: 'ACS',
    source_url: 'https://cancer.org',
  };

  it('reads JSONB arrays', () => {
    const result = selfCheckGuideFromRow({
      ...guide,
      steps: [{ step: 1, instruction: 'Look', detail: 'In a mirror' }],
      warning_signs: ['Lump'],
    });
    expect(result.steps).toHaveLength(1);
    expect(result.warningSigns).toEqual(['Lump']);
  });

  it('reads arrays stored as JSON strings and tolerates missing ones', () => {
    const result = selfCheckGuideFromRow({
      ...guide,
      steps: JSON.stringify([{ step: 1, instruction: 'Look', detail: 'In a mirror' }]),
    });
    expect(result.steps[0].instruction).toBe('Look');
    expect(result.warningSigns).toBeNull();
  });
});

describe('journey models', () => {
  it('round-trips a journal entry without shifting the date', () => {
    const row = {
      id: '1761136200000',
      date: '2026-10-22T20:30:00+00:00',
      mood_level: 4,
      pain_level: 2,
      energy_level: 7,
      sleep_quality: 3,
      symptoms: ['Fatigue'],
      notes: null,
      appointment_notes: null,
      has_appointment: false,
    };
    const entry = journeyEntryFromRow(row);
    expect(entry.date.getDate()).toBe(22);
    expect(entry.date.getHours()).toBe(20);
    expect(journeyEntryToRow(entry)).toEqual({ ...row, date: '2026-10-22T20:30:00.000' });
  });

  it('parses treatment types by name or old numeric index', () => {
    const base = { id: 't1', name: 'Chemo', start_date: '2026-09-01T00:00:00' };
    expect(treatmentFromRow({ ...base, type: 'radiation' }).type).toBe('radiation');
    expect(treatmentFromRow({ ...base, type: 1 }).type).toBe('chemotherapy');
    expect(treatmentFromRow({ ...base, type: 'unknown' }).type).toBe('other');

    const treatment = treatmentFromRow({
      ...base,
      type: 'chemotherapy',
      total_sessions: 8,
      completed_sessions: 4,
    });
    expect(treatmentProgress(treatment)).toBe(50);
    expect(treatmentToRow(treatment)).toMatchObject({
      type: 'chemotherapy',
      completed_sessions: 4,
    });
  });

  it('parses milestone types and defaults unknown ones to personal', () => {
    const base = {
      id: 'm1',
      title: 'Started',
      description: 'd',
      date_achieved: '2026-10-01T10:00:00',
    };
    expect(milestoneFromRow({ ...base, type: 'daysFree', days_count: 7 })).toMatchObject({
      type: 'daysFree',
      daysCount: 7,
      isCelebrated: false,
    });
    expect(milestoneFromRow({ ...base, type: 5 }).type).toBe('anniversary');
    expect(milestoneFromRow({ ...base, type: 'nope' }).type).toBe('personal');
  });
});

describe('resources', () => {
  it('maps resources with defaults', () => {
    const resource = resourceFromRow({ id: 'r1', name: 'Hotline', type: 'hotline' });
    expect(resource).toMatchObject({
      description: '',
      phone: null,
      isVerified: false,
      isActive: true,
    });
  });
});
