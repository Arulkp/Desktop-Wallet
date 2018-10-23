import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOrderbookSidepaneNeoComponent } from './exchange-orderbook-sidepane-neo.component';

describe('ExchangeOrderbookSidepaneNeoComponent', () => {
  let component: ExchangeOrderbookSidepaneNeoComponent;
  let fixture: ComponentFixture<ExchangeOrderbookSidepaneNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOrderbookSidepaneNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOrderbookSidepaneNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
