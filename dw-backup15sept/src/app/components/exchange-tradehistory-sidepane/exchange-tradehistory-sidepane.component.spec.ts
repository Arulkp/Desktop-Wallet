import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeTradehistorySidepaneComponent } from './exchange-tradehistory-sidepane.component';

describe('ExchangeTradehistorySidepaneComponent', () => {
  let component: ExchangeTradehistorySidepaneComponent;
  let fixture: ComponentFixture<ExchangeTradehistorySidepaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeTradehistorySidepaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeTradehistorySidepaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
