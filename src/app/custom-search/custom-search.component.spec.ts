import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomSearchComponent } from './custom-search.component';

describe('CustomSearchComponent', () => {
  let component: CustomSearchComponent;
  let fixture: ComponentFixture<CustomSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
