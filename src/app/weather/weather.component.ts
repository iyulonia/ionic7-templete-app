import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent  implements OnInit {

constructor() {}

  ngOnInit() {}

}

interface WeatherData {
  temperature: number;
  humidity: number;
  city: string;
  icon: string;
}

export class WeatherPage implements OnInit, OnDestroy {
  
  weatherData: WeatherData | null = null;
  currentCity: string = 'Москва';
  temperature: number = 0;
  feelsLike: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  weeklyForecast: any[] = [];
