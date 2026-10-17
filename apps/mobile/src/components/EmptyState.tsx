import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'leaf-outline',
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 16,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
});
