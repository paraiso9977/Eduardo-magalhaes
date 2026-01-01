
export interface WeatherData {
  cityName: string;
  country: string;
  temperatureC: number;
  condition: string;
  conditionCode: string;
  localTime: string;
  localDate: string;
  timezone: string;
  lat: number;
  lng: number;
  webcamUrl?: string;
  webcamSource?: 'youtube' | 'webview' | 'none';
  mapUrl?: string;
}

export interface FavoriteCity {
  id: string;
  name: string;
}

export type Unit = 'C' | 'F';
