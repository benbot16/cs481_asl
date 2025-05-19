use strict;

// Firebase app initialization
import { initializeApp } from 'firebase/app';

// Firebase libraries for use
import {
  GoogleAuthProvider,
  User,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  DatabaseReference,
  Query,
  child,
  connectDatabaseEmulator,
  getDatabase,
  limitToLast,
  off,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  runTransaction,
  set,
  update,
} from 'firebase/database';

// Import the config from secrets
import { firebaseConfig } from './config';

const app = initializeApp(firebaseConfig)


