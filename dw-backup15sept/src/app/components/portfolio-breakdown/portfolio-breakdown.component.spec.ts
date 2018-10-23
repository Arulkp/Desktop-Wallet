import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioBreakdownComponent } from './portfolio-breakdown.component';

describe('PortfolioBreakdownComponent', () => {
  let component: PortfolioBreakdownComponent;
  let fixture: ComponentFixture<PortfolioBreakdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioBreakdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
