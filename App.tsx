
import React, { useState, useEffect } from 'react';
import { Search, Heart, MapPin, Loader2, Thermometer, Info, ChevronRight, X, History, Compass, Camera, Globe } from 'lucide-react';
import { WeatherData, FavoriteCity, Unit } from './types';
import { fetchCityData, fetchNearbyCities } from './services/geminiService';
import WeatherCard from './components/WeatherCard';
import LiveCamera from './components/LiveCamera';
import LocationMap from './components/LocationMap';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<WeatherData | null>(null);
  const [nearbyCities, setNearbyCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [unit, setUnit] = useState<Unit>('C');
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedFavs = localStorage.getItem('city_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedHistory = localStorage.getItem('city_history');
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    
    // Cidade inicial padrão
    handleSearch('Rio de Janeiro, Brasil');
  }, []);

  const handleSearch = async (cityName: string) => {
    if (!cityName.trim()) return;
    setIsLoading(true);
    setError(null);
    setShowHistory(false);
    try {
      const cityData = await fetchCityData(cityName);
      setData(cityData);
      
      const nearby = await fetchNearbyCities(cityData.lat, cityData.lng);
      setNearbyCities(nearby);
      
      const newHistory = [cityData.cityName, ...searchHistory.filter(h => h !== cityData.cityName)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('city_history', JSON.stringify(newHistory));
    } catch (err: any) {
      console.error(err);
      setError("Local não encontrado. Verifique a ortografia ou tente: 'Cidade, País'.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!data) return;
    const isFav = favorites.some(f => f.name === data.cityName);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter(f => f.name !== data.cityName);
    } else {
      newFavs = [...favorites, { id: Date.now().toString(), name: data.cityName }];
    }
    setFavorites(newFavs);
    localStorage.setItem('city_favorites', JSON.stringify(newFavs));
  };

  const isCurrentFavorite = data ? favorites.some(f => f.name === data.cityName) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 max-w-md mx-auto sm:max-w-none sm:px-4 lg:px-8">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 py-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <Globe size={22} className="animate-pulse" />
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tighter text-slate-800 leading-none">CityScope</h1>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Live Explorer</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setUnit(prev => prev === 'C' ? 'F' : 'C')}
                  className="bg-slate-100 p-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
                >
                  <Thermometer size={14} className="text-indigo-600" />
                  {unit}
                </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              placeholder="Buscar cidade ou ponto turístico..."
              className="w-full bg-slate-100 border-2 border-transparent rounded-2xl py-4 pl-5 pr-14 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
            />
            <button 
              type="submit"
              className="absolute right-2 w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200 z-10"
              aria-label="Pesquisar"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} strokeWidth={3} />}
            </button>
          </form>
          
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between p-3 border-b border-slate-50 bg-slate-50/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History size={12} /> Recentemente
                    </span>
                    <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-indigo-600 p-1">
                        <X size={16} />
                    </button>
                </div>
                {searchHistory.map((h, i) => (
                    <button 
                        key={i}
                        onClick={() => {
                            setQuery(h);
                            handleSearch(h);
                        }}
                        className="w-full text-left px-5 py-4 text-sm font-bold text-slate-700 hover:bg-indigo-50 flex items-center justify-between group transition-colors"
                    >
                        <span>{h}</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 text-red-600 animate-in zoom-in-95">
            <Info className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-bold leading-relaxed">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status Agora</h2>
                <button 
                  onClick={toggleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                    isCurrentFavorite 
                    ? 'bg-pink-100 text-pink-600 border border-pink-200' 
                    : 'bg-white text-slate-400 border border-slate-200 hover:border-pink-200 hover:text-pink-500'
                  }`}
                >
                  <Heart size={14} fill={isCurrentFavorite ? "currentColor" : "none"} strokeWidth={3} />
                  {isCurrentFavorite ? 'SALVO' : 'FAVORITAR'}
                </button>
            </div>

            <WeatherCard 
                data={data} 
                unit={unit} 
                isLoading={isLoading} 
                onRefresh={() => handleSearch(data.cityName)} 
            />

            <LocationMap url={data.mapUrl || ''} cityName={data.cityName} />

            <LiveCamera data={data} />

            {nearbyCities.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                  <Compass size={16} className="text-indigo-500" /> Explorar Câmeras Próximas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {nearbyCities.map((city, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setQuery(city);
                        handleSearch(city);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-white border border-slate-200 p-4 rounded-2xl text-left hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                    >
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                        <Camera size={14} strokeWidth={3} />
                      </div>
                      <p className="text-xs font-black text-slate-800 line-clamp-2 leading-tight uppercase tracking-tighter">{city}</p>
                      <div className="mt-2 flex items-center text-[9px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        VER AGORA <ChevronRight size={10} className="ml-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!data && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
                <div className="relative">
                    <div className="w-28 h-28 bg-indigo-50 rounded-[2.8rem] flex items-center justify-center text-indigo-600 shadow-inner">
                        <Search size={48} strokeWidth={1.5} className="animate-pulse" />
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 animate-bounce">
                        <Camera size={24} className="text-pink-500" />
                    </div>
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Viagem Virtual em Tempo Real</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
                        Acesse fuso horário, clima e câmeras ao vivo do mundo todo. Comece digitando uma cidade acima.
                    </p>
                </div>
            </div>
        )}
      </main>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4 flex justify-around md:hidden z-50">
        <button className="flex flex-col items-center gap-1.5 text-indigo-600 font-black" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Globe size={20} strokeWidth={2.5} />
            <span className="text-[9px] uppercase tracking-widest">Início</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-slate-400 font-black" onClick={() => setShowHistory(true)}>
            <History size={20} strokeWidth={2.5} />
            <span className="text-[9px] uppercase tracking-widest">Recentes</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-slate-400 font-black" onClick={() => {
            if (favorites.length > 0) {
                setQuery(favorites[0].name);
                handleSearch(favorites[0].name);
            }
        }}>
            <Heart size={20} strokeWidth={2.5} />
            <span className="text-[9px] uppercase tracking-widest">Salvos</span>
        </button>
      </div>
    </div>
  );
};

export default App;
