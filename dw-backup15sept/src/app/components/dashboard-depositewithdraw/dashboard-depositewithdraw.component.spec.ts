import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDepositewithdrawComponent } from './dashboard-depositewithdraw.component';

describe('DashboardDepositewithdrawComponent', () => {
  let component: DashboardDepositewithdrawComponent;
  let fixture: ComponentFixture<DashboardDepositewithdrawComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardDepositewithdrawComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDepositewithdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
