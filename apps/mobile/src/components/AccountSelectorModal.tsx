import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export type AccountType = 'farmer' | 'buyer' | 'logistics' | 'admin';

interface AccountSelectorModalProps {
  visible: boolean;
  selectedRole: AccountType;
  onSelectRole: (role: AccountType) => void;
  onClose: () => void;
}

const ROLES: {
  id: AccountType;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'farmer',
    title: 'Farmer',
    desc: 'Sell agricultural produce & check fair prices',
    icon: 'leaf-outline',
  },
  {
    id: 'buyer',
    title: 'Buyer',
    desc: 'Browse crops & buy directly from local farmers',
    icon: 'cart-outline',
  },
  {
    id: 'logistics',
    title: 'Logistics Partner',
    desc: 'Transportation, pickup & delivery services',
    icon: 'bus-outline',
  },
  {
    id: 'admin',
    title: 'Admin',
    desc: 'System administration & quality governance',
    icon: 'shield-checkmark-outline',
  },
];

export const AccountSelectorModal: React.FC<AccountSelectorModalProps> = ({
  visible,
  selectedRole,
  onSelectRole,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person-circle-outline" size={22} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Select Account Type</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={24} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Select how you want to use PikMoolya marketplace</Text>

          <View style={styles.list}>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[styles.itemRow, isSelected && styles.selectedItemRow]}
                  onPress={() => {
                    onSelectRole(role.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View
                      style={[
                        styles.iconContainer,
                        isSelected && styles.iconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name={role.icon}
                        size={22}
                        color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.roleTitle, isSelected && styles.selectedTitle]}>
                        {role.title}
                      </Text>
                      <Text style={styles.roleDesc}>{role.desc}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.backdrop,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    ...theme.shadows.md,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMain,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  list: {
    gap: theme.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  selectedItemRow: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#FFFFFF',
  },
  roleTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMain,
  },
  roleDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  selectedTitle: {
    color: theme.colors.primary,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
});
