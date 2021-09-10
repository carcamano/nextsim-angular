import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImoveisComponent } from './imoveis.component';

describe('ImoveisComponent', () => {
  let component: ImoveisComponent;
  let fixture: ComponentFixture<ImoveisComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImoveisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImoveisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
