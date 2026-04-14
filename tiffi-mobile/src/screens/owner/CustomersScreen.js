import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { customerAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { GradBg } from '../../components/Grad';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { spacing, fontSizes, fonts } from '../../theme';

export default function CustomersScreen({ navigation }) {
  const { theme, isDark } = useTheme();
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

  if (loading) return (
    <GradBg colors={isDark ? ['#0B0E1A', '#0B0E1A'] : [theme.background, theme.background]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </GradBg>
  );

  return (
    <GradBg colors={isDark ? ['#0B0E1A', '#0B0E1A'] : [theme.background, theme.background]} style={{ flex: 1 }}>
      <ScreenHeader
        title="Customers"
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddCustomer')}
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: 20,
              marginRight: spacing.sm,
            }}
            activeOpacity={0.8}>
            <Text style={{ color: '#FFF', fontSize: fontSizes.sm, fontFamily: fonts.bold }}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={customers}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={theme.primary} />}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.sm }}
        ListHeaderComponent={
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or TF-001..."
            style={{ marginHorizontal: 0, marginBottom: spacing.md }}
          />
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
            style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md }}>
            <Avatar name={item.name} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontSize: fontSizes.body, fontFamily: fonts.semibold }}>{item.name}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: fontSizes.sm, fontFamily: fonts.regular, marginTop: 2 }}>
                {item.customerCode} • {item.phone}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: fontSizes.sm, fontFamily: fonts.regular, marginTop: 1 }}>
                {item.zone || 'No zone'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
              <Badge status={item.status} />
              <Text style={{ color: theme.textSecondary, fontSize: fontSizes.sm, fontFamily: fonts.semibold, marginTop: 4 }}>
                {item.tiffinsRemaining} left
              </Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState emoji="👥" title="No customers found" subtitle="Add your first customer using the + Add button above" />
        }
      />
    </GradBg>
  );
}
