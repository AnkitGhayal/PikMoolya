import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export type AdminStats = {
  totalFarmers: number;
  totalBuyers: number;
  totalLogistics: number;
  activeProducts: number;
  pendingOffers: number;
  activeOrders: number;
  activeDeliveries: number;
  platformHealth: string;
};

interface AdminDashboardViewProps {
  stats: AdminStats | null;
  onRefresh: () => void;
  onSelectTab: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  onRefresh,
  onSelectTab,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Stat Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Marketplace Oversight</Text>
            <Text style={styles.headerSub}>Real-time system transaction metrics</Text>
          </View>
          <View style={styles.healthBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.healthText}>{stats?.platformHealth || 'ACTIVE'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.refreshText}>Sync Real Data</Text>
        </TouchableOpacity>
      </View>

      {/* Primary KPI Grid */}
      <Text style={styles.sectionTitle}>User Ecosystem</Text>
      <View style={styles.statsGrid}>
        <TouchableOpacity style={styles.statBox} onPress={() => onSelectTab('users')}>
          <View style={[styles.iconBg, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="people" size={22} color="#166534" />
          </View>
          <Text style={styles.statNum}>{stats?.totalFarmers ?? 0}</Text>
          <Text style={styles.statLabel}>Farmers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statBox} onPress={() => onSelectTab('users')}>
          <View style={[styles.iconBg, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="briefcase" size={22} color="#1E40AF" />
          </View>
          <Text style={styles.statNum}>{stats?.totalBuyers ?? 0}</Text>
          <Text style={styles.statLabel}>Buyers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statBox} onPress={() => onSelectTab('logistics')}>
          <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="bus" size={22} color="#92400E" />
          </View>
          <Text style={styles.statNum}>{stats?.totalLogistics ?? 0}</Text>
          <Text style={styles.statLabel}>Logistics Partners</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Active Transactions & Pipeline</Text>
      <View style={styles.metricsGrid}>
        <TouchableOpacity style={styles.metricCard} onPress={() => onSelectTab('products')}>
          <View style={styles.metricHeader}>
            <Ionicons name="leaf" size={18} color={theme.colors.primary} />
            <Text style={styles.metricVal}>{stats?.activeProducts ?? 0}</Text>
          </View>
          <Text style={styles.metricTitle}>Active Listings</Text>
          <Text style={styles.metricSub}>Published Produce</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metricCard} onPress={() => onSelectTab('offers')}>
          <View style={styles.metricHeader}>
            <Ionicons name="pricetag" size={18} color="#D97706" />
            <Text style={styles.metricVal}>{stats?.pendingOffers ?? 0}</Text>
          </View>
          <Text style={styles.metricTitle}>Pending Offers</Text>
          <Text style={styles.metricSub}>In Negotiation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metricCard} onPress={() => onSelectTab('orders')}>
          <View style={styles.metricHeader}>
            <Ionicons name="cube" size={18} color="#2563EB" />
            <Text style={styles.metricVal}>{stats?.activeOrders ?? 0}</Text>
          </View>
          <Text style={styles.metricTitle}>Confirmed Orders</Text>
          <Text style={styles.metricSub}>Active Lifecycle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metricCard} onPress={() => onSelectTab('logistics')}>
          <View style={styles.metricHeader}>
            <Ionicons name="navigate" size={18} color="#059669" />
            <Text style={styles.metricVal}>{stats?.activeDeliveries ?? 0}</Text>
          </View>
          <Text style={styles.metricTitle}>In Transit</Text>
          <Text style={styles.metricSub}>Active Freight</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#A7F3D0',
    marginTop: 2,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  healthText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.gray[700],
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.gray[900],
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.gray[600],
    marginTop: 2,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.gray[900],
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.gray[800],
  },
  metricSub: {
    fontSize: 11,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
});
