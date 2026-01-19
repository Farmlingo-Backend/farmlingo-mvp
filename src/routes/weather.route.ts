import { Router, Request, Response } from 'express';
import { weatherService } from '../services/weather.service';
import { clerkAuth } from '../middlewares/clerk';
import { NewWeatherData } from '../db/schema';

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
router.post('/', clerkAuth, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        const auth = (req as any).auth;
        if (!auth || (auth.role !== 'admin' && auth.role !== 'super_admin')) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const weatherData: NewWeatherData = req.body;
        const createdWeather = await weatherService.createWeatherData(weatherData);
        res.status(201).json(createdWeather);
    } catch (error) {
        console.error('Error creating weather data:', error);
        res.status(500).json({ error: 'Failed to create weather data' });
    }
});

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
router.get('/:weatherId', clerkAuth, async (req: Request, res: Response) => {
    try {
        const weatherId = req.params.weatherId;
        const weatherData = await weatherService.getWeatherDataById(weatherId);
        
        if (!weatherData) {
            return res.status(404).json({ error: 'Weather data not found' });
        }

        res.json(weatherData);
    } catch (error) {
        console.error('Error getting weather data:', error);
        res.status(500).json({ error: 'Failed to get weather data' });
    }
});

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
router.get('/location/:locationId', clerkAuth, async (req: Request, res: Response) => {
    try {
        const locationId = req.params.locationId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await weatherService.getWeatherByLocation(locationId, page, limit);
        res.json(result);
    } catch (error) {
        console.error('Error getting weather data by location:', error);
        res.status(500).json({ error: 'Failed to get weather data' });
    }
});

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
router.get('/location/:locationId/latest', clerkAuth, async (req: Request, res: Response) => {
    try {
        const locationId = req.params.locationId;
        const weatherData = await weatherService.getLatestWeatherByLocation(locationId);
        
        if (!weatherData) {
            return res.status(404).json({ error: 'No weather data found for this location' });
        }

        res.json(weatherData);
    } catch (error) {
        console.error('Error getting latest weather data:', error);
        res.status(500).json({ error: 'Failed to get latest weather data' });
    }
});

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
router.get('/location/:locationId/agricultural', clerkAuth, async (req: Request, res: Response) => {
    try {
        const locationId = req.params.locationId;
        const days = parseInt(req.query.days as string) || 7;

        const agriculturalData = await weatherService.getAgriculturalWeatherData(locationId, days);
        
        if (!agriculturalData) {
            return res.status(404).json({ error: 'No weather data found for this location' });
        }

        res.json(agriculturalData);
    } catch (error) {
        console.error('Error getting agricultural weather data:', error);
        res.status(500).json({ error: 'Failed to get agricultural weather data' });
    }
});

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
router.get('/location/:locationId/forecast', clerkAuth, async (req: Request, res: Response) => {
    try {
        const locationId = req.params.locationId;
        const forecast = await weatherService.getWeatherForecast(locationId);
        res.json(forecast);
    } catch (error) {
        console.error('Error getting weather forecast:', error);
        res.status(500).json({ error: 'Failed to get weather forecast' });
    }
});

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
router.put('/:weatherId', clerkAuth, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        const auth = (req as any).auth;
        if (!auth || (auth.role !== 'admin' && auth.role !== 'super_admin')) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const weatherId = req.params.weatherId;
        const updateData = req.body;
        const updatedWeather = await weatherService.updateWeatherData(weatherId, updateData);
        
        if (!updatedWeather) {
            return res.status(404).json({ error: 'Weather data not found' });
        }

        res.json(updatedWeather);
    } catch (error) {
        console.error('Error updating weather data:', error);
        res.status(500).json({ error: 'Failed to update weather data' });
    }
});

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
router.delete('/:weatherId', clerkAuth, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        const auth = (req as any).auth;
        if (!auth || (auth.role !== 'admin' && auth.role !== 'super_admin')) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const weatherId = req.params.weatherId;
        const deletedWeather = await weatherService.deleteWeatherData(weatherId);
        
        if (!deletedWeather) {
            return res.status(404).json({ error: 'Weather data not found' });
        }

        res.json(deletedWeather);
    } catch (error) {
        console.error('Error deleting weather data:', error);
        res.status(500).json({ error: 'Failed to delete weather data' });
    }
});

export default router;
