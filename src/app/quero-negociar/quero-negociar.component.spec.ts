import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QueroNegociarComponent } from './quero-negociar.component';

describe('QueroNegociarComponent', () => {
  let component: QueroNegociarComponent;
  let fixture: ComponentFixture<QueroNegociarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QueroNegociarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueroNegociarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
