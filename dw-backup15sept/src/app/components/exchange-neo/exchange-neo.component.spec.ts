import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeNeoComponent } from './exchange-neo.component';

describe('ExchangeNeoComponent', () => {
  let component: ExchangeNeoComponent;
  let fixture: ComponentFixture<ExchangeNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
