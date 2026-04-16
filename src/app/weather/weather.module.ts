import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherPageRoutingModule } from './weather.routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import {WeatherComponent} from './weather.component'



@NgModule({
  declarations: [WeatherComponent],
  imports: [ 
    CommonModule,
    FormsModule,
    IonicModule,
    WeatherPageRoutingModule
  ],
  exports: [WeatherComponent]
})
export class WeatherModule { }

