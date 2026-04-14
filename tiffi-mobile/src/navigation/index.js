import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import useAuthStore from '../store/authStore';
import { colors } from '../theme';

// Auth Screens
import PhoneScreen from '../screens/auth/PhoneScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';

// Owner Screens
import DashboardScreen from '../screens/owner/DashboardScreen';
import DeliveryScreen from '../screens/owner/DeliveryScreen';
import CustomersScreen from '../screens/owner/CustomersScreen';
import MoreScreen from '../screens/owner/MoreScreen';
import AddCustomerScreen from '../screens/owner/AddCustomerScreen';
import CustomerDetailScreen from '../screens/owner/CustomerDetailScreen';
import LeaveManagementScreen from '../screens/owner/LeaveManagementScreen';
import PaymentsScreen from '../screens/owner/PaymentsScreen';
import MenuManagementScreen from '../screens/owner/MenuManagementScreen';

// Customer Screens
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import TrackerScreen from '../screens/customer/TrackerScreen';
import MenuScreen from '../screens/customer/MenuScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function OwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerShown: false,
      }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Delivery" component={DeliveryScreen}
        options={{ tabBarLabel: 'Deliveries' }} />
      <Tab.Screen name="Customers" component={CustomersScreen}
        options={{ tabBarLabel: 'Customers' }} />
      <Tab.Screen name="More" component={MoreScreen}
        options={{ tabBarLabel: 'More' }} />
    </Tab.Navigator>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Tracker" component={TrackerScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, role, isLoading, setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    // Restore session on app launch
    const restoreSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        const storedRole = await SecureStore.getItemAsync('user_role');
        const userId = await SecureStore.getItemAsync('user_id');
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        console.log('[restoreSession] token:', !!token, 'role:', storedRole, 'userId:', userId);
        if (token && storedRole && userId) {
          setAuth({ accessToken: token, refreshToken: refreshToken || '', role: storedRole, userId, isNewUser: false });
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.log('[restoreSession] error:', e.message);
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        ) : role === 'OWNER' ? (
          <>
            <Stack.Screen name="OwnerApp" component={OwnerTabs} />
            <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
            <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
            <Stack.Screen name="LeaveManagement" component={LeaveManagementScreen} />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
            <Stack.Screen name="MenuManagement" component={MenuManagementScreen} />
          </>
        ) : (
          <Stack.Screen name="CustomerApp" component={CustomerTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
