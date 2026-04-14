import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { deliveryAPI } from '../../services/api';
import useDeliveryStore from '../../store/deliveryStore';
import { useTheme } from '../../context/ThemeContext';
import { GradBg } from '../../components/Grad';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { spacing, fontSizes, fonts, radius } from '../../theme';

const FILTERS = ['All', 'Pending', 'Delivered', 'Leave'];

export default function DeliveryScreen() {
  const { theme, isDark } = useTheme();
  const { todayList, setTodayList, updateDeliveryStatus, isOffline } = useDeliveryStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await deliveryAPI.getToday();
      setTodayList(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markDelivery = async (item, status) => {
    updateDeliveryStatus(item.customerId, item.mealType, status);
    try {
      await deliveryAPI.mark({
        customerId: item.customerId,
        date: new Date().toISOString().split('T')[0],
        mealType: item.mealType,
        status,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to mark delivery');
      updateDeliveryStatus(item.customerId, item.mealType, item.status);
    }
  };

  const markAllDelivered = () => {
    Alert.alert('Mark All Delivered', 'Mark all pending customers as delivered today?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          const pending = todayList.filter((i) => i.status === 'pending');
          for (const item of pending) {
            await markDelivery(item, 'delivered');
          }
        },
      },
    ]);
  };

  const filtered = todayList.filter((i) => {
    if (activeFilter === 'All') return true;
    return i.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const counts = {
    All: todayList.length,
    Pending: todayList.filter((i) => i.status === 'pending').length,
    Delivered: todayList.filter((i) => i.status === 'delivered').length,
    Leave: todayList.filter((i) => i.status === 'leave').length,
  };

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  if (loading) return (
    <GradBg colors={isDark ? ['#0B0E1A', '#0B0E1A'] : [theme.background, theme.background]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </GradBg>
  );

  return (
    <GradBg colors={isDark ? ['#0B0E1A', '#0B0E1A'] : [theme.background, theme.background]} style={{ flex: 1 }}>
      <ScreenHeader title="Today's Deliveries" subtitle={dateStr} />

      {isOffline && (
        <View style={{ backgroundColor: theme.warningLight, borderLeftWidth: 3, borderLeftColor: theme.warning, margin: spacing.md, borderRadius: radius.sm, padding: spacing.md }}>
          <Text style={{ color: theme.warning, fontSize: fontSizes.sm, fontFamily: fonts.semibold }}>Offline Mode — changes will sync when connected</Text>
        </View>
      )}

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }} contentContainerStyle={{ gap: spacing.sm }}>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.xs,
                borderRadius: radius.pill,
                backgroundColor: isActive ? theme.primary : theme.surface,
                borderWidth: 1,
                borderColor: isActive ? theme.primary : theme.border,
              }}
              activeOpacity={0.8}>
              <Text style={{
                fontSize: fontSizes.sm,
                fontFamily: isActive ? fonts.bold : fonts.medium,
                color: isActive ? '#FFF' : theme.textSecondary,
              }}>
                {f}{counts[f] > 0 ? ` (${counts[f]})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => `${item.customerId}-${item.mealType}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.sm }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.sm, overflow: 'hidden' }}>
            {item.hasApprovedLeave && (
              <View style={{ backgroundColor: theme.warningLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
                <Text style={{ color: theme.warning, fontSize: fontSizes.xs, fontFamily: fonts.semibold }}>On Leave Today</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md }}>
              <Avatar name={item.name} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: fontSizes.xs, fontFamily: fonts.semibold, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {item.customerCode}
                </Text>
                <Text style={{ color: theme.text, fontSize: fontSizes.body, fontFamily: fonts.semibold, marginVertical: 2 }}>
                  {item.name}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: fontSizes.sm, fontFamily: fonts.regular }}>
                  {item.zone} • {item.mealType}
                </Text>
              </View>
              <Badge status={item.status} />
            </View>
            {!item.hasApprovedLeave && item.status === 'pending' && (
              <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.border }}>
                <TouchableOpacity
                  style={{ flex: 1, padding: spacing.md, alignItems: 'center', backgroundColor: theme.successLight }}
                  onPress={() => markDelivery(item, 'delivered')}
                  activeOpacity={0.8}>
                  <Text style={{ color: theme.success, fontFamily: fonts.bold, fontSize: fontSizes.sm }}>✓ Delivered</Text>
                </TouchableOpacity>
                <View style={{ width: 1, backgroundColor: theme.border }} />
                <TouchableOpacity
                  style={{ flex: 1, padding: spacing.md, alignItems: 'center', backgroundColor: theme.errorLight }}
                  onPress={() => markDelivery(item, 'missed')}
                  activeOpacity={0.8}>
                  <Text style={{ color: theme.error, fontFamily: fonts.bold, fontSize: fontSizes.sm }}>✕ Missed</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState emoji="🚴" title="No deliveries" subtitle="No deliveries match the current filter" />
        }
        ListFooterComponent={
          counts.Pending > 0 ? (
            <TouchableOpacity
              style={{
                marginTop: spacing.md,
                backgroundColor: theme.primary,
                borderRadius: radius.md,
                padding: spacing.lg,
                alignItems: 'center',
              }}
              onPress={markAllDelivered}
              activeOpacity={0.8}>
              <Text style={{ color: '#FFF', fontFamily: fonts.bold, fontSize: fontSizes.body }}>
                Mark All Delivered ({counts.Pending})
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </GradBg>
  );
}
