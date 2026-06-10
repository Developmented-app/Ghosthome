import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle, 
  Wind, 
  Thermometer, 
  MapPin, 
  Search, 
  Navigation, 
  RefreshCw, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface WeatherWidgetProps {
  lang: string;
}

interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitation: number;
  dayOfWeek: string;
}

export default function WeatherWidget({ lang }: WeatherWidgetProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Phnom Penh, Cambodia');
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 11.5564, lon: 104.9282 }); // Fallback to Phnom Penh
  const [currentWeather, setCurrentWeather] = useState<{
    temp: number;
    windspeed: number;
    weatherCode: number;
  } | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [searchingLocation, setSearchingLocation] = useState<boolean>(false);

  // Translate weather descriptions to English/Khmer
  const getWeatherDesc = (code: number): { en: string; kh: string } => {
    if (code === 0) return { en: 'Clear Sky', kh: 'មេឃស្រឡះល្អ' };
    if ([1, 2, 3].includes(code)) return { en: 'Partly Cloudy', kh: 'មេឃមានពពកខ្លះ' };
    if ([45, 48].includes(code)) return { en: 'Foggy Weather', kh: 'មានអ័ព្ទចុះច្រើន' };
    if ([51, 53, 55].includes(code)) return { en: 'Light Drizzle', kh: 'មានភ្លៀងរលឹមស្រិចៗ' };
    if ([61, 63, 65].includes(code)) return { en: 'Rainy Showers', kh: 'មានភ្លៀងធ្លាក់' };
    if ([71, 73, 75].includes(code)) return { en: 'Snowfall', kh: 'មានធ្លាក់ទឹកកក' };
    if ([80, 81, 82].includes(code)) return { en: 'Heavy Rain', kh: 'មានភ្លៀងធ្លាក់ខ្លាំង' };
    if ([95, 96, 99].includes(code)) return { en: 'Thunderstorm', kh: 'មានភ្លៀងផ្គររន្ទះ' };
    return { en: 'Mild climate', kh: 'អាកាសធាតុថេរ' };
  };

  const getWeatherIcon = (code: number, className: string = "w-6 h-6") => {
    if (code === 0) return <Sun className={`${className} text-amber-400 animate-spin-slow`} />;
    if ([1, 2, 3].includes(code)) return <Cloud className={`${className} text-indigo-300`} />;
    if ([45, 48].includes(code)) return <Cloud className={`${className} text-slate-400`} />;
    if ([51, 53, 55].includes(code)) return <CloudDrizzle className={`${className} text-sky-400 animate-pulse`} />;
    if ([61, 63, 65].includes(code)) return <CloudRain className={`${className} text-blue-400`} />;
    if ([71, 73, 75].includes(code)) return <CloudSnow className={`${className} text-teal-300`} />;
    if ([80, 81, 82].includes(code)) return <CloudRain className={`${className} text-blue-500 font-extrabold`} />;
    if ([95, 96, 99].includes(code)) return <CloudLightning className={`${className} text-amber-500 animate-bounce`} style={{ animationDuration: '3s' }} />;
    return <Cloud className={`${className} text-slate-300`} />;
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch climate statistics.');
      }
      const data = await response.json();
      
      if (data.current_weather) {
        setCurrentWeather({
          temp: Math.round(data.current_weather.temperature),
          windspeed: Math.round(data.current_weather.windspeed),
          weatherCode: data.current_weather.weathercode,
        });
      }

      if (data.daily) {
        const daysKh = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
        const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const formattedForecast: ForecastDay[] = [];
        // Extract 3 days forecast
        for (let i = 0; i < 3; i++) {
          const rawDate = data.daily.time[i];
          const dateObj = new Date(rawDate);
          const dayIndex = dateObj.getDay();
          
          let dayName = lang === 'en' ? daysEn[dayIndex] : `ថ្ងៃ${daysKh[dayIndex]}`;
          if (i === 0) dayName = lang === 'en' ? 'Today' : 'ថ្ងៃនេះ';
          if (i === 1) dayName = lang === 'en' ? 'Tomorrow' : 'ស្អែក';

          formattedForecast.push({
            date: rawDate,
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            weatherCode: data.daily.weathercode[i],
            precipitation: data.daily.precipitation_sum[i] || 0,
            dayOfWeek: dayName,
          });
        }
        setForecast(formattedForecast);
      }
    } catch (err: any) {
      console.error(err);
      setError(lang === 'en' ? 'Unable to load real-time microclimate forecast.' : 'មិនអាចទាញយកទិន្នន័យព្យាករណ៍អាកាសធាតុបច្ចុប្បន្នបានទេ។');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on mount to locate nearest area or load default Sorya guesthouse coords
  useEffect(() => {
    const locateAndFetch = async () => {
      // 1. First try to load cached coords to avoid duplicate API calls
      const cachedCoords = localStorage.getItem('guesthouse_weather_coords');
      const cachedLocName = localStorage.getItem('guesthouse_weather_loc_name');
      
      if (cachedCoords && cachedLocName) {
        try {
          const parsed = JSON.parse(cachedCoords);
          setCoords(parsed);
          setLocationName(cachedLocName);
          fetchWeatherData(parsed.lat, parsed.lon);
          return;
        } catch (e) {
          // ignore
        }
      }

      // 2. Try Automatic Geo-IP lookup for zero-prompt region detection
      try {
        const geoIpResponse = await fetch('https://ipapi.co/json/');
        if (geoIpResponse.ok) {
          const ipData = await geoIpResponse.json();
          if (ipData.latitude && ipData.longitude) {
            const label = ipData.city 
              ? `${ipData.city}, ${ipData.country_name || ipData.country}` 
              : 'Guesthouse Region';
            setCoords({ lat: ipData.latitude, lon: ipData.longitude });
            setLocationName(label);
            fetchWeatherData(ipData.latitude, ipData.longitude);
            return;
          }
        }
      } catch (e) {
        // Fallback to standard Phnom Penh Sorya site coordinates
      }

      // 3. Ultimate Fallback to Phnom Penh
      fetchWeatherData(coords.lat, coords.lon);
    };

    locateAndFetch();
  }, []);

  const handleDeviceGeolocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'en' ? 'Browser doesn\'t support GPS positioning.' : 'កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រប្រព័ន្ធកំណត់ទីតាំង GPS ឡើយ។');
      return;
    }

    setSearchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        
        const label = lang === 'en' ? 'GPS Verified Location' : 'ទីតាំងបញ្ជាក់ដោយ GPS';
        setLocationName(label);
        localStorage.setItem('guesthouse_weather_coords', JSON.stringify({ lat, lon }));
        localStorage.setItem('guesthouse_weather_loc_name', label);
        
        fetchWeatherData(lat, lon);
        setSearchingLocation(false);
      },
      (error) => {
        console.error(error);
        setSearchingLocation(false);
        alert(lang === 'en' 
          ? 'GPS retrieval permission was denied or timed out inside framing sandbox.' 
          : 'ការអនុញ្ញាត GPS ត្រូវបានបដិសេធ ឬផុតកំណត់ក្នុងប្រអប់សុវត្ថិភាព។');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const resp = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5`
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
          alert(lang === 'en' ? 'No regions matched your parameter.' : 'មិនរកឃើញព័ត៌មានទីតាំងសមស្របឡើយ។');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectLocation = (loc: any) => {
    const name = `${loc.name}, ${loc.country || loc.admin1 || ''}`;
    setLocationName(name);
    setCoords({ lat: loc.latitude, lon: loc.longitude });
    localStorage.setItem('guesthouse_weather_coords', JSON.stringify({ lat: loc.latitude, lon: loc.longitude }));
    localStorage.setItem('guesthouse_weather_loc_name', name);
    
    fetchWeatherData(loc.latitude, loc.longitude);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <div id="weather-forecast-widget" className="bg-slate-800/45 border border-slate-700/70 rounded-2xl p-6 shadow-md select-none relative overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header Title with Controls */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3.5 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-100 text-sm uppercase tracking-wide">
                {lang === 'en' ? 'Regional Weather Hub' : 'ព័ត៌មានអាកាសធាតុប្រចាំតំបន់'}
              </h4>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-450 shrink-0" />
                <span className="truncate max-w-[160px] text-indigo-300 font-bold">{locationName}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 no-print">
            {/* Locate Me button */}
            <button
              onClick={handleDeviceGeolocation}
              disabled={searchingLocation}
              className={`p-1.5 bg-slate-900 hover:bg-slate-750 text-indigo-300 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer shrink-0`}
              title={lang === 'en' ? 'Detect current GPS positioning' : 'ស្វែងរកទីតាំងដោយ GPS'}
            >
              <Navigation className={`w-3.5 h-3.5 ${searchingLocation ? 'animate-pulse text-emerald-400' : ''}`} />
            </button>

            {/* Refresh button */}
            <button
              onClick={() => fetchWeatherData(coords.lat, coords.lon)}
              disabled={loading}
              className="p-1.5 bg-slate-900 hover:bg-slate-750 text-indigo-300 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer shrink-0"
              title={lang === 'en' ? 'Refresh daily stats' : 'កែសម្រួលទិន្នន័យឡើងវិញ'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Location Search Input form */}
        <form onSubmit={handleSearch} className="mb-4 relative no-print">
          <div className="relative">
            <input
              type="text"
              placeholder={lang === 'en' ? "Search city (e.g. Siem Reap)..." : "ស្វែងរកទីក្រុង/ខេត្ត..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-3 pr-9 py-1.5 text-xs text-white outline-none focus:border-indigo-550 transition font-sans placeholder-slate-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Result Dropdown Drawer */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-800 overflow-hidden">
              {searchResults.map((loc) => (
                <button
                  key={`${loc.id}-${loc.latitude}`}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-850 text-slate-200 transition flex items-center justify-between font-medium cursor-pointer"
                >
                  <span className="truncate">{loc.name}, {loc.country || ''}</span>
                  <span className="text-[9px] text-slate-500 font-mono">({Math.round(loc.latitude)}°N)</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowSearchResults(false)}
                className="w-full text-center py-1.5 text-[10px] text-indigo-400 font-bold hover:underline bg-slate-950"
              >
                {lang === 'en' ? 'Close Search Options' : 'បិទផ្ទាំងស្វែងរក'}
              </button>
            </div>
          )}
        </form>

        {/* Climate Forecast Core Panel */}
        {loading ? (
          <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-500 font-mono animate-pulse">Syncing satellite climate streams...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-rose-400 text-xs flex flex-col items-center justify-center space-y-1">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
            <span>{error}</span>
            <button 
              type="button"
              onClick={() => fetchWeatherData(coords.lat, coords.lon)} 
              className="text-[10px] text-indigo-400 font-semibold hover:underline mt-2 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Current day big widget banner */}
            {currentWeather && (
              <div className="bg-[#050912]/80 border border-indigo-950/40 rounded-xl p-3.5 flex items-center justify-between relative overflow-hidden shadow-inner">
                <div className="space-y-1">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest block font-mono">Current Climate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white font-mono leading-none">{currentWeather.temp}°C</span>
                    <span className="text-[10px] text-slate-400 font-medium">({getWeatherDesc(currentWeather.weatherCode)[lang === 'en' ? 'en' : 'kh']})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-0.5 text-blue-300">
                      <Wind className="w-2.5 h-2.5" />
                      <span>{currentWeather.windspeed} km/h</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-indigo-300">
                      <Thermometer className="w-2.5 h-2.5 font-bold" />
                      <span>Cambodia Zone</span>
                    </span>
                  </div>
                </div>
                
                {/* Large animated weather symbol on the right */}
                <div className="p-2.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                  {getWeatherIcon(currentWeather.weatherCode, "w-10 h-10")}
                </div>
              </div>
            )}

            {/* 3-Day structured forecasts columns */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider block mb-2">
                {lang === 'en' ? '3-Day Guesthouse Horizon' : 'ព្យាករណ៍រយះពេល ៣ ថ្ងៃបន្ទាប់'}
              </span>

              <div className="grid grid-cols-3 gap-2">
                {forecast.map((day) => {
                  const desc = getWeatherDesc(day.weatherCode);
                  return (
                    <div 
                      key={day.date} 
                      className="bg-slate-900/40 p-2.5 border border-slate-700/35 rounded-xl text-center space-y-1.5 hover:bg-slate-900 transition flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-black text-white block uppercase truncate">{day.dayOfWeek}</span>
                      
                      {/* Weather icon */}
                      <div className="flex justify-center my-0.5">
                        {getWeatherIcon(day.weatherCode, "w-6 h-6")}
                      </div>

                      {/* Temperature Range */}
                      <div className="space-y-0.5">
                        <div className="flex justify-center items-center gap-1 font-mono text-[10px]">
                          <span className="font-extrabold text-amber-400" title="Daily High">{day.tempMax}°</span>
                          <span className="text-slate-500">/</span>
                          <span className="font-semibold text-indigo-300" title="Daily Low">{day.tempMin}°</span>
                        </div>
                        {/* Precipitation indicator */}
                        <div className="text-[8px] text-slate-500 font-bold tracking-tight uppercase truncate">
                          {day.precipitation > 0 ? (
                            <span className="text-sky-400">{day.precipitation}mm 🌧️</span>
                          ) : (
                            <span>Dry Cloud</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-700/80 text-[10px] text-slate-500 flex items-center justify-between no-print">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-600" />
          <span>Real-time Sat data from Open-Meteo API</span>
        </span>
      </div>
    </div>
  );
}
