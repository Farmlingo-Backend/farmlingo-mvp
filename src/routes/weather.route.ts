import { Router } from 'express';
import { clerkAuth } from '../middlewares/clerk';
import { requireAdmin } from '../middlewares/auth';
import {
  createWeather,
  getWeatherById,
  getWeatherByLocation,
  getLatestWeatherByLocation,
  getAgriculturalWeatherData,
  getWeatherForecast,
  updateWeather,
  deleteWeather
} from '../controllers/weather.controller';

const router = Router();

/**
 * @openapi
 * /api/weather:
 *   post:
 *     tags:
 *       - Weather
 *     summary: Create weather data
 *     description: Create new weather data for a location (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location_id
 *               - timestamp
 *               - temperature_celsius
 *               - humidity_percentage
 *               - rainfall_mm
 *               - conditions
 *             properties:
 *               location_id:
 *                 type: string
 *                 format: uuid
 *                 description: Location ID
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Weather data timestamp
 *               temperature_celsius:
 *                 type: number
 *                 description: Temperature in Celsius
 *               humidity_percentage:
 *                 type: number
 *                 description: Humidity percentage
 *               rainfall_mm:
 *                 type: number
 *                 description: Rainfall in millimeters
 *               conditions:
 *                 type: string
 *                 description: Weather conditions description
 *               forecast_data:
 *                 type: object
 *                 description: Forecast data
 *     responses:
 *       '201':
 *         description: Weather data created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeatherData'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/', clerkAuth, requireAdmin, createWeather);

/**
 * @openapi
 * /api/weather/{weatherId}:
 *   get:
 *     tags:
 *       - Weather
 *     summary: Get weather data by ID
 *     description: Get weather data by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: weatherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Weather data ID
 *     responses:
 *       '200':
 *         description: Weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeatherData'
 *       '404':
 *         description: Weather data not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:weatherId', clerkAuth, getWeatherById);

/**
 * @openapi
 * /api/weather/location/{locationId}:
 *   get:
 *     tags:
 *       - Weather
 *     summary: Get weather data by location
 *     description: Get weather data for a location with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Location ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       '200':
 *         description: Weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weatherData:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WeatherData'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/location/:locationId', clerkAuth, getWeatherByLocation);

/**
 * @openapi
 * /api/weather/location/{locationId}/latest:
 *   get:
 *     tags:
 *       - Weather
 *     summary: Get latest weather data for a location
 *     description: Get the most recent weather data for a location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Location ID
 *     responses:
 *       '200':
 *         description: Latest weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeatherData'
 *       '404':
 *         description: No weather data found for location
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/location/:locationId/latest', clerkAuth, getLatestWeatherByLocation);

/**
 * @openapi
 * /api/weather/location/{locationId}/agricultural:
 *   get:
 *     tags:
 *       - Weather
 *     summary: Get agricultural weather recommendations
 *     description: Get weather data and agricultural recommendations for a location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Location ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to calculate averages for
 *     responses:
 *       '200':
 *         description: Agricultural weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 locationId:
 *                   type: string
 *                   format: uuid
 *                 avgTemperature:
 *                   type: number
 *                 avgHumidity:
 *                   type: number
 *                 totalRainfall:
 *                   type: number
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: No weather data found for location
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/location/:locationId/agricultural', clerkAuth, getAgriculturalWeatherData);

/**
 * @openapi
 * /api/weather/location/{locationId}/forecast:
 *   get:
 *     tags:
 *       - Weather
 *     summary: Get weather forecast for a location
 *     description: Get weather forecast data for a location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Location ID
 *     responses:
 *       '200':
 *         description: Weather forecast retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/location/:locationId/forecast', clerkAuth, getWeatherForecast);

/**
 * @openapi
 * /api/weather/{weatherId}:
 *   put:
 *     tags:
 *       - Weather
 *     summary: Update weather data
 *     description: Update weather data (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: weatherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Weather data ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               temperature_celsius:
 *                 type: number
 *               humidity_percentage:
 *                 type: number
 *               rainfall_mm:
 *                 type: number
 *               conditions:
 *                 type: string
 *               forecast_data:
 *                 type: object
 *     responses:
 *       '200':
 *         description: Weather data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeatherData'
 *       '403':
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Weather data not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/:weatherId', clerkAuth, requireAdmin, updateWeather);

/**
 * @openapi
 * /api/weather/{weatherId}:
 *   delete:
 *     tags:
 *       - Weather
 *     summary: Delete weather data
 *     description: Delete weather data (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: weatherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Weather data ID
 *     responses:
 *       '200':
 *         description: Weather data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeatherData'
 *       '403':
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Weather data not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.delete('/:weatherId', clerkAuth, requireAdmin, deleteWeather);

export default router;
