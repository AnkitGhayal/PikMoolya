import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export type LogoVariant = 'full' | 'header' | 'icon' | 'dark';
export type LogoSize = 'small' | 'medium' | 'large';

interface PikMoolyaLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  width?: number;
  height?: number;
  showTagline?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZE_PRESETS: Record<LogoSize, { iconSize: number; fontSize: number; gap: number; height: number }> = {
  small: { iconSize: 32, fontSize: 18, gap: 6, height: 36 },
  medium: { iconSize: 40, fontSize: 22, gap: 8, height: 44 },
  large: { iconSize: 52, fontSize: 28, gap: 10, height: 58 },
};

export const PikMoolyaLogo: React.FC<PikMoolyaLogoProps> = ({
  variant = 'full',
  size = 'medium',
  showTagline = false,
  style,
}) => {
  const preset = SIZE_PRESETS[size] || SIZE_PRESETS.medium;
  const isDark = variant === 'dark';

  if (variant === 'icon') {
    return (
      <View style={[styles.center, style]}>
        <Image
          source={require('../../../assets/branding/pikmoolya-icon.png')}
          style={{ width: preset.iconSize, height: preset.iconSize, borderRadius: preset.iconSize * 0.2 }}
          resizeMode="contain"
          accessibilityLabel="PikMoolya Icon"
        />
      </View>
    );
  }

  const pikColor = isDark ? '#4ADE80' : '#1B5E20';
  const moolyaColor = isDark ? '#FFFFFF' : '#1E293B';
  const tagColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <View style={[styles.brandUnit, { gap: preset.gap }, style]}>
      {/* Brand Icon Symbol */}
      <Image
        source={require('../../../assets/branding/pikmoolya-icon.png')}
        style={{ width: preset.iconSize, height: preset.iconSize, borderRadius: preset.iconSize * 0.2 }}
        resizeMode="contain"
        accessibilityLabel="PikMoolya Symbol"
      />

      {/* Wordmark Typography + Tagline */}
      <View style={styles.textColumn}>
        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmarkPik, { fontSize: preset.fontSize, color: pikColor }]}>
            Pik
          </Text>
          <Text style={[styles.wordmarkMoolya, { fontSize: preset.fontSize, color: moolyaColor }]}>
            M
            <Text style={{ color: '#F59E0B' }}>o</Text>
            olya
          </Text>
        </View>

        {showTagline && (
          <Text style={[styles.tagline, { color: tagColor }]}>
            FAIR PRICE | DIRECT MARKET
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  textColumn: {
    justifyContent: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmarkPik: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  wordmarkMoolya: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: -2,
  },
});
