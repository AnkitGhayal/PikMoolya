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
import { Language, t } from '../utils/i18n';
import { theme } from '../theme/theme';

interface LanguageSelectorModalProps {
  visible: boolean;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onClose: () => void;
}

const LANGUAGES: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी' },
];

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  visible,
  currentLanguage,
  onSelectLanguage,
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
              <Ionicons name="language-outline" size={22} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Select Language</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={24} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Choose your preferred language for PikMoolya</Text>

          <View style={styles.list}>
            {LANGUAGES.map((item) => {
              const isSelected = currentLanguage === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.itemRow, isSelected && styles.selectedItemRow]}
                  onPress={() => {
                    onSelectLanguage(item.code);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name="globe-outline"
                      size={20}
                      color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                      style={{ marginRight: 12 }}
                    />
                    <View>
                      <Text style={[styles.itemNative, isSelected && styles.selectedText]}>
                        {item.nativeName}
                      </Text>
                      <Text style={styles.itemLabel}>{item.label}</Text>
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
  itemNative: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMain,
  },
  itemLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  selectedText: {
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
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
});
