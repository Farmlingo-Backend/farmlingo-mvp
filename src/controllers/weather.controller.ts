import { Request, Response, NextFunction } from 'express';
import { weatherService } from '../services/weather.service';
import { NewWeatherData } from '../db/schema';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

/**
 * Create new weather data
 */
export const createWeather = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const weatherData: NewWeatherData = req.body;
    const createdWeather = await weatherService.createWeatherData(weatherData);
    res.status(201).json(createdWeather);
  } catch (err) {
    next(err as Error);
  }
};

/**
 * Get weather data by ID
 */
export const getWeatherById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const weatherId = req.params.weatherId;
    const weatherData = await weatherService.getWeatherDataById(weatherId);

    if (!weatherData) {
      return next(createHttpError(404, 'Weather data not found'));
    }

    res.json(weatherData);
  } catch (err) {
    next(err as Error);
  }
};

/**
 * Get weather data by location
 */
export const getWeatherByLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId = req.params.locationId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await weatherService.getWeatherByLocation(locationId, page, limit);
    res.json(result);
  } catch (err) {
    next(err as Error);
  }
};

/**
 * Get latest weather data for a location
 */
export const getLatestWeatherByLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId = req.params.locationId;
    const weatherData = await weatherService.getLatestWeatherByLocation(locationId);

    if (!weatherData) {
      return next(createHttpError(404, 'No weather data found for this location'));
    }

    res.json(weatherData);
  } catch (err) {
    next(err as Error);
  }
};

/**
 * Get agricultural weather data
 */
export const getAgriculturalWeatherData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId = req.params.locationId;
    const days = parseInt(req.query.days as string) || 7;

    const agriculturalData = await weatherService.getAgriculturalWeatherData(locationId, days);

    if (!agriculturalData) {
      return next(createHttpError(404, 'No weather data found for this location'));
    }

    res.json(agriculturalData);
  } catch (err) {
    next(err as Error);
  }
};

/**
 * Get weather forecast
 */
export const getWeatherForecast = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId = req.params.locationId;
    const forecast = await weatherService.getWeatherForecast(locationId);
    res.json(forecast);
  } catch (err) {
    next(err as Error);
  }
};

/**
 * Update weather data
 */
export const updateWeather = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const weatherId = req.params.weatherId;
    const updateData = req.body;
    const updatedWeather = await weatherService.updateWeatherData(weatherId, updateData);

    if (!updatedWeather) {
      return next(createHttpError(404, 'Weather data not found'));
    }

    res.json(updatedWeather);
  } catch (err) {
    next(err as Error);
  }
};

/**
 * Delete weather data
 */
export const deleteWeather = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const weatherId = req.params.weatherId;
    const deletedWeather = await weatherService.deleteWeatherData(weatherId);

    if (!deletedWeather) {
      return next(createHttpError(404, 'Weather data not found'));
    }

    res.json(deletedWeather);
  } catch (err) {
    next(err as Error);
  }
};
