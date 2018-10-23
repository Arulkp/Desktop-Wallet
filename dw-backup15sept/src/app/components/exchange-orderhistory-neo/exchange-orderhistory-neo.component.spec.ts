import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOrderhistoryNeoComponent } from './exchange-orderhistory-neo.component';

describe('ExchangeOrderhistoryNeoComponent', () => {
  let component: ExchangeOrderhistoryNeoComponent;
  let fixture: ComponentFixture<ExchangeOrderhistoryNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOrderhistoryNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOrderhistoryNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
