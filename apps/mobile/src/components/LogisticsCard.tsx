import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export type LogisticsRequestData = {
  id: string;
  orderId: string;
  farmerId: string;
  buyerId: string;
  pickupLocation: string;
  deliveryLocation: string;
  cropName: string;
  quantity: number;
  unit: string;
  distanceKm: number;
  vehicleType: string;
  estimatedCost: number;
  status: string;
  createdAt: string;
};

interface LogisticsCardProps {
  request: LogisticsRequestData;
  isLogisticsPartner: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

export const LogisticsCard: React.FC<LogisticsCardProps> = ({
  request,
  isLogisticsPartner,
  onAccept,
  onReject,
  onUpdateStatus,
}) => {
  const getNextStatus = (current: string) => {
    switch (current) {
      case 'ACCEPTED':
        return { label: 'Schedule Pickup', status: 'PICKUP_SCHEDULED', icon: 'calendar-outline' };
      case 'PICKUP_SCHEDULED':
        return { label: 'Mark Picked Up', status: 'PICKED_UP', icon: 'cube-outline' };
      case 'PICKED_UP':
        return { label: 'Mark In Transit', status: 'IN_TRANSIT', icon: 'bus-outline' };
      case 'IN_TRANSIT':
        return { label: 'Mark Delivered', status: 'DELIVERED', icon: 'checkmark-circle-outline' };
      default:
        return null;
    }
  };

  const nextAction = getNextStatus(request.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bus-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.cropTitle} numberOfLines={1}>
            {request.cropName} ({request.quantity} {request.unit})
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            request.status === 'REQUESTED'
              ? styles.statusRequested
              : request.status === 'DELIVERED'
              ? styles.statusDelivered
              : styles.statusActive,
          ]}
        >
          <Text style={styles.statusText}>{request.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.locationCol}>
          <View style={styles.locItem}>
            <Ionicons name="location-outline" size={16} color="#059669" />
            <View style={styles.locTextWrap}>
              <Text style={styles.locLabel}>Pickup Point</Text>
              <Text style={styles.locVal} numberOfLines={1}>{request.pickupLocation}</Text>
            </View>
          </View>
          <View style={styles.locItem}>
            <Ionicons name="navigate-outline" size={16} color="#DC2626" />
            <View style={styles.locTextWrap}>
              <Text style={styles.locLabel}>Destination</Text>
              <Text style={styles.locVal} numberOfLines={1}>{request.deliveryLocation}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Distance</Text>
          <Text style={styles.metaVal}>{request.distanceKm} km</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Vehicle Needed</Text>
          <Text style={styles.metaVal} numberOfLines={1}>{request.vehicleType}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Est. Freight</Text>
          <Text style={[styles.metaVal, styles.costText]}>₹{request.estimatedCost}</Text>
        </View>
      </View>

      {isLogisticsPartner && (
        <View style={styles.actionsRow}>
          {request.status === 'REQUESTED' && (
            <>
              {onReject && (
                <TouchableOpacity
                  style={[styles.btn, styles.rejectBtn]}
                  onPress={() => onReject(request.id)}
                >
                  <Text style={styles.rejectBtnText}>Decline</Text>
                </TouchableOpacity>
              )}
              {onAccept && (
                <TouchableOpacity
                  style={[styles.btn, styles.acceptBtn]}
                  onPress={() => onAccept(request.id)}
                >
                  <Text style={styles.acceptBtnText}>Accept Request</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {nextAction && onUpdateStatus && (
            <TouchableOpacity
              style={[styles.btn, styles.actionBtn]}
              onPress={() => onUpdateStatus(request.id, nextAction.status)}
            >
              <Ionicons name={nextAction.icon as any} size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>{nextAction.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.gray[900],
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusRequested: {
    backgroundColor: '#FEF3C7',
  },
  statusDelivered: {
    backgroundColor: '#D1FAE5',
  },
  statusActive: {
    backgroundColor: '#DBEAFE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.gray[800],
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[100],
    marginVertical: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  locationCol: {
    gap: 8,
  },
  locItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locTextWrap: {
    flex: 1,
  },
  locLabel: {
    fontSize: 10,
    color: theme.colors.gray[500],
    textTransform: 'uppercase',
  },
  locVal: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.gray[800],
  },
  metaGrid: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[50],
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: theme.colors.gray[500],
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.gray[900],
    marginTop: 2,
  },
  costText: {
    color: theme.colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  acceptBtn: {
    backgroundColor: theme.colors.primary,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
