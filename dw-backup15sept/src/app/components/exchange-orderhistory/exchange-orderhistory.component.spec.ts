import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOrderhistoryComponent } from './exchange-orderhistory.component';

describe('ExchangeOrderhistoryComponent', () => {
  let component: ExchangeOrderhistoryComponent;
  let fixture: ComponentFixture<ExchangeOrderhistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOrderhistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOrderhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
