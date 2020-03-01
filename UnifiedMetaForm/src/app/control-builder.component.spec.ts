import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlBuilderComponent } from './control-builder.component';

describe('ControlBuilderComponent', () => {
  let component: ControlBuilderComponent;
  let fixture: ComponentFixture<ControlBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
