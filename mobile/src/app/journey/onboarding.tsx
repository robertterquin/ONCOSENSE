import { JourneySetupFlow } from '@/components/journey/JourneySetupFlow';

// Port of lib/screens/journey/journey_onboarding_screen.dart: new users land here
// after registering.

export default function JourneyOnboardingScreen() {
  return <JourneySetupFlow mode="onboarding" />;
}
