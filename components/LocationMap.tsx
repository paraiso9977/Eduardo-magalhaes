
import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Compass, Navigation, Car, Activity, Loader2, Globe } from 'lucide-react';

interface LocationMapProps {
  url: string;
  cityName: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ url, cityName }) => {
  const [showTraffic, setShowTraffic] = useState(false);
  const [showSatellite, setShowSatellite] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (containerRef.current) observer.unobserve(containerRef.current);
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  // t=k ativa o modo satélite, layer=t ativa o trânsito
  let finalUrl = url;
  if (showSatellite) finalUrl += '&t=k';
  if (showTraffic) finalUrl += '&layer=t';

  return (
    <div 
      ref={containerRef}
      className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 transition-all duration-300 hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50">
                <MapIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-none">Mapa Interativo</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
                <Navigation size={8} className="text-indigo-400" /> {cityName}
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowSatellite(!showSatellite)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-tighter transition-all border ${
                    showSatellite 
                    ? 'bg-indigo-600 border-indigo-700 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
            >
                <Globe size={14} />
                SATÉLITE
            </button>
            <button 
                onClick={() => setShowTraffic(!showTraffic)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-tighter transition-all border ${
                    showTraffic 
                    ? 'bg-amber-500 border-amber-600 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
            >
                <Car size={14} />
                TRÂNSITO
            </button>
        </div>
      </div>

      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner group flex items-center justify-center">
        {isVisible ? (
          <iframe
            src={finalUrl}
            className="w-full h-full border-0 transition-all duration-500"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Iniciando Mapa...</span>
          </div>
        )}
        
        {isVisible && showTraffic && (
            <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                <Activity size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Fluxo ao Vivo</span>
            </div>
        )}

        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-2">
           <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
           </div>
           <span className="text-[9px] font-black text-slate-700 tracking-widest uppercase">GPS Conectado</span>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
