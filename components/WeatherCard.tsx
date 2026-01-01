
import React from 'react';
import { WeatherData, Unit } from '../types';
import { Sun, Cloud, CloudRain, Snowflake, CloudLightning, Moon, CloudMoon, Clock, MapPin, RefreshCw, Calendar } from 'lucide-react';

interface WeatherCardProps {
  data: WeatherData;
  unit: Unit;
  onRefresh: () => void;
  isLoading: boolean;
}

const WeatherIcon: React.FC<{ code: string; className?: string }> = ({ code, className }) => {
  const iconProps = { className: className || "w-12 h-12 text-white" };
  switch (code.toLowerCase()) {
    case 'sunny': return <Sun {...iconProps} />;
    case 'cloudy': return <Cloud {...iconProps} />;
    case 'rainy': return <CloudRain {...iconProps} />;
    case 'snowy': return <Snowflake {...iconProps} />;
    case 'stormy': return <CloudLightning {...iconProps} />;
    case 'clear-night': return <Moon {...iconProps} />;
    case 'cloudy-night': return <CloudMoon {...iconProps} />;
    default: return <Sun {...iconProps} />;
  }
};

const WeatherCard: React.FC<WeatherCardProps> = ({ data, unit, onRefresh, isLoading }) => {
  const temp = unit === 'C' ? data.temperatureC : Math.round((data.temperatureC * 9/5) + 32);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 shadow-2xl text-white transition-all duration-500 transform hover:scale-[1.01]">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onRefresh}
          className={`p-2.5 bg-white/20 rounded-full hover:bg-white/30 transition-all active:scale-95 border border-white/10 backdrop-blur-md ${isLoading ? 'animate-spin' : ''}`}
          title="Atualizar Dados"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={20} className="text-white/80" />
              <h2 className="text-3xl font-black tracking-tight drop-shadow-sm">{data.cityName}</h2>
            </div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.2em]">{data.country}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-lg border border-white/10">
            <WeatherIcon code={data.conditionCode} />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-7xl font-black tracking-tighter">{temp}°</span>
              <span className="text-2xl font-medium opacity-60">{unit}</span>
            </div>
            <span className="text-xl font-semibold mt-1 text-white/90">{data.condition}</span>
          </div>
          
          <div className="flex flex-col items-end gap-3 text-right">
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                <Clock size={16} className="text-indigo-300" />
                <span className="text-2xl font-black tracking-widest">{data.localTime}</span>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-white/80 text-xs font-bold uppercase tracking-wider mb-0.5">
                    <Calendar size={12} /> Data Atual
                </div>
                <p className="text-sm font-bold text-white leading-tight max-w-[150px]">{data.localDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl"></div>
    </div>
  );
};

export default WeatherCard;
