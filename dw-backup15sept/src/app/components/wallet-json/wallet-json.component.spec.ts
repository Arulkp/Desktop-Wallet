import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletJsonComponent } from './wallet-json.component';

describe('WalletJsonComponent', () => {
  let component: WalletJsonComponent;
  let fixture: ComponentFixture<WalletJsonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletJsonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
