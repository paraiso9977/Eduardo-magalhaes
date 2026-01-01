
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchCityData = async (query: string): Promise<WeatherData> => {
  const now = new Date();
  const brasiliaTime = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo'
  }).format(now);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise a cidade ou local: "${query}". 
    
    CONTEXTO TEMPORAL OBRIGATÓRIO (ÂNCORA):
    - Horário ATUAL em Brasília (Brasil): ${brasiliaTime}.
    - Com base nisso, calcule a hora exata e a data na cidade pesquisada AGORA.
    - O ano atual é ${now.getFullYear()}.

    REQUISITO DE WEBCAM AO VIVO (CRÍTICO):
    - Pesquise por uma transmissão AO VIVO (LIVE) no YouTube para este local.
    - Se encontrar, o campo 'webcamUrl' deve conter APENAS o ID de 11 caracteres do vídeo (ex: "5_X_9V_97mY").
    - Se for um link de site (EarthCam, Windy), coloque a URL completa.
    - Defina 'webcamSource' como 'youtube' (se for ID de 11 caracteres) ou 'webview' (se for URL).
    - Se não houver nenhuma câmera disponível, use 'none'.

    RESPOSTA APENAS EM JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cityName: { type: Type.STRING },
          country: { type: Type.STRING },
          temperatureC: { type: Type.NUMBER },
          condition: { type: Type.STRING },
          conditionCode: { type: Type.STRING, description: "sunny, cloudy, rainy, snowy, stormy, clear-night, cloudy-night" },
          localTime: { type: Type.STRING, description: "Formato 24h HH:MM" },
          localDate: { type: Type.STRING },
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
          webcamUrl: { type: Type.STRING },
          webcamSource: { type: Type.STRING, description: "youtube, webview, ou none" }
        },
        required: ["cityName", "country", "temperatureC", "condition", "conditionCode", "localTime", "localDate", "lat", "lng", "webcamSource"]
      }
    }
  });

  const data = JSON.parse(response.text);
  // O parâmetro 't=k' força o mapa satélite no embed do Google Maps
  data.mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(data.cityName + ' ' + data.country)}&t=k&z=13&ie=UTF8&iwloc=&output=embed`;
  
  return data as WeatherData;
};

export const fetchNearbyCities = async (lat: number, lng: number): Promise<string[]> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Localização: lat ${lat}, lng ${lng}. Retorne um array JSON com 5 nomes de cidades ou pontos turísticos próximos que tenham alta probabilidade de ter WEBCAMS AO VIVO no YouTube (cidades famosas, capitais, praias).`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    return JSON.parse(response.text);
}
