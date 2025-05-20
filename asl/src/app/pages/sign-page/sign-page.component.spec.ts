import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigningComponent } from './chat-page.component';

describe('SigningComponent', () => {
  let component: SigningComponent;
  let fixture: ComponentFixture<SigningComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SigningComponent]
    });
    fixture = TestBed.createComponent(SigningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
