const express = require('express');
const router = express.Router();
const {
    getShopOrderSummary,
    getShopTopClients,
    getShopProductStats,
    getShopCategoryStats,
    getShopGlobalStats,
    getShopPromoStats
} = require('../controllers/shopStatisticController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: ShopStatistics
 *   description: Shop owner statistic routes
 */

/**
 * @swagger
 * /api/shop/statistics/orders:
 *   get:
 *     summary: Get shop order summary between two dates
 *     tags: [ShopStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Order summary (totalOrders, totalAmount, pendingOrders, confirmedOrders)
 */
router.get('/orders', protect, authorize('shop'), getShopOrderSummary);

/**
 * @swagger
 * /api/shop/statistics/top-clients:
 *   get:
 *     summary: Get top 5 clients by order count and by total amount
 *     tags: [ShopStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Top clients (topByCount, topByAmount)
 */
router.get('/top-clients', protect, authorize('shop'), getShopTopClients);

/**
 * @swagger
 * /api/shop/statistics/products:
 *   get:
 *     summary: Get stats per product for a given year (ALL products, 0 if no orders)
 *     tags: [ShopStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Year (YYYY)
 *     responses:
 *       200:
 *         description: Product statistics array (all products listed)
 */
router.get('/products', protect, authorize('shop'), getShopProductStats);

/**
 * @swagger
 * /api/shop/statistics/categories:
 *   get:
 *     summary: Get stats per product category for a given year (only categories from shop products)
 *     tags: [ShopStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Year (YYYY)
 *     responses:
 *       200:
 *         description: Category statistics array (only categories of this shop's products)
 */
router.get('/categories', protect, authorize('shop'), getShopCategoryStats);

/**
 * @swagger
 * /api/shop/statistics/global:
 *   get:
 *     summary: Get shop global stats for a given year with previous year comparison
 *     tags: [ShopStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Year (YYYY)
 *     responses:
 *       200:
 *         description: Global shop statistics with year-over-year comparison
 */
router.get('/global', protect, authorize('shop'), getShopGlobalStats);

/**
 * @swagger
 * /api/shop/statistics/promos:
 *   get:
 *     summary: Get promo vs non-promo order stats for a given year
 *     tags: [ShopStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Year (YYYY)
 *     responses:
 *       200:
 *         description: Orders with promo vs without promo (count + amount)
 */
router.get('/promos', protect, authorize('shop'), getShopPromoStats);

module.exports = router;
