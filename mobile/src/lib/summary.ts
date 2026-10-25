import type { Appointment } from '@/types/appointment';
import type { JourneyEntry } from '@/types/journeyEntry';
import { treatmentTypeLabel, type Treatment } from '@/types/treatment';

import { addDays, formatLongDate, formatShortDate, formatTime, isSameDay } from './dates';
import { FOCUS_OPTIONS, type JourneyFocus } from './focus';
import { mostCommonSymptoms } from './journey';
import { MOODS, SLEEP } from './journeyLabels';

// "Share a summary with my doctor" (redesign Phase 4): the facts for a date range, as
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
  };
}

const moodWord = (value: number) => MOODS[Math.round(value) - 1]?.label.toLowerCase() ?? '';
const sleepWord = (value: number) => SLEEP[Math.round(value) - 1]?.label.toLowerCase() ?? '';

/** The summary as headed sections of plain lines: the preview, and the PDF's content. */
export function summarySections(summary: Summary): { title: string; lines: string[] }[] {
  const range = isSameDay(summary.from, summary.to)
    ? formatLongDate(summary.to)
    : `${formatLongDate(summary.from)} to ${formatLongDate(summary.to)}`;
  const sections = [
    {
      title: 'About',
      lines: [summary.name, ...(summary.focusLabel ? [summary.focusLabel] : []), `Covers ${range}`],
    },
    {
      title: 'Check-ins',
      lines: summary.averages
        ? [
            `${summary.checkIns} check-in${summary.checkIns === 1 ? '' : 's'}`,
            `Mood: ${summary.averages.mood} of 5 on average (${moodWord(summary.averages.mood)})`,
            `Pain: ${summary.averages.pain} of 10 on average`,
            `Energy: ${summary.averages.energy} of 10 on average`,
            `Sleep: ${summary.averages.sleep} of 5 on average (${sleepWord(summary.averages.sleep)})`,
            ...(summary.trend
              ? [
                  `Pain over the period: ${summary.trend.pain}`,
                  `Energy over the period: ${summary.trend.energy}`,
                ]
              : []),
          ]
        : ['No check-ins in this period'],
    },
  ];
  if (summary.symptoms.length) {
    sections.push({
      title: 'Most common symptoms',
      lines: summary.symptoms.map(
        ([name, count]) => `${name}: ${count} day${count === 1 ? '' : 's'}`,
      ),
    });
  }
  if (summary.treatments.length) {
    sections.push({
      title: 'Treatments',
      lines: summary.treatments.map((t) => `${t.name}: ${t.detail}`),
    });
  }
  if (summary.appointments.length) {
    sections.push({
      title: 'Upcoming appointments',
      lines: summary.appointments.map(
        (a) => `${a.title}: ${a.when}${a.where ? `, ${a.where}` : ''}`,
      ),
    });
  }
  if (summary.notes.length) {
    sections.push({ title: 'Notes', lines: summary.notes.map((n) => `${n.date}: ${n.text}`) });
  }
  return sections;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A one-to-two page, print-friendly HTML document for expo-print. */
export function summaryHtml(summary: Summary): string {
  const body = summarySections(summary)
    .map(
      (section) =>
        `<h2>${escapeHtml(section.title)}</h2><ul>${section.lines
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join('')}</ul>`,
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>OncoSense summary</title><style>
body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#221A36;margin:32px;font-size:13px;line-height:1.5}
h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:20px 0 6px;border-bottom:1px solid #E3DDF2;padding-bottom:4px}
ul{margin:0;padding-left:18px}.note{color:#5D5672;font-size:11px;margin-top:24px}
</style></head><body><h1>Health summary for my doctor</h1>${body}<p class="note">Made with OncoSense from the check-ins I recorded. It is not a medical record.</p></body></html>`;
}
