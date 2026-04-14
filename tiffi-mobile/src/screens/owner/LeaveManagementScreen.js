import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { leaveAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

export default function LeaveManagementScreen({ navigation }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await leaveAPI.pending();
      setLeaves(res.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = (id) => {
    Alert.alert('Approve Leave', 'Approve this leave request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve', onPress: async () => {
          try {
            await leaveAPI.approve(id);
            setLeaves(l => l.filter(x => x.id !== id));
          } catch (e) { Alert.alert('Error', 'Failed to approve'); }
        },
      },
    ]);
  };

  const handleReject = (id) => {
    Alert.alert('Reject Leave', 'Reject this leave request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive', onPress: async () => {
          try {
            await leaveAPI.reject(id);
            setLeaves(l => l.filter(x => x.id !== id));
          } catch (e) { Alert.alert('Error', 'Failed to reject'); }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leave Requests</Text>
        <Text style={styles.sub}>{leaves.length} pending</Text>
      </View>

      <FlatList
        data={leaves}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.customerName?.[0] || '?'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.customerName}</Text>
                <Text style={styles.code}>{item.customerCode}</Text>
                <Text style={styles.date}>Leave date: {item.leaveDate}</Text>
              </View>
            </View>
            {item.reason ? <Text style={styles.reason}>"{item.reason}"</Text> : null}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>No pending leave requests</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, paddingTop: 60 },
  back: { color: colors.surface, opacity: 0.8, marginBottom: spacing.sm },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  sub: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.large, padding: spacing.lg, marginBottom: spacing.md, ...shadows.card },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
  info: { flex: 1 },
  name: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textPrimary },
  code: { fontSize: fontSizes.small, color: colors.textSecondary, marginVertical: 2 },
  date: { fontSize: fontSizes.small, color: colors.primary, fontWeight: '600' },
  reason: { fontSize: fontSizes.small, color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.md, paddingLeft: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.border },
  btnRow: { flexDirection: 'row', gap: spacing.sm },
  approveBtn: { flex: 1, backgroundColor: colors.success, borderRadius: radius.medium, padding: spacing.md, alignItems: 'center' },
  approveBtnText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.small },
  rejectBtn: { flex: 1, backgroundColor: '#FEF2F2', borderRadius: radius.medium, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error },
  rejectBtnText: { color: colors.error, fontWeight: '700', fontSize: fontSizes.small },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fontSizes.body, color: colors.textSecondary },
});
