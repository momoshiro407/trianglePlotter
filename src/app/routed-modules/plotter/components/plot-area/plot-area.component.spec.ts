import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotAreaComponent } from './plot-area.component';

describe('PlotAreaComponent', () => {
  let component: PlotAreaComponent;
  let fixture: ComponentFixture<PlotAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlotAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
