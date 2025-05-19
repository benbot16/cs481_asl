use strict;

import { initializeApp } from 'firebase/app';
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
import { firebaseConfig } from './config';

const app = initializeApp(firebaseConfig)

