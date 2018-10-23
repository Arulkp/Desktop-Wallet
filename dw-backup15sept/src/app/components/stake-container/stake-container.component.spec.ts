import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeContainerComponent } from './stake-container.component';

describe('StakeContainerComponent', () => {
  let component: StakeContainerComponent;
  let fixture: ComponentFixture<StakeContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StakeContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakeContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
