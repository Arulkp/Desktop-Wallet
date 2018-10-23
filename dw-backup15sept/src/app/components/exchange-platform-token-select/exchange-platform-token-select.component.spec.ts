import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangePlatformTokenSelectComponent } from './exchange-platform-token-select.component';

describe('ExchangePlatformTokenSelectComponent', () => {
  let component: ExchangePlatformTokenSelectComponent;
  let fixture: ComponentFixture<ExchangePlatformTokenSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangePlatformTokenSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangePlatformTokenSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
