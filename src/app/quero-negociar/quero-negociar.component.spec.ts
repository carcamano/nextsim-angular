import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueroNegociarComponent } from './quero-negociar.component';

describe('QueroNegociarComponent', () => {
  let component: QueroNegociarComponent;
  let fixture: ComponentFixture<QueroNegociarComponent>;

  beforeEach(async(() => {
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
