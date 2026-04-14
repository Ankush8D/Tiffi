import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { customerAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

export default function CustomersScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);

  const load = async (reset = false) => {
    try {
      const res = await customerAPI.list({ search: search || undefined, page: reset ? 0 : page });
      const list = res.data?.content || [];
      setCustomers(reset ? list : (prev) => [...prev, ...list]);
      if (!reset) setPage((p) => p + 1);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(true); }, [search]);

  const getStatusColor = (status) => ({ active: colors.success, paused: colors.warning, expired: colors.error }[status] || colors.border);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <TextInput
          style={styles.search}
          placeholder="Search by name or TF-001..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.code}>{item.customerCode} • {item.phone}</Text>
              <Text style={styles.zone}>{item.zone || 'No zone'}</Text>
            </View>
            <View style={styles.right}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={styles.tiffins}>{item.tiffinsRemaining} left</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No customers found</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddCustomer')}>
        <Text style={styles.fabText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, paddingBottom: spacing.lg },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface, marginBottom: spacing.md },
  search: { backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.md, fontSize: fontSizes.body, color: colors.textPrimary },
  card: { flexDirection: 'row', alignItems: 'center', margin: spacing.md, marginBottom: 0, backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.lg, ...shadows.card },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
  info: { flex: 1 },
  name: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textPrimary },
  code: { fontSize: fontSizes.small, color: colors.textSecondary, marginVertical: 2 },
  zone: { fontSize: fontSizes.small, color: colors.textSecondary },
  right: { alignItems: 'center', gap: spacing.xs },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  tiffins: { fontSize: fontSizes.small, fontWeight: '700', color: colors.textSecondary },
  empty: { padding: spacing.huge, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: fontSizes.body },
  fab: { position: 'absolute', bottom: spacing.xxl, right: spacing.xxl, backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl },
  fabText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
});
