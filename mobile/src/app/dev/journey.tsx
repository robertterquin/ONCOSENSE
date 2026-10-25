import { Redirect } from 'expo-router';

import {
  ComingUp,
  EnergyAndPain,
  Milestones,
  RecentCheckIns,
  Treatments,
} from '@/components/journey/Dashboard';
import { ThreadWeek } from '@/components/journey/ThreadWeek';
import { Button, Screen } from '@/components/ui';
import { addDays } from '@/lib/dates';
import type { Appointment } from '@/types/appointment';
import type { JourneyEntry } from '@/types/journeyEntry';
import type { Milestone } from '@/types/milestone';
import type { Treatment } from '@/types/treatment';

// Development-only: the Journey dashboard with sample data, for checking the design
// without an account (compare with the Journey artboard). Nothing here is saved.

const now = new Date();
const day = (daysAgo: number, hour = 20) => {
  const date = addDays(now, -daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const entry = (daysAgo: number, fields: Partial<JourneyEntry>): JourneyEntry => ({
  id: `sample-${daysAgo}`,
  date: day(daysAgo),
  moodLevel: 3,
  painLevel: 3,
  energyLevel: 5,
  sleepQuality: 3,
  symptoms: [],
  notes: null,
  appointmentNotes: null,
  hasAppointment: false,
  ...fields,
});

const ENTRIES = [
  entry(0, { moodLevel: 4, painLevel: 2, energyLevel: 7, symptoms: ['Fatigue'] }),
  entry(1, { moodLevel: 3, painLevel: 4, energyLevel: 5, symptoms: ['Fatigue', 'Nausea'] }),
  entry(3, { moodLevel: 2, painLevel: 6, energyLevel: 3, symptoms: ['Nausea'] }),
  entry(4, { moodLevel: 3, painLevel: 5, energyLevel: 4 }),
  entry(6, { moodLevel: 4, painLevel: 3, energyLevel: 6 }),
];

const APPOINTMENTS: Appointment[] = [
  {
    id: 'sample-a1',
    title: 'Chemotherapy, cycle 4',
    startsAt: (() => {
      const date = addDays(now, 3);
      date.setHours(9, 0, 0, 0);
      return date;
    })(),
    location: 'Philippine General Hospital',
    notes: null,
    treatmentId: 'sample-t1',
  },
];

const TREATMENTS: Treatment[] = [
  {
    id: 'sample-t1',
    name: 'Chemotherapy, AC regimen',
    type: 'chemotherapy',
    startDate: day(60),
    endDate: null,
    doctorName: null,
    hospitalName: null,
    notes: null,
    totalSessions: 6,
    completedSessions: 3,
    sideEffects: ['Fatigue'],
    isActive: true,
  },
];

const MILESTONES: Milestone[] = [
  {
    id: 'sample-m1',
    title: 'Halfway through treatment',
    description: 'Chemotherapy, AC regimen: 50% complete',
    type: 'sessionComplete',
    dateAchieved: day(2),
    isCelebrated: false,
    iconName: null,
    daysCount: null,
  },
];

export default function JourneySampleScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <Screen
      back={{ label: 'Back' }}
      title="My journey"
      subtitle="In treatment since August 2026 (sample data)">
      <ThreadWeek entries={ENTRIES} now={now} />
      <Button title="Check in for today" icon="plus" onPress={() => {}} />
      <EnergyAndPain entries={ENTRIES} now={now} />
      <ComingUp appointments={APPOINTMENTS} />
      <Treatments treatments={TREATMENTS} />
      <Milestones milestones={MILESTONES} />
      <RecentCheckIns entries={ENTRIES} />
    </Screen>
  );
}
