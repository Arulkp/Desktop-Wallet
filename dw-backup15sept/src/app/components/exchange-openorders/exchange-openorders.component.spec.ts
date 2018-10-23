import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOpenordersComponent } from './exchange-openorders.component';

describe('ExchangeOpenordersComponent', () => {
  let component: ExchangeOpenordersComponent;
  let fixture: ComponentFixture<ExchangeOpenordersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOpenordersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOpenordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
