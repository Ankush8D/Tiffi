import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyB1Ud1wPOFUh8CEQxpVbsfvIaEYh8T6KVg',
  authDomain: 'tiffi-app-a9acf.firebaseapp.com',
  projectId: 'tiffi-app-a9acf',
  appId: '1:109280898259:android:c023b4db9338cfb8bbb826',
  messagingSenderId: '109280898259',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getApps().length === 1
  ? initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) })
  : getAuth(app);
export default app;
