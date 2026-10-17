import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export interface SelectionOption {
  id: string;
  label: string;
  subLabel?: string;
  rightBadge?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value?: any;
}

interface SelectionBottomSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  options: SelectionOption[];
  selectedValue?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSelect: (option: SelectionOption) => void;
  onClose: () => void;
}

export const SelectionBottomSheet: React.FC<SelectionBottomSheetProps> = ({
  visible,
  title,
  subtitle,
  icon,
  options,
  selectedValue,
  searchable = false,
  searchPlaceholder = 'Search options...',
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter((opt) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      opt.label.toLowerCase().includes(s) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(s)) ||
      (opt.rightBadge && opt.rightBadge.toLowerCase().includes(s))
    );
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        {/* Full Screen Opaque Backdrop that blocks all interactions */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* 100% Solid Opaque Bottom Sheet */}
        <View style={styles.sheetContainer}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {icon ? (
                <Ionicons
                  name={icon}
                  size={22}
                  color={theme.colors.primary}
                  style={{ marginRight: 8 }}
                />
              ) : null}
              <Text style={styles.title}>{title}</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          {searchable ? (
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#94A3B8"
                autoCorrect={false}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredOptions.length === 0 ? (
              <Text style={styles.noResultsText}>No options matching "{search}"</Text>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValue === opt.id || selectedValue === opt.label;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => {
                      onSelect(opt);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      {opt.icon ? (
                        <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                          <Ionicons
                            name={opt.icon}
                            size={18}
                            color={isSelected ? '#FFFFFF' : theme.colors.primary}
                          />
                        </View>
                      ) : null}

                      <View style={{ marginLeft: opt.icon ? 12 : 0, flex: 1 }}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                          {opt.label}
                        </Text>
                        {opt.subLabel ? (
                          <Text style={styles.optionSubLabel}>{opt.subLabel}</Text>
                        ) : null}
                      </View>
                    </View>

                    {opt.rightBadge ? (
                      <View style={styles.rightBadgeBox}>
                        <Text style={styles.rightBadgeText}>{opt.rightBadge}</Text>
                      </View>
                    ) : null}

                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} style={{ marginLeft: 8 }} />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Full dark backdrop that blocks background view
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF', // 100% Solid Opaque Background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '82%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 30,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  scrollArea: {
    maxHeight: 380,
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  optionRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#E8F5E9',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleSelected: {
    backgroundColor: theme.colors.primary,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  optionSubLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rightBadgeBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  rightBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  noResultsText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
