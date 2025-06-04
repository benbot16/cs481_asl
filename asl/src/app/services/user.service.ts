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
  sendEmailVerification,
  updateProfile,
  updateEmail,
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
};


@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  router: Router = inject(Router);
  private provider = new GoogleAuthProvider();

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
  async signUp(email: string | null | undefined, password: string | null | undefined, confirm: string | null | undefined): Promise<User | null> {
    if(!email || !password || !confirm) {
      console.log("Missing email/password")
      return null;
    }
    if(password != confirm) {
      console.log("Password doesn't match")
      return null;
    }

    if(!this.isAnonLoggedIn()) {
      await createUserWithEmailAndPassword(this.auth, email, password).then((result) => {
        const user = result.user;
        return user;
      }).catch((error) => {
        console.log('Sign up error: ' + error);
      });
    } else {
      // anon is logged in, so currentUser exists
      const cred = EmailAuthProvider.credential(email, password);
      await linkWithCredential(this.auth.currentUser!!,  cred).then((newcred) => {
        const user = newcred.user;
        return user;
      }).catch((error) => {
          console.log('Account upgrade error: ' + error);
      });
    }
    return null;
  }

  // Login
  async login(email: string | null | undefined, password: string | null | undefined) {
    if(!email || !password) {
      return false;
    }
    await signInWithEmailAndPassword(this.auth, email, password).then((result) => {
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

  async initUser(fname: string | null, lname: string | null, a: number | null) {
    let ourUser = this.auth.currentUser!!
    const userData: UserData = {
      first: fname,
      last: lname,
      age: a,
    }
    if(!user || !fname || !lname || !a) {
      return false;
    }
    try {
      await sendEmailVerification(ourUser).catch((err) => console.error("Error sending email verification: ", err));
      await updateProfile(this.auth.currentUser!!, {displayName: fname}).catch((err) => console.log("Error updating profile: ", err));
      await setDoc(doc(this.firestore, "user_profiles", ourUser?.uid), userData);
      return true;
    } catch (error) {
      console.error("Error initializing user: ", error);
      return false;
    }
  }

  // Update a user's data
  async updateData(fname: string | null, lname: string | null, a: number | null, email: string | null, password: string | null | undefined, confirm: string | null | undefined): Promise<boolean | null> {
    if(!password || !confirm || password != confirm) {
      return false
    }

    if(email != null) {
      await updateEmail(this.auth.currentUser!!, email).catch((err) => console.log("Error updating email: ", err));
    }

    const userData: UserData = {
      first: fname,
      last: lname,
      age: a,
    }
    await setDoc(doc(this.firestore, "user_profiles", this.auth.currentUser!!.uid), userData);
    return true;
  }

  // Delete a user's data
  async deleteData() {
  }

  async getFirstName(): Promise<string> {
    const docref = doc(this.firestore, "user_profiles", this.auth.currentUser!!.uid);
    const docu = await getDoc(docref);
    const doc_data = docu.data();
    if(doc_data) {
      console.log(doc_data["first"]);
      return doc_data["first"];
    } else {
      return "";
    }
  }


  async getLastName(): Promise<string> {
    const docref = doc(this.firestore, "user_profiles", this.auth.currentUser!!.uid);
    const docu = await getDoc(docref);
    const doc_data = docu.data();
    if(doc_data) {
      return doc_data["last"];
    } else {
      return "";
    }
  }

  async getAge(): Promise<number> {
    const docref = doc(this.firestore, "user_profiles", this.auth.currentUser!!.uid);
    const docu = await getDoc(docref);
    const doc_data = docu.data();
    if(doc_data) {
      return doc_data["age"];
    } else {
      return 0;
    }
  }
}
