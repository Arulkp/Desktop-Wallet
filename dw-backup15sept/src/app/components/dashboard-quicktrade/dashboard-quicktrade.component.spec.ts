import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardQuicktradeComponent } from './dashboard-quicktrade.component';

describe('DashboardQuicktradeComponent', () => {
  let component: DashboardQuicktradeComponent;
  let fixture: ComponentFixture<DashboardQuicktradeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardQuicktradeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardQuicktradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
