import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletSellNeoComponent } from './exchange-wallet-sell-neo.component';

describe('ExchangeWalletSellNeoComponent', () => {
  let component: ExchangeWalletSellNeoComponent;
  let fixture: ComponentFixture<ExchangeWalletSellNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletSellNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletSellNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
