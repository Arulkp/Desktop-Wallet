import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletBuyComponent } from './exchange-wallet-buy.component';

describe('ExchangeWalletBuyComponent', () => {
  let component: ExchangeWalletBuyComponent;
  let fixture: ComponentFixture<ExchangeWalletBuyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletBuyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
