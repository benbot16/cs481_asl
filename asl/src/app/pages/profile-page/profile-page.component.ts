import { Component, inject } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule, Validators} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
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

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class ProfilePageComponent {
  profileForm = new FormGroup({
    fname: new FormControl('', [Validators.required, Validators.pattern('[A-Za-z]+')]),
    lname: new FormControl('', [Validators.required, Validators.pattern('[A-Za-z]+')]),
    age: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(18)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  });

  constructor() {
    this.userService.getFirstName().then((data) => {
      this.first_name = data;
    });
    this.userService.getLastName().then((data) => {
      this.last_name = data;
    });
    this.userService.getAge().then((data) => {
      this.age_a = data;
    });
  }

  get fname() {
    return this.profileForm.get('fname');
  }

  get lname() {
    return this.profileForm.get('lname');
  }

  get age() {
    return this.profileForm.get('age');
  }

  get email() {
    return this.profileForm.get('email');
  }

  get password() {
    return this.profileForm.get('password');
  }

  get confirmPassword() {
    return this.profileForm.get('confirmPassword');
  }

  editing = false;
  userService = inject(UserService);
  user$ = this.userService.user$;
  first_name : string = "";
  last_name : string = "";
  age_a : number = 0;

  edit(edit: boolean) {
    this.editing = edit;
  }

  modifyProfile() {
    var fn = (this.fname?.dirty && this.fname?.valid ? this.fname.value : null);
    var ln = (this.lname?.dirty && this.lname?.valid ? this.lname.value : null);
    var ag = (this.age?.dirty && this.age?.valid ? parseInt(this.age.value!!) : null);
    var mail = (this.email?.dirty && this.email?.valid ? this.email.value : null);
    this.userService.updateData(fn, ln, ag, mail, this.password?.value, this.confirmPassword?.value);
  }
}
