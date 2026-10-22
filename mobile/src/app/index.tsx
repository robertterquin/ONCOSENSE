import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listCancerTypeNames } from '@/api/cancerInfo';

// Temporary Phase 1 screen: proves the app runs and can reach Supabase.
// Replaced by the launch redirect in Phase 3.
export default function SetupCheckScreen() {
  const { data, error, isPending } = useQuery({
    queryKey: ['setup-check', 'cancer-types'],
    queryFn: () => listCancerTypeNames(5),
  });

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>OncoSense</Text>
      <Text style={styles.subtitle}>React Native setup check</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Supabase connection</Text>
        {isPending && <ActivityIndicator color="#E91E63" />}
        {error && <Text style={styles.error}>✗ {error.message}</Text>}
        {data && (
          <>
            <Text style={styles.success}>✓ Connected — first {data.length} cancer types:</Text>
            {data.map((name) => (
              <Text key={name} style={styles.item}>
                • {name}
              </Text>
            ))}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E91E63',
  },
  subtitle: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 16,
  },
  card: {
    alignSelf: 'stretch',
    maxWidth: 480,
    padding: 16,
    gap: 6,
    borderRadius: 12,
    backgroundColor: '#FCE4EC',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  success: {
    color: '#2E7D32',
  },
  error: {
    color: '#C62828',
  },
  item: {
    color: '#212121',
  },
});
