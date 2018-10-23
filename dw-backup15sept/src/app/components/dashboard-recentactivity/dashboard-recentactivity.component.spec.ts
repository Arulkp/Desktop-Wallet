import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRecentactivityComponent } from './dashboard-recentactivity.component';

describe('DashboardRecentactivityComponent', () => {
  let component: DashboardRecentactivityComponent;
  let fixture: ComponentFixture<DashboardRecentactivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardRecentactivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardRecentactivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
