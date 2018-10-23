import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketNewComponent } from './basket-new.component';

describe('BasketNewComponent', () => {
  let component: BasketNewComponent;
  let fixture: ComponentFixture<BasketNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
