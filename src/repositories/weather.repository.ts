import { db } from '../db/dbconfig';
import { weather_data, locations, NewWeatherData } from '../db/schema';
import { eq, and, desc, asc, gte, lte, inArray, avg, sum } from 'drizzle-orm';

export class WeatherRepository {
    /**
     * Create a new weather data record
     */
    async create(data: NewWeatherData): Promise<NewWeatherData> {
        const [weather] = await db.insert(weather_data).values(data).returning();
        return weather;
    }

    /**
     * Get weather data by ID
     */
    async findById(weatherId: string): Promise<NewWeatherData | undefined> {
        const [weather] = await db.select().from(weather_data).where(eq(weather_data.weather_id, weatherId));
        return weather;
    }

    /**
     * Get weather data by location
     */
    async findByLocation(locationId: string, limit: number = 10, offset: number = 0): Promise<NewWeatherData[]> {
        const weather = await db.select()
            .from(weather_data)
            .where(eq(weather_data.location_id, locationId))
            .orderBy(desc(weather_data.timestamp))
            .limit(limit)
            .offset(offset);
        return weather;
    }

    /**
     * Get latest weather data for a location
     */
    async getLatestByLocation(locationId: string): Promise<NewWeatherData | undefined> {
        const [weather] = await db.select()
            .from(weather_data)
            .where(eq(weather_data.location_id, locationId))
            .orderBy(desc(weather_data.timestamp))
            .limit(1);
        return weather;
    }

    /**
     * Get weather data by date range
     */
    async findByDateRange(locationId: string, startDate: Date, endDate: Date, limit: number = 100): Promise<NewWeatherData[]> {
        const weather = await db.select()
            .from(weather_data)
            .where(and(
                eq(weather_data.location_id, locationId),
                gte(weather_data.timestamp, startDate),
                lte(weather_data.timestamp, endDate)
            ))
            .orderBy(desc(weather_data.timestamp))
            .limit(limit);
        return weather;
    }

    /**
     * Update weather data
     */
    async update(weatherId: string, data: Partial<NewWeatherData>): Promise<NewWeatherData | undefined> {
        const [weather] = await db.update(weather_data)
            .set({ ...data })
            .where(eq(weather_data.weather_id, weatherId))
            .returning();
        return weather;
    }

    /**
     * Delete weather data
     */
    async delete(weatherId: string): Promise<NewWeatherData | undefined> {
        const [weather] = await db.delete(weather_data)
            .where(eq(weather_data.weather_id, weatherId))
            .returning();
        return weather;
    }

    /**
     * Get weather data for multiple locations
     */
    async findByLocations(locationIds: string[], limitPerLocation: number = 5): Promise<NewWeatherData[]> {
        const weather = await db.select()
            .from(weather_data)
            .where(inArray(weather_data.location_id, locationIds))
            .orderBy(weather_data.location_id, desc(weather_data.timestamp))
            .limit(limitPerLocation * locationIds.length);
        return weather;
    }

    /**
     * Get average weather data for a location over time period
     */
    async getAverageByLocation(locationId: string, days: number = 7): Promise<{
        avgTemperature: number;
        avgHumidity: number;
        totalRainfall: number;
        locationId: string;
    } | null> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const result = await db.select({
            avgTemperature: avg(weather_data.temperature_celsius),
            avgHumidity: avg(weather_data.humidity_percentage),
            totalRainfall: sum(weather_data.rainfall_mm),
            locationId: weather_data.location_id
        })
        .from(weather_data)
        .where(and(
            eq(weather_data.location_id, locationId),
            gte(weather_data.timestamp, startDate)
        ))
        .groupBy(weather_data.location_id);

        if (!result[0]) return null;
        
        return {
            avgTemperature: Number(result[0].avgTemperature) || 0,
            avgHumidity: Number(result[0].avgHumidity) || 0,
            totalRainfall: Number(result[0].totalRainfall) || 0,
            locationId: result[0].locationId
        };
    }

    /**
     * Get weather forecast data for a location
     */
    async getForecastByLocation(locationId: string): Promise<any[]> {
        const [weather] = await db.select({
            timestamp: weather_data.timestamp,
            forecastData: weather_data.forecast_data
        })
        .from(weather_data)
        .where(eq(weather_data.location_id, locationId))
        .orderBy(desc(weather_data.timestamp))
        .limit(1);

        const forecastData = weather?.forecastData;
        return Array.isArray(forecastData) ? forecastData : [];
    }
}
