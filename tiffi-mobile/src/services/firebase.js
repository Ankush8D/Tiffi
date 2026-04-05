import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyB1Ud1wPOFUh8CEQxpVbsfvIaEYh8T6KVg',
  authDomain: 'tiffi-app-a9acf.firebaseapp.com',
  projectId: 'tiffi-app-a9acf',
  appId: '1:109280898259:android:c023b4db9338cfb8bbb826',
  messagingSenderId: '109280898259',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
