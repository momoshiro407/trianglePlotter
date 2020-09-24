import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlotAreaComponent } from './routed-modules/plotter/components/plot-area/plot-area.component';
import { InfoAreaComponent } from './routed-modules/plotter/components/info-area/info-area.component';
import { PlotterComponent } from './routed-modules/plotter/plotter.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    AppComponent,
    PlotAreaComponent,
    InfoAreaComponent,
    PlotterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
