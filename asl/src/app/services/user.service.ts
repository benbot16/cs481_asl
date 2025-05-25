import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithRedirect,
  signInWithPopup,
  signInWithEmailAndPassword,
  signInAnonymously,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  user,
  getAuth,
  User,
  EmailAuthProvider,
  linkWithCredential,
} from '@angular/fire/auth';
import { map, switchMap, firstValueFrom, filter, Observable, Subscription } from 'rxjs';
import {
  doc,
  docData,
  DocumentReference,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  collectionData,
  Timestamp,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  FieldValue
} from '@angular/fire/firestore';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Router } from '@angular/router';

type UserData = {
  first: string | null,
  last: string | null,
  age: number | null,
  uid: string | null,
  messages: string[],
};


@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  router: Router = inject(Router);
  private provider = new GoogleAuthProvider();
  LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

  // observable that is updated when the auth state changes
  user$ = user(this.auth);
  currentUser: User | null = this.auth.currentUser;
  userSubscription: Subscription;

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
        this.currentUser = aUser;
    });
  }

  // Signup
  signUp(email: string | null | undefined, password: string | null | undefined, confirm: string | null | undefined): User | null {
    if(!email || !password || !confirm) {
      return null;
    }
    if(password != confirm) {
      return null;
    }

    if(!this.isAnonLoggedIn()) {
      createUserWithEmailAndPassword(this.auth, email, password).then((result) => {
        const user = result.user;
        this.router.navigate(['/', 'sign']);
        return user;
      }).catch((error) => {
        console.log('Sign up error: ' + error);
      });
    } else {
      // anon is logged in, so currentUser exists
      const cred = EmailAuthProvider.credential(email, password);
      linkWithCredential(this.auth.currentUser!!,  cred).then((newcred) => {
        const user = newcred.user;
        this.router.navigate(['/', 'sign']);
        return user;
      }).catch((error) => {
          console.log('Account upgrade error: ' + error);
        });
    }
    return null;
  }

  // Login
  login(email: string | null | undefined, password: string | null | undefined) {
    if(!email || !password) {
      return false;
    }
    signInWithEmailAndPassword(this.auth, email, password).then((result) => {
      if(!result) {
        return false;
      }
      this.router.navigate(['/', 'sign'])
      return true;
    }).catch((error) => {
    console.log('Sign in error: ' + error);
  });
    return false
  }

  // OAuth
  loginGoogle() {
    signInWithPopup(this.auth, this.provider).then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        this.router.navigate(['/', 'sign']);
        return credential;
    }).catch((error) => {
        console.log('Sign in error: ' + error);
      });
  }

  // Anon
  loginAnon() {
    // Since anons can get here, we don't want them double-anoning
    if(this.currentUser) {
      this.router.navigate(['/', 'sign']);
    }
    signInAnonymously(this.auth).then(() => {
      this.router.navigate(['/', 'sign']);
    });
  }

  isAnonLoggedIn() {
    if(this.auth == null || this.auth.currentUser == null) {
      return false;
    } else {
      if(this.auth.currentUser.isAnonymous) {
        return true;
      }
    }
    return false;
  }

  // Logout
  logout() {
    signOut(this.auth).then((result) => {
      this.router.navigate(['/', 'login']);
    }).catch((error) => {
      console.log('Sign out error: ' + error.code + "; " + error.message);
      });
  }

  async initUser(user: User | null, fname: string | null, lname: string | null, a: number | null) {
    const userData: UserData = {
      first: fname,
      last: lname,
      age: a,
      uid: user?.uid as string,
      messages: [],
    }
    if(!user || !fname || !lname || !a) {
      return false;
    }
    try {
      await setDoc(doc(this.firestore, "user_profiles", user?.uid), userData);
      return true;
    } catch (error) {
      console.error("Error initializing user: ", error);
      return false;
    }
  }

  // Update a user's data
  async updateData(path: string, data: any) {}

  // Delete a user's data
  async deleteData(path: string) {}

  getFirstName(path: string) {}

  getLastName(path: string) {}

  getAge(path: string) {}

  getQueryHistory(path: string) {}

  getUUID(path: string) {}
}
