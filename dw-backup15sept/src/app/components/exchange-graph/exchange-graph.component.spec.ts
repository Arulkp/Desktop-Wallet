import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeGraphComponent } from './exchange-graph.component';

describe('ExchangeGraphComponent', () => {
  let component: ExchangeGraphComponent;
  let fixture: ComponentFixture<ExchangeGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
