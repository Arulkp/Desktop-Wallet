import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeDepositewithdrawNeoComponent } from './exchange-depositewithdraw-neo.component';

describe('ExchangeDepositewithdrawNeoComponent', () => {
  let component: ExchangeDepositewithdrawNeoComponent;
  let fixture: ComponentFixture<ExchangeDepositewithdrawNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeDepositewithdrawNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeDepositewithdrawNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
