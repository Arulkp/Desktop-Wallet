import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangePlatformTokenSelectNeoComponent } from './exchange-platform-token-select-neo.component';

describe('ExchangePlatformTokenSelectNeoComponent', () => {
  let component: ExchangePlatformTokenSelectNeoComponent;
  let fixture: ComponentFixture<ExchangePlatformTokenSelectNeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangePlatformTokenSelectNeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangePlatformTokenSelectNeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
