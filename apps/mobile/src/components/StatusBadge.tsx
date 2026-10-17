import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export type StatusType =
  | 'ACTIVE'
  | 'OFFER_RECEIVED'
  | 'UNDER_NEGOTIATION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SOLD'
  | 'PENDING'
  | 'COUNTERED';

interface StatusBadgeProps {
  status: StatusType | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = (status || 'ACTIVE').toUpperCase().replace(/\s+/g, '_');

  let bg = theme.colors.primaryLight;
  let fg = theme.colors.primary;
  let label = status;
  let icon: keyof typeof Ionicons.glyphMap = 'checkmark-circle-outline';

  switch (norm) {
    case 'ACTIVE':
      bg = theme.colors.primaryLight;
      fg = theme.colors.primary;
      label = 'Active';
      icon = 'pulse-outline';
      break;
    case 'OFFER_RECEIVED':
      bg = theme.colors.infoLight;
      fg = theme.colors.info;
      label = 'Offer Received';
      icon = 'mail-unread-outline';
      break;
    case 'UNDER_NEGOTIATION':
    case 'PENDING':
      bg = theme.colors.warningLight;
      fg = theme.colors.warning;
      label = norm === 'PENDING' ? 'Pending' : 'Under Negotiation';
      icon = 'time-outline';
      break;
    case 'ACCEPTED':
      bg = theme.colors.successLight;
      fg = theme.colors.success;
      label = 'Accepted';
      icon = 'checkmark-done-circle-outline';
      break;
    case 'REJECTED':
      bg = theme.colors.errorLight;
      fg = theme.colors.error;
      label = 'Rejected';
      icon = 'close-circle-outline';
      break;
    case 'SOLD':
      bg = '#E2E8F0';
      fg = '#475569';
      label = 'Sold';
      icon = 'pricetag-outline';
      break;
    case 'COUNTERED':
      bg = '#F3E8FF';
      fg = '#6B21A8';
      label = 'Counter Offer';
      icon = 'swap-horizontal-outline';
      break;
    default:
      bg = theme.colors.surfaceSubtle;
      fg = theme.colors.textMuted;
      label = status;
      icon = 'ellipse-outline';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={13} color={fg} style={{ marginRight: 4 }} />
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
  },
});
