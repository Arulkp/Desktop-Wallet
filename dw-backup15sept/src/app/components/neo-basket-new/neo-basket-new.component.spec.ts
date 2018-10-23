import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeoBasketNewComponent } from './neo-basket-new.component';

describe('NeoBasketNewComponent', () => {
  let component: NeoBasketNewComponent;
  let fixture: ComponentFixture<NeoBasketNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeoBasketNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeoBasketNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
