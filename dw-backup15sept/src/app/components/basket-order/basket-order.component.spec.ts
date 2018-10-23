import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketOrderComponent } from './basket-order.component';

describe('BasketOrderComponent', () => {
  let component: BasketOrderComponent;
  let fixture: ComponentFixture<BasketOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
