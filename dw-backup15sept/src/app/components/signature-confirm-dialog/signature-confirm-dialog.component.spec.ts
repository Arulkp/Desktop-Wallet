import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureConfirmDialogComponent } from './signature-confirm-dialog.component';

describe('SignatureConfirmDialogComponent', () => {
  let component: SignatureConfirmDialogComponent;
  let fixture: ComponentFixture<SignatureConfirmDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignatureConfirmDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
