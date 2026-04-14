import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import useAuthStore from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

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

function TabIcon({ emoji, focused, color }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
  );
}

function OwnerTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBorder,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 58,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Poppins_500Medium',
          marginTop: 2,
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🏠" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Delivery"
        component={DeliveryScreen}
        options={{
          tabBarLabel: 'Deliveries',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🚴" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          tabBarLabel: 'Customers',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="👥" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="⚙️" focused={focused} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function CustomerTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBorder,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 58,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Poppins_500Medium',
          marginTop: 2,
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🏠" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tracker"
        component={TrackerScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="📅" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🍱" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="👤" focused={focused} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, role, isLoading, setAuth, setLoading } = useAuthStore();
  const { theme } = useTheme();

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
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
