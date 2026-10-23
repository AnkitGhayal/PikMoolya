import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Language } from '../utils/i18n';
import { theme } from '../theme/theme';

import { PikMoolyaLogo } from './branding/PikMoolyaLogo';

interface AppHeaderProps {
  currentLanguage: Language;
  onOpenLanguageModal: () => void;
  selectedAccount?: string;
  onOpenAccountModal?: () => void;
  showAccountSelector?: boolean;
  onGoBack?: () => void;
  title?: string;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  mr: 'मराठी',
  hi: 'हिंदी',
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentLanguage,
  onOpenLanguageModal,
  selectedAccount,
  onOpenAccountModal,
  showAccountSelector = false,
  onGoBack,
  title,
  unreadNotificationsCount = 0,
  onOpenNotifications,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {onGoBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onGoBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.logoRow}>
          <PikMoolyaLogo size="small" />
        </View>

        {title ? (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightRow}>
        {onOpenNotifications && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onOpenNotifications}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.colors.gray[700]} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showAccountSelector && onOpenAccountModal ? (
          <TouchableOpacity
            style={styles.accountPill}
            onPress={onOpenAccountModal}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.pillText}>
              {selectedAccount ? selectedAccount.charAt(0).toUpperCase() + selectedAccount.slice(1) : 'Farmer'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.textMuted} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.langPill}
          onPress={onOpenLanguageModal}
          activeOpacity={0.7}
        >
          <Ionicons name="globe-outline" size={15} color={theme.colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.pillText}>{LANGUAGE_LABELS[currentLanguage] || 'English'}</Text>
          <Ionicons name="chevron-down" size={14} color={theme.colors.textMuted} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 130,
    height: 34,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMain,
    marginLeft: theme.spacing.md,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconBtn: {
    padding: 6,
    position: 'relative',
    marginRight: 2,
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMain,
  },
});
