import { WeatherRepository } from '../repositories/weather.repository';
import { NewWeatherData, locations, weather_data } from '../db/schema';
import { db } from '../db/dbconfig';
import { eq } from 'drizzle-orm';

export class WeatherService {
    private weatherRepo: WeatherRepository;

    constructor() {
        this.weatherRepo = new WeatherRepository();
    }

    /**
     * Create weather data for a location
     */
    async createWeatherData(data: NewWeatherData): Promise<NewWeatherData> {
        // Validate location exists
        const locationExists = await db.select().from(locations)
            .where(eq(locations.location_id, data.location_id))
            .limit(1);

        if (!locationExists.length) {
            throw new Error('Location not found');
        }

        return await this.weatherRepo.create(data);
    }

    /**
     * Get weather data by ID
     */
    async getWeatherDataById(weatherId: string): Promise<NewWeatherData | undefined> {
        return await this.weatherRepo.findById(weatherId);
    }

    /**
     * Get weather data for a location with pagination
     */
    async getWeatherByLocation(locationId: string, page: number = 1, limit: number = 10): Promise<{
        weatherData: NewWeatherData[];
        pagination: { page: number; limit: number; total: number };
    }> {
        const offset = (page - 1) * limit;
        const weatherData = await this.weatherRepo.findByLocation(locationId, limit, offset);
        
        // Get total count for pagination
        const totalCount = await db.select({ count: db.$count(weather_data) })
            .from(weather_data)
            .where(eq(weather_data.location_id, locationId));

        return {
            weatherData,
            pagination: {
                page,
                limit,
                total: totalCount[0]?.count || 0
            }
        };
    }

    /**
     * Get latest weather data for a location
     */
    async getLatestWeatherByLocation(locationId: string): Promise<NewWeatherData | undefined> {
        return await this.weatherRepo.getLatestByLocation(locationId);
    }

    /**
     * Get weather data by date range
     */
    async getWeatherByDateRange(locationId: string, startDate: Date, endDate: Date, limit: number = 100): Promise<NewWeatherData[]> {
        return await this.weatherRepo.findByDateRange(locationId, startDate, endDate, limit);
    }

    /**
     * Update weather data
     */
    async updateWeatherData(weatherId: string, data: Partial<NewWeatherData>): Promise<NewWeatherData | undefined> {
        return await this.weatherRepo.update(weatherId, data);
    }

    /**
     * Delete weather data
     */
    async deleteWeatherData(weatherId: string): Promise<NewWeatherData | undefined> {
        return await this.weatherRepo.delete(weatherId);
    }

    /**
     * Get weather averages for agricultural recommendations
     */
    async getAgriculturalWeatherData(locationId: string, days: number = 7): Promise<{
        locationId: string;
        avgTemperature: number;
        avgHumidity: number;
        totalRainfall: number;
        recommendations: string[];
        lastUpdated: Date;
    } | null> {
        const weatherData = await this.weatherRepo.getAverageByLocation(locationId, days);
        
        if (!weatherData) {
            return null;
        }

        const recommendations = this.generateAgriculturalRecommendations(
            weatherData.avgTemperature,
            weatherData.avgHumidity,
            weatherData.totalRainfall
        );

        return {
            locationId: weatherData.locationId,
            avgTemperature: weatherData.avgTemperature,
            avgHumidity: weatherData.avgHumidity,
            totalRainfall: weatherData.totalRainfall,
            recommendations,
            lastUpdated: new Date()
        };
    }

    /**
     * Get weather forecast for a location
     */
    async getWeatherForecast(locationId: string): Promise<any[]> {
        return await this.weatherRepo.getForecastByLocation(locationId);
    }

    /**
     * Generate agricultural recommendations based on weather data
     */
    private generateAgriculturalRecommendations(
        temperature: number,
        humidity: number,
        rainfall: number
    ): string[] {
        const recommendations: string[] = [];

        // Temperature recommendations
        if (temperature < 15) {
            recommendations.push("Consider planting cold-resistant crops like cabbage, broccoli, or spinach.");
        } else if (temperature > 30) {
            recommendations.push("Consider heat-resistant crops like tomatoes, peppers, or okra. Ensure adequate irrigation.");
        } else {
            recommendations.push("Ideal temperature for most crops. Consider planting beans, corn, or squash.");
        }

        // Humidity recommendations
        if (humidity > 80) {
            recommendations.push("High humidity detected. Monitor for fungal diseases and ensure good air circulation.");
        } else if (humidity < 40) {
            recommendations.push("Low humidity detected. Consider mulching to retain moisture and water more frequently.");
        }

        // Rainfall recommendations
        if (rainfall > 50) {
            recommendations.push("High rainfall detected. Ensure proper drainage to prevent waterlogging.");
        } else if (rainfall < 10) {
            recommendations.push("Low rainfall detected. Consider irrigation systems and drought-resistant crops.");
        } else {
            recommendations.push("Moderate rainfall. Good conditions for most crops.");
        }

        return recommendations;
    }
}

export const weatherService = new WeatherService();
