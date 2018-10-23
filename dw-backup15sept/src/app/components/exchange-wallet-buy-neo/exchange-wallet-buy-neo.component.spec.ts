import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletBuyNeoComponent } from './exchange-wallet-buy-neo.component';

describe('ExchangeWalletBuyNeoComponent', () => {
  let component: ExchangeWalletBuyNeoComponent;
  let fixture: ComponentFixture<ExchangeWalletBuyNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletBuyNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletBuyNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
