import Slider from '@react-native-community/slider';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

// Building blocks shared by the Add Entry and Add Treatment screens.

/** Titled section with a pink icon (Flutter's `_buildSection`). */
export function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        <MaterialIcon name={icon} size={20} color={brand.headerPink} />
        <AppText variant="titleMedium">{title}</AppText>
      </View>
      {children}
    </View>
  );
}

/** White rounded box around a form control. */
export function FormBox({ children, style }: { children: ReactNode; style?: object }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.box,
        { backgroundColor: isDark ? colors.card : brand.white },
        !isDark && styles.shadow,
        style,
      ]}>
      {children}
    </View>
  );
}

/** Row of emoji/label options, one selectable (mood, sleep). */
export function EmojiScale({
  options,
  value,
  onChange,
  color,
  showEmoji = true,
}: {
  options: { emoji: string; label: string; value: number }[];
  value: number;
  onChange: (value: number) => void;
  color: string;
  showEmoji?: boolean;
}) {
  const { isDark } = useTheme();
  return (
    <FormBox style={styles.scale}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={[
              styles.scaleOption,
              {
                backgroundColor: selected ? `${color}33` : 'transparent',
                borderColor: selected ? color : 'transparent',
              },
            ]}>
            {showEmoji ? <AppText style={styles.emoji}>{option.emoji}</AppText> : null}
            <AppText
              style={[
                styles.scaleLabel,
                { color: selected ? color : isDark ? 'rgba(255,255,255,0.6)' : '#9E9E9E' },
              ]}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </FormBox>
  );
}

/** Labeled whole-number slider (pain, energy). */
export function LevelSlider({
  value,
  min,
  max,
  color,
  label,
  onChange,
  accessibilityLabel,
}: {
  value: number;
  min: number;
  max: number;
  color: string;
  label: string;
  onChange: (value: number) => void;
  accessibilityLabel: string;
}) {
  const { isDark } = useTheme();
  const muted = isDark ? 'rgba(255,255,255,0.6)' : '#9E9E9E';
  return (
    <FormBox>
      <View style={styles.sliderLabels}>
        <AppText variant="bodySmall" color={muted}>
          {min}
        </AppText>
        <AppText variant="label" color={color}>
          {label}
        </AppText>
        <AppText variant="bodySmall" color={muted}>
          {max}
        </AppText>
      </View>
      <Slider
        accessibilityLabel={accessibilityLabel}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={1}
        onValueChange={(next) => onChange(Math.round(next))}
        minimumTrackTintColor={color}
        maximumTrackTintColor={`${color}33`}
        thumbTintColor={color}
      />
    </FormBox>
  );
}

/** Wrapping multi-select chips (symptoms, side effects). */
export function ChipSelect({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const { colors, isDark } = useTheme();
  return (
    <FormBox style={styles.chips}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <Pressable
            key={option}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            onPress={() =>
              onChange(
                isSelected ? selected.filter((item) => item !== option) : [...selected, option],
              )
            }
            style={[
              styles.chip,
              isSelected
                ? { backgroundColor: 'rgba(216,27,96,0.15)', borderColor: brand.headerPink }
                : {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FAFAFA',
                    borderColor: colors.divider,
                  },
            ]}>
            {isSelected ? <MaterialIcon name="check" size={14} color={brand.headerPink} /> : null}
            <AppText variant="bodySmall" color={isSelected ? brand.headerPink : colors.text}>
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </FormBox>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: { borderRadius: radius.large, padding: 16 },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  scale: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  scaleOption: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
  },
  emoji: { fontSize: 28, lineHeight: 36 },
  scaleLabel: { fontSize: 11, fontFamily: 'Poppins_500Medium' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
});
