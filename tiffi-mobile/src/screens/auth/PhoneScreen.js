import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { auth } from '../../services/firebase';
import { colors, spacing, radius, fontSizes } from '../../theme';

export default function PhoneScreen({ navigation, route }) {
  const { role } = route.params;
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const cleaned = phone.trim().replace(/\s/g, '');
    if (cleaned.length !== 10) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber('+91' + cleaned);
      navigation.navigate('OTP', { confirmation, phone: cleaned, role });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Enter your mobile number</Text>
      <Text style={styles.sub}>
        {role === 'OWNER' ? 'Owner login' : 'Customer login'} — We'll send you an OTP
      </Text>

      <View style={styles.inputRow}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+91</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="9876543210"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[styles.btn, (!phone || loading) && styles.btnDisabled]}
        onPress={handleSendOTP}
        disabled={!phone || loading}>
        <Text style={styles.btnText}>{loading ? 'Sending...' : 'Get OTP'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xxl, justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: spacing.xxl },
  backText: { fontSize: fontSizes.body, color: colors.primary },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  sub: { fontSize: fontSizes.body, color: colors.textSecondary, marginBottom: spacing.xxxl },
  inputRow: { flexDirection: 'row', borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.medium, overflow: 'hidden', marginBottom: spacing.xxl, backgroundColor: colors.surface },
  prefix: { backgroundColor: colors.border, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  prefixText: { fontSize: fontSizes.body, fontWeight: '600', color: colors.textPrimary },
  input: { flex: 1, padding: spacing.lg, fontSize: fontSizes.h3, color: colors.textPrimary },
  btn: { backgroundColor: colors.primary, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.surface, fontSize: fontSizes.body, fontWeight: '700' },
});
