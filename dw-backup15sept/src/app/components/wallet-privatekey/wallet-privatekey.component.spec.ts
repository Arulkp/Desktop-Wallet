import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletPrivatekeyComponent } from './wallet-privatekey.component';

describe('WalletPrivatekeyComponent', () => {
  let component: WalletPrivatekeyComponent;
  let fixture: ComponentFixture<WalletPrivatekeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletPrivatekeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletPrivatekeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
