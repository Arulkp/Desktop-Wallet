import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketWalletComponent } from './basket-wallet.component';

describe('BasketWalletComponent', () => {
  let component: BasketWalletComponent;
  let fixture: ComponentFixture<BasketWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
