import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketNeoComponent } from './basket-neo.component';

describe('BasketNeoComponent', () => {
  let component: BasketNeoComponent;
  let fixture: ComponentFixture<BasketNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
