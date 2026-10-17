import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheetContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="notifications" size={22} color={theme.colors.primary} />
                <Text style={styles.headerTitle}>Notifications</Text>
              </View>
              <View style={styles.headerRight}>
                {notifications.some((n) => !n.isRead) && (
                  <TouchableOpacity onPress={onMarkAllAsRead} style={styles.markAllBtn}>
                    <Text style={styles.markAllText}>Mark all as read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={theme.colors.gray[600]} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-off-outline" size={48} color={theme.colors.gray[400]} />
                  <Text style={styles.emptyTitle}>No Notifications</Text>
                  <Text style={styles.emptySub}>You are all caught up with your updates.</Text>
                </View>
              ) : (
                notifications.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notifCard, !item.isRead && styles.unreadNotifCard]}
                    onPress={() => onMarkAsRead(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={
                          item.type.includes('OFFER')
                            ? 'pricetag'
                            : item.type.includes('LOGISTICS')
                            ? 'bus'
                            : item.type.includes('ORDER')
                            ? 'cube'
                            : 'information-circle'
                        }
                        size={20}
                        color={!item.isRead ? theme.colors.primary : theme.colors.gray[500]}
                      />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={[styles.notifTitle, !item.isRead && styles.unreadTitle]}>
                        {item.title}
                      </Text>
                      <Text style={styles.notifBody}>{item.body}</Text>
                      <Text style={styles.notifTime}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.gray[900],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 12,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingVertical: 12,
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: theme.colors.gray[500],
    marginTop: 4,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: theme.colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    alignItems: 'flex-start',
    gap: 12,
  },
  unreadNotifCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '700',
    color: theme.colors.gray[900],
  },
  notifBody: {
    fontSize: 13,
    color: theme.colors.gray[600],
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: theme.colors.gray[400],
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
});
