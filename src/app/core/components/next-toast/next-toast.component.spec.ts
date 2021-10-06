import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextToastComponent } from './next-toast.component';

describe('NextToastComponent', () => {
  let component: NextToastComponent;
  let fixture: ComponentFixture<NextToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NextToastComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NextToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
