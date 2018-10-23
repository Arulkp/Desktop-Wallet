import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeEthComponent } from './exchange-eth.component';

describe('ExchangeEthComponent', () => {
  let component: ExchangeEthComponent;
  let fixture: ComponentFixture<ExchangeEthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeEthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeEthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
