import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

export default function AuthGroupLayout() {
  const reduceMotion = useReducedMotion();
  return (
    <Stack screenOptions={{ headerShown: false, animation: reduceMotion ? 'fade' : 'default' }} />
  );
}
