import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../../services/firebase';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { colors, spacing, radius, fontSizes } from '../../theme';

export default function OTPScreen({ route }) {
  const { verificationId, phone, role } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputs = useRef([]);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (newOtp.every((d) => d !== '')) handleVerify(newOtp.join(''));
  };

  const handleVerify = async (code) => {
    setLoading(true);
    try {
      // Create credential from verificationId + OTP code
      const credential = auth.PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await auth().signInWithCredential(credential);
      const idToken = await userCredential.user.getIdToken();

      const res = await authAPI.verify(idToken, role);
      await SecureStore.setItemAsync('user_role', res.data.role);
      await SecureStore.setItemAsync('user_id', String(res.data.userId));
      await setAuth(res.data);
    } catch (error) {
      Alert.alert('Error', error?.message || error?.code || JSON.stringify(error));
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.sub}>Sent to +91 {phone}</Text>

      <View style={styles.otpRow}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(r) => (inputs.current[idx] = r)}
            style={[styles.otpBox, digit && styles.otpBoxFilled]}
            value={digit}
            onChangeText={(v) => handleChange(v, idx)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            autoFocus={idx === 0}
          />
        ))}
      </View>

      {loading && <Text style={styles.verifying}>Verifying...</Text>}

      {countdown > 0 ? (
        <Text style={styles.resendWait}>Resend OTP in {countdown}s</Text>
      ) : (
        <TouchableOpacity>
          <Text style={styles.resend}>Resend OTP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xxl, justifyContent: 'center' },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  sub: { fontSize: fontSizes.body, color: colors.textSecondary, marginBottom: spacing.xxxl },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxl },
  otpBox: {
    width: 48, height: 56, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.medium, textAlign: 'center', fontSize: fontSizes.h3,
    fontWeight: '700', color: colors.textPrimary, backgroundColor: colors.surface,
  },
  otpBoxFilled: { borderColor: colors.primary, backgroundColor: '#FFF5EE' },
  verifying: { textAlign: 'center', color: colors.primary, fontSize: fontSizes.body, marginBottom: spacing.lg },
  resendWait: { textAlign: 'center', color: colors.textSecondary, fontSize: fontSizes.small },
  resend: { textAlign: 'center', color: colors.primary, fontSize: fontSizes.body, fontWeight: '600' },
});
