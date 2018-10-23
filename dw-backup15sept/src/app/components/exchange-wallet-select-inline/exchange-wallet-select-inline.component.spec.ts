import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletSelectInlineComponent } from './exchange-wallet-select-inline.component';

describe('ExchangeWalletSelectInlineComponent', () => {
  let component: ExchangeWalletSelectInlineComponent;
  let fixture: ComponentFixture<ExchangeWalletSelectInlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletSelectInlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletSelectInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
