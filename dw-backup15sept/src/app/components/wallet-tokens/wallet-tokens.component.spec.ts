import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletTokensComponent } from './wallet-tokens.component';

describe('WalletTokensComponent', () => {
  let component: WalletTokensComponent;
  let fixture: ComponentFixture<WalletTokensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletTokensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
