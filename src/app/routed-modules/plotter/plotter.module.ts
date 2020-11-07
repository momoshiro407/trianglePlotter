import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlotterComponent } from './plotter.component';
import { PlotAreaComponent } from './components/plot-area/plot-area.component';
import { InfoAreaComponent } from './components/info-area/info-area.component';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  declarations: [
    PlotterComponent,
    PlotAreaComponent,
    InfoAreaComponent,
  ],
  imports: [
    CommonModule,
    PlotterModule,
    MatMenuModule,
  ]
})
export class PlotterModule { }
