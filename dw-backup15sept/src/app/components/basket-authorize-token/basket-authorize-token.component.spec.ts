import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketAuthorizeTokenComponent } from './basket-authorize-token.component';

describe('BasketAuthorizeTokenComponent', () => {
  let component: BasketAuthorizeTokenComponent;
  let fixture: ComponentFixture<BasketAuthorizeTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketAuthorizeTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketAuthorizeTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
