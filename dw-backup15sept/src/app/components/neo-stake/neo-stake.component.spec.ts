import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeoStakeComponent } from './neo-stake.component';

describe('NeoStakeComponent', () => {
  let component: NeoStakeComponent;
  let fixture: ComponentFixture<NeoStakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeoStakeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeoStakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
