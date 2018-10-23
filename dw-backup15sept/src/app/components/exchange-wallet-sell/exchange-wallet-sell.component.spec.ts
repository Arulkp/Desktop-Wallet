import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletSellComponent } from './exchange-wallet-sell.component';

describe('ExchangeWalletSellComponent', () => {
  let component: ExchangeWalletSellComponent;
  let fixture: ComponentFixture<ExchangeWalletSellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletSellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletSellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
