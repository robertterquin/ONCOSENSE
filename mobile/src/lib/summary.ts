import type { Appointment } from '@/types/appointment';
import type { JourneyEntry } from '@/types/journeyEntry';
import { treatmentTypeLabel, type Treatment } from '@/types/treatment';

import { addDays, formatLongDate, formatShortDate, formatTime, isSameDay } from './dates';
import { FOCUS_OPTIONS, type JourneyFocus } from './focus';
import { mostCommonSymptoms } from './journey';
import { MOODS, SLEEP } from './journeyLabels';

// "Share with my doctor" (redesign Phase 4): the facts for a date range, as
// plain lines (the preview, and what tests check) and as HTML for expo-print.

type SummaryInput = {
  name: string;
  focus: JourneyFocus | null;
  days: number;
  now: Date;
  entries: JourneyEntry[];
  treatments: Treatment[];
  appointments: Appointment[];
  includeNotes: boolean;
  questions?: string[];
};

type Trend = 'better' | 'worse' | 'about the same';

export type Summary = {
  name: string;
  focusLabel: string | null;
  from: Date;
  to: Date;
  checkIns: number;
  averages: { mood: number; pain: number; energy: number; sleep: number } | null;
  /** Second half of the range compared with the first; null with too few check-ins. */
  trend: { pain: Trend; energy: Trend } | null;
  symptoms: [string, number][];
  treatments: { name: string; detail: string }[];
  appointments: { title: string; when: string; where: string | null }[];
  notes: { date: string; text: string }[];
  questions?: string[];
};

const round1 = (value: number) => Math.round(value * 10) / 10;
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

/** Pain going down is better; energy going up is better. Half a point counts as a change. */
function compare(first: number[], second: number[], higherIsBetter: boolean): Trend {
  const change = mean(second) - mean(first);
  if (Math.abs(change) < 0.5) return 'about the same';
  return change > 0 === higherIsBetter ? 'better' : 'worse';
}

export function buildSummary(input: SummaryInput): Summary {
  const to = input.now;
  const from = addDays(new Date(to.getFullYear(), to.getMonth(), to.getDate()), -(input.days - 1));
  const inRange = input.entries
    .filter(
      (entry) => entry.date.getTime() >= from.getTime() && entry.date.getTime() <= to.getTime(),
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const averages = inRange.length
    ? {
        mood: round1(mean(inRange.map((e) => e.moodLevel))),
        pain: round1(mean(inRange.map((e) => e.painLevel))),
        energy: round1(mean(inRange.map((e) => e.energyLevel))),
        sleep: round1(mean(inRange.map((e) => e.sleepQuality))),
      }
    : null;

  const middle = Math.floor(inRange.length / 2);
  const trend =
    inRange.length >= 4
      ? {
          pain: compare(
            inRange.slice(0, middle).map((e) => e.painLevel),
            inRange.slice(middle).map((e) => e.painLevel),
            false,
          ),
          energy: compare(
            inRange.slice(0, middle).map((e) => e.energyLevel),
            inRange.slice(middle).map((e) => e.energyLevel),
            true,
          ),
        }
      : null;

  return {
    name: input.name,
    focusLabel: FOCUS_OPTIONS.find((option) => option.value === input.focus)?.title ?? null,
    from,
    to,
    checkIns: inRange.length,
    averages,
    trend,
    symptoms: mostCommonSymptoms(inRange).slice(0, 5),
    treatments: input.treatments.map((treatment) => ({
      name: treatment.name,
      detail: [
        treatmentTypeLabel(treatment.type),
        `started ${formatShortDate(treatment.startDate)}`,
        treatment.totalSessions
          ? `${treatment.completedSessions} of ${treatment.totalSessions} sessions`
          : null,
        treatment.isActive ? null : 'finished',
      ]
        .filter(Boolean)
        .join(', '),
    })),
    appointments: input.appointments
      .filter((appointment) => appointment.startsAt.getTime() >= to.getTime())
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .slice(0, 5)
      .map((appointment) => ({
        title: appointment.title,
        when: `${formatLongDate(appointment.startsAt)}, ${formatTime(appointment.startsAt)}`,
        where: appointment.location,
      })),
    notes: input.includeNotes
      ? inRange
          .filter((entry) => entry.notes)
          .map((entry) => ({ date: formatShortDate(entry.date), text: entry.notes! }))
      : [],
    questions: input.questions?.filter((q) => q.trim().length > 0) ?? [],
  };
}

const moodWord = (value: number) => MOODS[Math.round(value) - 1]?.label.toLowerCase() ?? '';
const sleepWord = (value: number) => SLEEP[Math.round(value) - 1]?.label.toLowerCase() ?? '';

/** One row of the preview: a label, and a short value beside it or a longer detail under it. */
export type SummaryRow = { label: string; value?: string; detail?: string; trend?: Trend };

// "Hair Loss" reads as "Hair loss"; all-caps words like "UTI" stay as they are.
const sentenceCase = (text: string) =>
  text.replace(/ ([A-Z])(?=[a-z])/g, (_, c: string) => ` ${c.toLowerCase()}`);

/** The summary as headed sections of rows: the on-screen preview of the PDF. */
export function summarySections(summary: Summary): { title: string; rows: SummaryRow[] }[] {
  const range = isSameDay(summary.from, summary.to)
    ? formatLongDate(summary.to)
    : `${formatLongDate(summary.from)} to ${formatLongDate(summary.to)}`;
  const sections: { title: string; rows: SummaryRow[] }[] = [
    {
      title: 'About',
      rows: [
        { label: 'Name', value: summary.name },
        ...(summary.focusLabel ? [{ label: 'Focus', value: summary.focusLabel }] : []),
        { label: 'Covers', detail: range },
      ],
    },
    {
      title: 'Check-ins',
      rows: summary.averages
        ? [
            { label: 'Days logged', value: String(summary.checkIns) },
            {
              label: 'Mood',
              value: `${summary.averages.mood} of 5, ${moodWord(summary.averages.mood)}`,
            },
            { label: 'Pain', value: `${summary.averages.pain} of 10`, trend: summary.trend?.pain },
            {
              label: 'Energy',
              value: `${summary.averages.energy} of 10`,
              trend: summary.trend?.energy,
            },
            {
              label: 'Sleep',
              value: `${summary.averages.sleep} of 5, ${sleepWord(summary.averages.sleep)}`,
            },
          ]
        : [{ label: 'No check-ins in this period' }],
    },
  ];
  if (summary.symptoms.length) {
    sections.push({
      title: 'Most common symptoms',
      rows: summary.symptoms.map(([name, count]) => ({
        label: sentenceCase(name),
        value: `${count} day${count === 1 ? '' : 's'}`,
      })),
    });
  }
  if (summary.treatments.length) {
    sections.push({
      title: 'Treatments',
      rows: summary.treatments.map((t) => ({ label: t.name, detail: t.detail })),
    });
  }
  if (summary.appointments.length) {
    sections.push({
      title: 'Upcoming appointments',
      rows: summary.appointments.map((a) => ({
        label: a.title,
        detail: `${a.when}${a.where ? `, ${a.where}` : ''}`,
      })),
    });
  }
  if (summary.questions?.length) {
    sections.push({
      title: 'Questions for my doctor',
      rows: summary.questions.map((question) => ({ label: question })),
    });
  }
  if (summary.notes.length) {
    sections.push({
      title: 'Notes',
      rows: summary.notes.map((n) => ({ label: n.date, detail: n.text })),
    });
  }
  return sections;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A standardized, clinical 1-to-2 page PDF document for physician review. */
export function summaryHtml(summary: Summary): string {
  const range = isSameDay(summary.from, summary.to)
    ? formatLongDate(summary.to)
    : `${formatLongDate(summary.from)} to ${formatLongDate(summary.to)}`;

  const painTrendClass =
    summary.trend?.pain === 'better'
      ? 'trend-positive'
      : summary.trend?.pain === 'worse'
        ? 'trend-negative'
        : 'trend-neutral';
  const energyTrendClass =
    summary.trend?.energy === 'better'
      ? 'trend-positive'
      : summary.trend?.energy === 'worse'
        ? 'trend-negative'
        : 'trend-neutral';

  const painTrendSymbol =
    summary.trend?.pain === 'better' ? '↓' : summary.trend?.pain === 'worse' ? '↑' : '→';
  const energyTrendSymbol =
    summary.trend?.energy === 'better' ? '↑' : summary.trend?.energy === 'worse' ? '↓' : '→';

  const metricsHtml = summary.averages
    ? `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Average pain</div>
        <div class="metric-value">${summary.averages.pain} <span class="metric-unit">/ 10</span></div>
        <div class="metric-trend ${painTrendClass}">
          ${summary.trend ? `${painTrendSymbol} ${summary.trend.pain}` : 'Baseline tracking'}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Average energy</div>
        <div class="metric-value">${summary.averages.energy} <span class="metric-unit">/ 10</span></div>
        <div class="metric-trend ${energyTrendClass}">
          ${summary.trend ? `${energyTrendSymbol} ${summary.trend.energy}` : 'Baseline tracking'}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Sleep quality</div>
        <div class="metric-value">${summary.averages.sleep} <span class="metric-unit">/ 5</span></div>
        <div class="metric-sub">${escapeHtml(sleepWord(summary.averages.sleep))}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Overall mood</div>
        <div class="metric-value">${summary.averages.mood} <span class="metric-unit">/ 5</span></div>
        <div class="metric-sub">${escapeHtml(moodWord(summary.averages.mood))}</div>
      </div>
    </div>`
    : `<div class="empty-notice">No check-ins recorded during this period.</div>`;

  const symptomsHtml = summary.symptoms.length
    ? `
    <div class="section-card">
      <h2 class="section-title">Most common symptoms</h2>
      <div class="symptom-list">
        ${summary.symptoms
          .map(([name, count]) => {
            const pct = Math.min(100, Math.round((count / Math.max(1, summary.checkIns)) * 100));
            return `
            <div class="symptom-item">
              <div class="symptom-header">
                <span class="symptom-name">${escapeHtml(name)}</span>
                <span class="symptom-meta">${count} day${count === 1 ? '' : 's'} (${pct}%)</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width: ${pct}%;"></div>
              </div>
            </div>`;
          })
          .join('')}
      </div>
    </div>`
    : '';

  const treatmentsHtml = summary.treatments.length
    ? `
    <div class="section-card">
      <h2 class="section-title">Treatments</h2>
      <ul class="treatment-list">
        ${summary.treatments
          .map(
            (t) => `
            <li class="treatment-item">
              <strong>${escapeHtml(t.name)}</strong>: ${escapeHtml(t.detail)}
            </li>`,
          )
          .join('')}
      </ul>
    </div>`
    : '';

  const appointmentsHtml = summary.appointments.length
    ? `
    <div class="section-card">
      <h2 class="section-title">Upcoming appointments</h2>
      <ul class="appointment-list">
        ${summary.appointments
          .map(
            (a) => `
            <li class="appointment-item">
              <strong>${escapeHtml(a.title)}</strong> — ${escapeHtml(a.when)}${a.where ? `, <em>${escapeHtml(a.where)}</em>` : ''}
            </li>`,
          )
          .join('')}
      </ul>
    </div>`
    : '';

  const questionsHtml = summary.questions?.length
    ? `
    <div class="section-card questions-card">
      <h2 class="section-title questions-title">Questions for the doctor</h2>
      <ul class="questions-list">
        ${summary.questions
          .map((q) => `<li class="question-item"><strong>${escapeHtml(q)}</strong></li>`)
          .join('')}
      </ul>
    </div>`
    : '';

  const notesHtml = summary.notes.length
    ? `
    <div class="section-card">
      <h2 class="section-title">Notes</h2>
      <ul class="notes-list">
        ${summary.notes
          .map(
            (n) => `
            <li class="note-item">
              <span class="note-date">${escapeHtml(n.date)}:</span>
              <span class="note-text">${escapeHtml(n.text)}</span>
            </li>`,
          )
          .join('')}
      </ul>
    </div>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Health summary for my doctor — OncoSense</title>
<style>
  @page { margin: 12mm 14mm; size: portrait; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1F1930;
    margin: 0;
    padding: 24px;
    font-size: 13px;
    line-height: 1.5;
    background-color: #FFFFFF;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .header-card {
    background: #2E1F66;
    color: #FFFFFF;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
  }
  .header-title-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid rgba(255, 255, 255, 0.22);
    padding-bottom: 10px;
    margin-bottom: 14px;
  }
  h1 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.2px;
    color: #FFFFFF;
  }
  .app-tag {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.85;
  }
  .header-info-grid {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
  .info-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .info-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    opacity: 0.75;
  }
  .info-val {
    font-size: 13px;
    font-weight: 600;
  }
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .metric-card {
    background: #F6F4FA;
    border: 1px solid #ECE7F8;
    border-radius: 10px;
    padding: 12px 14px;
    text-align: center;
  }
  .metric-label {
    font-size: 11px;
    font-weight: 600;
    color: #5D5672;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .metric-value {
    font-size: 22px;
    font-weight: 800;
    color: #221A36;
    line-height: 1.2;
  }
  .metric-unit {
    font-size: 12px;
    font-weight: 500;
    color: #5D5672;
  }
  .metric-sub {
    font-size: 11px;
    color: #5D5672;
    margin-top: 4px;
    text-transform: capitalize;
  }
  .metric-trend {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    margin-top: 6px;
    text-transform: capitalize;
  }
  .trend-positive {
    background: #E1F2EF;
    color: #0E6B63;
  }
  .trend-negative {
    background: #FBE8EF;
    color: #C2255C;
  }
  .trend-neutral {
    background: #ECE7F8;
    color: #5D5672;
  }
  .section-card {
    background: #FFFFFF;
    border: 1px solid #ECE7F8;
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 16px;
    page-break-inside: avoid;
  }
  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: #221A36;
    margin: 0 0 10px;
    padding-bottom: 6px;
    border-bottom: 1.5px solid #F0ECF9;
  }
  .symptom-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .symptom-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 3px;
  }
  .symptom-meta {
    color: #5D5672;
    font-weight: 500;
  }
  .bar-track {
    width: 100%;
    height: 7px;
    background: #ECE7F8;
    border-radius: 4px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: #6A55D6;
    border-radius: 4px;
  }
  ul {
    margin: 0;
    padding-left: 20px;
  }
  li {
    margin-bottom: 5px;
  }
  .questions-card {
    border-color: #B4A3F5;
    background: #FAF9FE;
  }
  .questions-title {
    color: #5236B5;
    border-bottom-color: #E3DDF2;
  }
  .notes-list {
    list-style: none;
    padding: 0;
  }
  .note-item {
    padding: 8px 12px;
    background: #F6F4FA;
    border-radius: 6px;
    margin-bottom: 6px;
    font-size: 12px;
  }
  .note-date {
    font-weight: 700;
    color: #5236B5;
    margin-right: 8px;
  }
  .empty-notice {
    padding: 16px;
    color: #5D5672;
    font-style: italic;
    background: #F6F4FA;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 16px;
  }
  .footer-notice {
    color: #5D5672;
    font-size: 11px;
    margin-top: 24px;
    padding-top: 10px;
    border-top: 1px solid #ECE7F8;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="header-card">
    <div class="header-title-row">
      <h1>Health summary for my doctor</h1>
      <span class="app-tag">OncoSense Report</span>
    </div>
    <div class="header-info-grid">
      <div class="info-col">
        <span class="info-label">Patient</span>
        <span class="info-val">${escapeHtml(summary.name)}</span>
      </div>
      <div class="info-col">
        <span class="info-label">Focus</span>
        <span class="info-val">${escapeHtml(summary.focusLabel ?? 'General Tracking')}</span>
      </div>
      <div class="info-col">
        <span class="info-label">Reporting period</span>
        <span class="info-val">${escapeHtml(range)} (${summary.checkIns} check-in${summary.checkIns === 1 ? '' : 's'})</span>
      </div>
      <div class="info-col">
        <span class="info-label">Generated</span>
        <span class="info-val">${escapeHtml(formatLongDate(summary.to))}</span>
      </div>
    </div>
  </div>

  ${metricsHtml}
  ${questionsHtml}
  ${symptomsHtml}
  ${treatmentsHtml}
  ${appointmentsHtml}
  ${notesHtml}

  <p class="footer-notice note">Made with OncoSense from the check-ins I recorded. It is not a medical record. Intended to facilitate clinical discussion during healthcare consultations.</p>
</body>
</html>`;
}
