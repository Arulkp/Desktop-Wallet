import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletSelectComponent } from './exchange-wallet-select.component';

describe('ExchangeWalletSelectComponent', () => {
  let component: ExchangeWalletSelectComponent;
  let fixture: ComponentFixture<ExchangeWalletSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
