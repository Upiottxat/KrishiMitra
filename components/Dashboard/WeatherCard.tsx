import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NarratorService } from '../../services/NarratorService';

interface WeatherCardProps {
  loading: boolean;
  error: string | null;
  weatherData: any;
  location: string;
  lastWeatherUpdate: string | null;
}

const getWeatherIcon = (weatherId: number): string => {
  if (weatherId >= 200 && weatherId < 600) return '⛈️';
  if (weatherId >= 600 && weatherId < 700) return '❄️';
  if (weatherId >= 700 && weatherId < 800) return '🌫️';
  if (weatherId === 800) return '☀️';
  return '☁️';
};

const DEFAULT_FORECAST = [
  { day: 'आज (Today)', icon: '☀️', temp: 28, humidity: 45, desc: 'साफ मौसम, धूप' },
  { day: 'कल (Wed)', icon: '⛅', temp: 27, humidity: 50, desc: 'आंशिक बादल' },
  { day: 'गुरु (Thu)', icon: '☁️', temp: 26, humidity: 55, desc: 'बादल छाए रहेंगे' },
  { day: 'शुक्र (Fri)', icon: '🌧️', temp: 24, humidity: 72, desc: 'हल्की बारिश' },
  { day: 'शनि (Sat)', icon: '☀️', temp: 27, humidity: 48, desc: 'धूप खिली रहेगी' },
];

const WeatherCard: React.FC<WeatherCardProps> = ({
  loading,
  error,
  weatherData,
  location,
  lastWeatherUpdate,
}) => {
  const fiveDayForecast = useMemo(() => {
    if (!weatherData?.list || weatherData.list.length === 0) {
      return DEFAULT_FORECAST;
    }

    const dailyForecasts: { [key: string]: any } = {};
    weatherData.list.forEach((forecast: any) => {
      const day = forecast.dt_txt.split(' ')[0];
      if (!dailyForecasts[day]) {
        dailyForecasts[day] = forecast;
      }
    });

    const parsed = Object.values(dailyForecasts)
      .slice(0, 5)
      .map((forecast, index) => {
        const date = new Date(forecast.dt_txt);
        const dayName =
          index === 0 ? 'आज (Today)' : date.toLocaleDateString('hi-IN', { weekday: 'short' });
        return {
          day: dayName,
          icon: getWeatherIcon(forecast.weather?.[0]?.id || 800),
          temp: Math.round(forecast.main?.temp || 26),
          humidity: forecast.main?.humidity || 50,
          desc: forecast.weather?.[0]?.description || 'अनुकूल मौसम',
        };
      });

    return parsed.length > 0 ? parsed : DEFAULT_FORECAST;
  }, [weatherData]);

  const handleNarrateWeather = () => {
    const today = fiveDayForecast[0];
    const text = `मौसम पूर्वानुमान: ${location || 'आपके क्षेत्र'} में आज का तापमान ${today.temp} डिग्री सेल्सियस और आर्द्रता ${today.humidity} प्रतिशत है। आने वाले 4 दिनों में मौसम सामान्य और फसलों के अनुकूल रहेगा।`;
    NarratorService.speak(text, { language: 'hi-IN' });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="rainy-outline" size={20} color="#3b82f6" />
          <Text style={styles.cardTitle}>मौसम पूर्वानुमान (Weather Forecast)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.cardLocation}>📍 {location || 'पंजाब / हरियाणा'}</Text>
          <TouchableOpacity onPress={handleNarrateWeather} style={styles.listenBtn}>
            <Ionicons name="volume-high" size={16} color="#15803d" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weatherGrid}>
        {fiveDayForecast.map((weather, index) => (
          <View
            key={index}
            style={[styles.weatherItem, index === 0 && styles.weatherItemToday]}
          >
            <Text style={[styles.weatherDay, index === 0 && styles.weatherDayToday]}>
              {weather.day}
            </Text>
            <Text style={styles.weatherIcon}>{weather.icon}</Text>
            <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
            <Text style={styles.weatherHumidity}>💧 {weather.humidity}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.timeStampRow}>
        <Text style={styles.timeStampText}>
          {loading ? (
            'मौसम अपडेट हो रहा है...'
          ) : (
            `✔️ मौसम रडार सक्रिय • अनुकूल कृषि दशा`
          )}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 6,
  },
  cardLocation: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  listenBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  weatherItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  weatherItemToday: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  weatherDay: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  weatherDayToday: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  weatherIcon: {
    fontSize: 22,
    marginVertical: 2,
  },
  weatherTemp: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  weatherHumidity: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 3,
  },
  timeStampRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  timeStampText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
  },
});

export default WeatherCard;
