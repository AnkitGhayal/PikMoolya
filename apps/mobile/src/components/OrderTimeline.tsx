import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export type UserRole = 'FARMER' | 'BUYER' | 'LOGISTICS_PARTNER' | 'ADMIN';

interface TimelineStep {
  key: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface OrderTimelineProps {
  status: string;
  role: UserRole;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, role }) => {
  const getStepsForRole = (): TimelineStep[] => {
    const s = (status || '').toUpperCase();

    const isConfirmed = ['CONFIRMED', 'LOGISTICS_REQUESTED', 'LOGISTICS_ASSIGNED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(s);
    const isAssigned = ['LOGISTICS_ASSIGNED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(s);
    const isPickedUp = ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(s);
    const isInTransit = ['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(s);
    const isDelivered = ['DELIVERED', 'COMPLETED'].includes(s);

    if (role === 'LOGISTICS_PARTNER') {
      return [
        { key: 'REQUEST', label: 'Delivery Request', completed: true, current: s === 'REQUESTED' },
        { key: 'ASSIGNED', label: 'Accepted', completed: isAssigned, current: s === 'LOGISTICS_ASSIGNED' },
        { key: 'PICKUP', label: 'Picked Up', completed: isPickedUp, current: s === 'PICKED_UP' },
        { key: 'TRANSIT', label: 'In Transit', completed: isInTransit, current: s === 'IN_TRANSIT' },
        { key: 'DELIVERED', label: 'Delivered', completed: isDelivered, current: isDelivered },
      ];
    }

    if (role === 'BUYER') {
      return [
        { key: 'OFFER', label: 'Offer Accepted', completed: true, current: s === 'PENDING' },
        { key: 'ORDER', label: 'Order Created', completed: isConfirmed, current: s === 'CONFIRMED' },
        { key: 'LOGISTICS', label: 'Logistics Assigned', completed: isAssigned, current: s === 'LOGISTICS_ASSIGNED' },
        { key: 'TRANSIT', label: 'In Transit', completed: isInTransit, current: s === 'IN_TRANSIT' },
        { key: 'DELIVERED', label: 'Delivered', completed: isDelivered, current: isDelivered },
      ];
    }

    // FARMER & ADMIN default
    return [
      { key: 'OFFER', label: 'Offer Accepted', completed: true, current: s === 'PENDING' },
      { key: 'ORDER', label: 'Order Created', completed: isConfirmed, current: s === 'CONFIRMED' },
      { key: 'LOGISTICS', label: 'Logistics Requested', completed: isAssigned, current: s === 'LOGISTICS_REQUESTED' },
      { key: 'PICKUP', label: 'Picked Up', completed: isPickedUp, current: s === 'PICKED_UP' },
      { key: 'DELIVERED', label: 'Delivered', completed: isDelivered, current: isDelivered },
    ];
  };

  const steps = getStepsForRole();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Timeline</Text>
      <View style={styles.timelineRow}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.key}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  step.completed && styles.circleCompleted,
                  step.current && styles.circleCurrent,
                ]}
              >
                {step.completed ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : (
                  <Text style={styles.stepNum}>{idx + 1}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  step.completed && styles.labelCompleted,
                  step.current && styles.labelCurrent,
                ]}
                numberOfLines={2}
              >
                {step.label}
              </Text>
            </View>
            {idx < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  steps[idx + 1].completed && styles.lineCompleted,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    width: '100%',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepItem: {
    alignItems: 'center',
    width: 54,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleCompleted: {
    backgroundColor: theme.colors.primary,
  },
  circleCurrent: {
    backgroundColor: '#D97706', // Warning Amber
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.gray[600],
  },
  label: {
    fontSize: 10,
    color: theme.colors.gray[500],
    textAlign: 'center',
    lineHeight: 12,
  },
  labelCompleted: {
    color: theme.colors.gray[800],
    fontWeight: '600',
  },
  labelCurrent: {
    color: '#D97706',
    fontWeight: '700',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.gray[200],
    marginTop: 10,
    marginHorizontal: -4,
  },
  lineCompleted: {
    backgroundColor: theme.colors.primary,
  },
});
