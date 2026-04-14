import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, RefreshControl,
} from 'react-native';
import { menuAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

// ── Menu item catalogue ──────────────────────────────────────────────────────
const MENU_CATALOGUE = [
  {
    category: 'Dal / Curry',
    items: [
      'Dal tadka', 'Dal makhani', 'Rajma', 'Chole', 'Kadhi',
      'Moong dal', 'Arhar dal', 'Palak dal', 'Sambar',
    ],
  },
  {
    category: 'Sabzi',
    items: [
      'Aloo gobi', 'Mix veg', 'Bhindi fry', 'Baingan bharta',
      'Matar paneer', 'Paneer butter masala', 'Palak paneer',
      'Aloo matar', 'Jeera aloo', 'Lauki', 'Tinda', 'Karela',
    ],
  },
  {
    category: 'Rice',
    items: [
      'Steamed rice', 'Jeera rice', 'Veg pulao', 'Chole rice',
      'Rajma rice', 'Kadhi rice',
    ],
  },
  {
    category: 'Roti / Bread',
    items: [
      '2 rotis', '3 rotis', '4 rotis', 'Paratha', '2 parathas',
      'Puri', 'Missi roti',
    ],
  },
  {
    category: 'Extras',
    items: [
      'Salad', 'Raita', 'Papad', 'Pickle', 'Chutney',
      'Kheer', 'Halwa', 'Gulab jamun',
    ],
  },
];

// ── Helper: parse saved description back to selected set ────────────────────
function descriptionToSet(desc) {
  if (!desc) return new Set();
  return new Set(desc.split(', ').map(s => s.trim()).filter(Boolean));
}

// ── Sub-component: meal picker section ──────────────────────────────────────
function MealPicker({ emoji, title, isSet, selected, onToggle, onClear, onSave, saving }) {
  const description = Array.from(selected).join(', ');

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.mealHeader}>
        <Text style={styles.mealEmoji}>{emoji}</Text>
        <Text style={styles.mealTitle}>{title}</Text>
        {isSet && <View style={styles.setDot} />}
        {selected.size > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected chips preview */}
      {selected.size > 0 ? (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Today's {title}:</Text>
          <Text style={styles.previewText}>{description}</Text>
        </View>
      ) : (
        <Text style={styles.hint}>Tap items below to build the menu</Text>
      )}

      {/* Catalogue */}
      {MENU_CATALOGUE.map(group => (
        <View key={group.category} style={styles.group}>
          <Text style={styles.groupTitle}>{group.category}</Text>
          <View style={styles.chipRow}>
            {group.items.map(item => {
              const active = selected.has(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => onToggle(item)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {active ? '✓ ' : ''}{item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveBtn, (saving || selected.size === 0) && styles.saveBtnDisabled]}
        onPress={() => onSave(description)}
        disabled={saving || selected.size === 0}>
        {saving
          ? <ActivityIndicator color={colors.surface} />
          : <Text style={styles.saveBtnText}>
              {isSet ? `Update ${title}` : `Set ${title}`}
              {selected.size > 0 ? ` (${selected.size} items)` : ''}
            </Text>}
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function MenuManagementScreen({ navigation }) {
  const [menu, setMenu] = useState({ lunch: null, dinner: null, date: '' });
  const [lunchSelected, setLunchSelected] = useState(new Set());
  const [dinnerSelected, setDinnerSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [savingLunch, setSavingLunch] = useState(false);
  const [savingDinner, setSavingDinner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await menuAPI.getToday();
      const data = res.data;
      setMenu(data);
      setLunchSelected(descriptionToSet(data.lunch));
      setDinnerSelected(descriptionToSet(data.dinner));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (setter) => (item) => {
    setter(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  const saveMeal = async (mealType, description, setSaving) => {
    if (!description.trim()) return;
    setSaving(true);
    try {
      const res = await menuAPI.setMenu(mealType, description);
      setMenu(res.data);
      Alert.alert('Saved!', `${mealType === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'} menu updated.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Menu Management</Text>
        <Text style={styles.sub}>{menu.date || new Date().toISOString().split('T')[0]}</Text>
      </View>

      <MealPicker
        emoji="☀️"
        title="Lunch"
        isSet={!!menu.lunch}
        selected={lunchSelected}
        onToggle={toggle(setLunchSelected)}
        onClear={() => setLunchSelected(new Set())}
        onSave={(desc) => saveMeal('lunch', desc, setSavingLunch)}
        saving={savingLunch}
      />

      <MealPicker
        emoji="🌙"
        title="Dinner"
        isSet={!!menu.dinner}
        selected={dinnerSelected}
        onToggle={toggle(setDinnerSelected)}
        onClear={() => setDinnerSelected(new Set())}
        onSave={(desc) => saveMeal('dinner', desc, setSavingDinner)}
        saving={savingDinner}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, paddingTop: 60 },
  back: { color: colors.surface, opacity: 0.8, marginBottom: spacing.sm },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  sub: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginTop: 2 },

  card: { margin: spacing.lg, marginBottom: 0, backgroundColor: colors.surface, borderRadius: radius.large, padding: spacing.lg, ...shadows.card },

  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  mealEmoji: { fontSize: 22, marginRight: spacing.sm },
  mealTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  setDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: spacing.sm },
  clearBtn: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  clearBtnText: { fontSize: fontSizes.small, color: colors.textSecondary },

  previewBox: { backgroundColor: colors.background, borderRadius: radius.medium, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary },
  previewLabel: { fontSize: fontSizes.small, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  previewText: { fontSize: fontSizes.small, color: colors.textPrimary, lineHeight: 20 },

  hint: { fontSize: fontSizes.small, color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.md },

  group: { marginBottom: spacing.md },
  groupTitle: { fontSize: fontSizes.small, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSizes.small, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: colors.surface, fontWeight: '700' },

  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center', marginTop: spacing.md },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
});
