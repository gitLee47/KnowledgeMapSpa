import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { HomeRoutingModule } from './home-routing.module';
import { MapChartComponent } from './map-chart/map-chart.component';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule
  ],
  declarations: [MapComponent, MapChartComponent]
})
export class HomeModule { }
