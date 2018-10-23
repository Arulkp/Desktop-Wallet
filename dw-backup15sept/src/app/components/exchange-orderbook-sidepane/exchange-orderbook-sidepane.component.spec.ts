import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOrderhistorySidepaneComponent } from './exchange-orderhistory-sidepane.component';

describe('ExchangeOrderhistorySidepaneComponent', () => {
  let component: ExchangeOrderhistorySidepaneComponent;
  let fixture: ComponentFixture<ExchangeOrderhistorySidepaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOrderhistorySidepaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOrderhistorySidepaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
