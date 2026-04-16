import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';

interface WeatherData {
  temperature: number;
  humidity: number;
  city: string;
  icon: string;
  condition: string;    
  windSpeed: number; 
  feelsLike: number;
}


@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})

export class WeatherComponent implements OnInit, OnDestroy {
  
    weatherData: WeatherData | null = null;
  currentCity: string = 'Moscow';
  temperature: number = 0;
  feelsLike: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  weeklyForecast: any[] = [];
  
 
  private apiKey: string = '433997e030794166ac495549261104';
  
  private updateInterval: any;

  constructor(private alertController: AlertController) {}

  ngOnInit() {
    this.loadWeatherData();
    this.startAutoUpdate();
  }
  
  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // Загрузка текущей погоды
  async loadWeatherData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${encodeURIComponent(this.currentCity)}&lang=ru&aqi=no`;
      const response = await fetch(weatherUrl);
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Город не найден');
        } else if (response.status === 401) {
          throw new Error('Неверный API ключ');
        } else {
          throw new Error('Ошибка загрузки данных');
        }
      }
      
      const data = await response.json();
      
  
      this.weatherData = {
        temperature: Math.round(data.current.temp_c),
        condition: data.current.condition.text,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph / 3.6, // 
        city: data.location.name,
        icon: 'https:' + data.current.condition.icon, // 
        feelsLike: Math.round(data.current.feelslike_c)
      };
      
      this.temperature = this.weatherData.temperature;
      this.feelsLike = this.weatherData.feelsLike;
      
      // Загружаем прогноз
      await this.loadForecast();
      
    } catch (error: any) {
      console.error('Ошибка:', error);
      this.errorMessage = error.message || 'Не удалось загрузить погоду';
    } finally {
      this.isLoading = false;
    }
  }

  // Загрузка прогноза на неделю
  async loadForecast() {
    try {
     
      const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(this.currentCity)}&days=7&lang=ru&aqi=no&alerts=no`;
      const response = await fetch(forecastUrl);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить прогноз');
      }
      
      const data = await response.json();
      
      // Обработка прогноза
      this.weeklyForecast = data.forecast.forecastday.map((day: any) => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
        
        return {
          date: dayName,
          dayTemp: Math.round(day.day.maxtemp_c),
          nightTemp: Math.round(day.day.mintemp_c),
          condition: day.day.condition.text,
          icon: 'https:' + day.day.condition.icon
        };
      });
      
    } catch (error) {
      console.error('Ошибка прогноза:', error);
      // Заглушка, если прогноз не загрузился
      this.weeklyForecast = this.getMockForecast();
    }
  }

  
  getMockForecast() {
    const dates = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return dates.map((date, index) => ({
      date: date,
      dayTemp: 18 - index,
      nightTemp: 10 - index,
      condition: 'ясно',
      icon: ''
    }));
  }

 
  getFeelsLikeText(): string {
    if (!this.weatherData) return 'Загрузка...';
    
    const diff = this.feelsLike - this.temperature;
    
    if (diff > 1) {
      return `Ощущается как ${this.feelsLike}°, но на самом деле ${this.temperature}° (теплее из-за влажности)`;
    } else if (diff < -1) {
      return `Ощущается как ${this.feelsLike}°, но на самом деле ${this.temperature}° (холоднее из-за ветра)`;
    } else {
      return `Ощущается как ${this.temperature}°, температура комфортная`;
    }
  }

  // Диалог выбора города
  async changeCity() {
    const alert = await this.alertController.create({
      header: 'Выберите город',
      inputs: [
        {
          name: 'city',
          type: 'text',
          placeholder: 'Введите название города',
          value: this.currentCity
        }
      ],
      buttons: [
        {
          text: 'Отмена',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: (data) => {
            if (data.city && data.city.trim()) {
              this.currentCity = data.city.trim();
              this.loadWeatherData();
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  
  startAutoUpdate() {
    this.updateInterval = setInterval(() => {
      this.loadWeatherData();
    }, 600000);
  }

  
  refreshWeather() {
    this.loadWeatherData();
  }
}