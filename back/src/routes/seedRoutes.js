const express = require('express');
const router = express.Router();
const { initiate } = require('../controllers/seedController');

/**
 * @swagger
 * /api/seed/initiate:
 *   get:
 *     summary: Initialize the database with seed data
 *     description: >
 *       **⚠️ NOT SECURED — For development/demo use only.**
 *       Drops and re-seeds users (admin, shops, buyer) then
 *       categories, shops and products.
 *     tags:
 *       - Seed
 *     responses:
 *       200:
 *         description: Database seeded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Seed failed
 */
router.get('/initiate', initiate);

module.exports = router;
