import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeDepositewithdrawComponent } from './exchange-depositewithdraw.component';

describe('ExchangeDepositewithdrawComponent', () => {
  let component: ExchangeDepositewithdrawComponent;
  let fixture: ComponentFixture<ExchangeDepositewithdrawComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeDepositewithdrawComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeDepositewithdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
