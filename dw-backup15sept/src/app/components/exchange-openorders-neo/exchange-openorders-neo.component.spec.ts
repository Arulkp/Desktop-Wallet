import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOpenordersNeoComponent } from './exchange-openorders-neo.component';

describe('ExchangeOpenordersNeoComponent', () => {
  let component: ExchangeOpenordersNeoComponent;
  let fixture: ComponentFixture<ExchangeOpenordersNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOpenordersNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOpenordersNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
