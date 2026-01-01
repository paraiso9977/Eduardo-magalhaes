
import React, { useMemo, useState, useEffect } from 'react';
import { WeatherData } from '../types';
import { Camera, CameraOff, ExternalLink, AlertCircle, RefreshCcw, Youtube, Play, ShieldAlert } from 'lucide-react';

interface LiveCameraProps {
  data: WeatherData;
}

const LiveCamera: React.FC<LiveCameraProps> = ({ data }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [data.webcamUrl, refreshKey]);

  const youtubeId = useMemo(() => {
    if (!data.webcamUrl || data.webcamSource !== 'youtube') return null;
    const url = data.webcamUrl.trim();
    // Se for o ID direto de 11 caracteres
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url;
    // Tenta extrair ID de URL completa se o modelo falhar em mandar só o ID
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : url.slice(0, 11);
  }, [data.webcamUrl, data.webcamSource]);

  const isYoutube = !!youtubeId && data.webcamSource === 'youtube';
  const isWebview = !isYoutube && data.webcamUrl && data.webcamUrl !== 'none';
  const hasCamera = isYoutube || isWebview;

  // URLs de embed seguras
  const embedUrl = isYoutube 
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&origin=${window.location.origin}`
    : data.webcamUrl;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${hasCamera ? (isYoutube ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600') : 'bg-slate-100 text-slate-400'}`}>
                {isYoutube ? <Youtube size={22} /> : (hasCamera ? <Camera size={22} /> : <CameraOff size={22} />)}
            </div>
            <div>
                <h3 className="font-bold text-slate-800 leading-none">Câmera em Tempo Real</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                    {isYoutube ? <span className="text-red-500">YouTube Live Stream</span> : (hasCamera ? 'Webcam IP / Satélite' : 'Indisponível')}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {hasCamera && (
                <button 
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-90"
                    title="Recarregar player"
                >
                    <RefreshCcw size={18} className={refreshKey > 0 ? "animate-spin" : ""} />
                </button>
            )}
        </div>
      </div>

      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center group">
        {hasCamera ? (
          <>
            <iframe
              key={`${embedUrl}-${refreshKey}`}
              src={embedUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="City Live Stream"
            ></iframe>
            
            {/* Overlay de ajuda caso o vídeo não apareça (comum em YouTube Embeds bloqueados) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
               <div className="flex items-center justify-between w-full pointer-events-auto">
                  <div className="flex items-center gap-2 text-white">
                     <ShieldAlert size={14} className="text-amber-400" />
                     <span className="text-[10px] font-bold">Vídeo não carrega?</span>
                  </div>
                  <a 
                    href={isYoutube ? `https://www.youtube.com/watch?v=${youtubeId}` : data.webcamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-white/20 transition-all"
                  >
                    ABRIR LINK DIRETO <ExternalLink size={12} />
                  </a>
               </div>
            </div>

            <div className={`absolute top-4 left-4 ${isYoutube ? 'bg-red-600' : 'bg-emerald-600'} text-white px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest flex items-center gap-1.5 shadow-lg`}>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                AO VIVO
            </div>
          </>
        ) : (
          <div className="text-center flex flex-col items-center p-8">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                <CameraOff size={28} className="text-slate-600" />
            </div>
            <h4 className="text-slate-300 font-bold text-sm">Nenhuma Câmera Detectada</h4>
            <p className="text-slate-500 text-[10px] mt-2 max-w-[200px] leading-relaxed">
                Tente buscar por cidades maiores ou monumentos históricos próximos.
            </p>
          </div>
        )}
      </div>
      
      {hasCamera && isYoutube && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3">
              <AlertCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-normal font-medium">
                  <strong>Dica:</strong> Se o player exibir "Este vídeo não está disponível", o proprietário do canal desativou a incorporação. Use o botão <strong>Link Direto</strong> para assistir no YouTube.
              </p>
          </div>
      )}
    </div>
  );
};

export default LiveCamera;
