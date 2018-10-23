import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeTradehistorySidepaneNeoComponent } from './exchange-tradehistory-sidepane-neo.component';

describe('ExchangeTradehistorySidepaneNeoComponent', () => {
  let component: ExchangeTradehistorySidepaneNeoComponent;
  let fixture: ComponentFixture<ExchangeTradehistorySidepaneNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeTradehistorySidepaneNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeTradehistorySidepaneNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
