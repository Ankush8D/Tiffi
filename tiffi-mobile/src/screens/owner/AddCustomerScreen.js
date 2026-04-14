import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { customerAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes } from '../../theme';

export default function AddCustomerScreen({ navigation, route }) {
  const existing = route.params?.customer;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name || '',
    phone: existing?.phone || '',
    address: existing?.address || '',
    zone: existing?.zone || '',
    tiffinsTotal: String(existing?.tiffinsTotal || '26'),
    subscriptionStart: existing?.subscriptionStart || new Date().toISOString().split('T')[0],
    subscriptionEnd: existing?.subscriptionEnd || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const autoEndDate = (start, total) => {
    if (!start) return '';
    const d = new Date(start);
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const handleStartChange = (val) => {
    set('subscriptionStart', val);
    set('subscriptionEnd', autoEndDate(val, form.tiffinsTotal));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.phone.trim() || form.phone.length !== 10) return 'Valid 10-digit phone required';
    if (!form.tiffinsTotal || isNaN(form.tiffinsTotal)) return 'Tiffins count required';
    if (!form.subscriptionStart) return 'Start date required';
    if (!form.subscriptionEnd) return 'End date required';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { Alert.alert('Validation', err); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        tiffinsTotal: parseInt(form.tiffinsTotal),
        tiffinsRemaining: isEdit ? existing.tiffinsRemaining : parseInt(form.tiffinsTotal),
      };
      if (isEdit) {
        await customerAPI.update(existing.id, payload);
      } else {
        await customerAPI.create(payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{isEdit ? 'Edit Customer' : 'Add Customer'}</Text>
        </View>

        <View style={styles.form}>
          <Field label="Full Name *" value={form.name} onChangeText={v => set('name', v)} placeholder="Rahul Sharma" />
          <Field label="Phone Number *" value={form.phone} onChangeText={v => set('phone', v)} placeholder="9876543210" keyboardType="number-pad" maxLength={10} />
          <Field label="Address" value={form.address} onChangeText={v => set('address', v)} placeholder="Sector 10, Bhopal" multiline />
          <Field label="Zone" value={form.zone} onChangeText={v => set('zone', v)} placeholder="Zone A, MP Nagar..." />
          <Field label="Tiffins Per Month *" value={form.tiffinsTotal} onChangeText={v => set('tiffinsTotal', v)} keyboardType="number-pad" placeholder="26" />
          <Field label="Start Date * (YYYY-MM-DD)" value={form.subscriptionStart} onChangeText={handleStartChange} placeholder="2026-04-01" />
          <Field label="End Date * (YYYY-MM-DD)" value={form.subscriptionEnd} onChangeText={v => set('subscriptionEnd', v)} placeholder="2026-04-30" />

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.btnText}>{isEdit ? 'Save Changes' : 'Add Customer'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, props.multiline && styles.inputMulti]} placeholderTextColor={colors.textSecondary} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, paddingTop: 60 },
  back: { color: colors.surface, opacity: 0.8, marginBottom: spacing.sm },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  form: { padding: spacing.lg },
  fieldWrap: { marginBottom: spacing.lg },
  label: { fontSize: fontSizes.small, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.lg, fontSize: fontSizes.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center', marginTop: spacing.md },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
});
