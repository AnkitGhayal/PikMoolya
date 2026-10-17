import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface BottomSheetModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  title,
  subtitle,
  icon,
  onClose,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.sheetContainer}
          onPress={(e) => e.stopPropagation()}
        >
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
            >
              <Ionicons name="close-circle" size={24} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          </View>

          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.content}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    zIndex: 9998,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : theme.spacing.xl,
    maxHeight: '80%',
    zIndex: 9999,
    elevation: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
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
    marginBottom: theme.spacing.md,
  },
  content: {
    marginTop: theme.spacing.sm,
  },
});
