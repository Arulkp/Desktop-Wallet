import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionConfirmDialogComponent } from './transaction-confirm-dialog.component';

describe('TransactionConfirmDialogComponent', () => {
  let component: TransactionConfirmDialogComponent;
  let fixture: ComponentFixture<TransactionConfirmDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionConfirmDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
