const mongoose = require('mongoose');
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

// ── Helper ────────────────────────────────────────────────────
const calculatePercentageDiff = (current, previous) => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return parseFloat(((current - previous) / previous * 100).toFixed(2));
};

// Helper to get array of dates between two dates
const getDatesInRange = (startDate, endDate) => {
    const date = new Date(startDate.getTime());
    const dates = [];
    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return dates;
};

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// ═══════════════════════════════════════════════════════════════
// 1. Order summary between two dates
//    - total order count, total amount
//    - count of pending orders, count of confirmed (validated) orders
//    - daily paid orders (count + amount per day, 0 if none)
// ═══════════════════════════════════════════════════════════════
exports.getShopOrderSummary = async (req, res) => {
    try {
        const { shop_id, startDate, endDate } = req.query;

        if (!shop_id) return res.status(400).json({ message: 'shop_id is required' });
        if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate are required' });

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const shopObjectId = new mongoose.Types.ObjectId(shop_id);

        const [summary, statusBreakdown, dailyPaid] = await Promise.all([
            Order.aggregate([
                {
                    $match: {
                        shop_id: shopObjectId,
                        created_at: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalAmount: { $sum: "$amounts.total" }
                    }
                }
            ]),
            Order.aggregate([
                {
                    $match: {
                        shop_id: shopObjectId,
                        created_at: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]),
            // Daily paid orders
            Order.aggregate([
                {
                    $match: {
                        shop_id: shopObjectId,
                        payment_status: 'paid',
                        created_at: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                        count: { $sum: 1 },
                        amount: { $sum: "$amounts.total" }
                    }
                }
            ])
        ]);

        const statusMap = {};
        statusBreakdown.forEach(s => { statusMap[s._id] = s.count; });

        // Build daily stats map from aggregation
        const dailyMap = {};
        dailyPaid.forEach(d => {
            dailyMap[d._id] = { count: d.count, amount: d.amount };
        });

        // Fill every day in range (0 if no paid orders)
        const dailyStats = {};
        const dateRange = getDatesInRange(start, end);
        dateRange.forEach(date => {
            const dateStr = formatDate(date);
            dailyStats[dateStr] = dailyMap[dateStr] || { count: 0, amount: 0 };
        });

        res.status(200).json({
            totalOrders: summary.length > 0 ? summary[0].totalOrders : 0,
            totalAmount: summary.length > 0 ? summary[0].totalAmount : 0,
            pendingOrders: statusMap['pending'] || 0,
            confirmedOrders: statusMap['confirmed'] || 0,
            dailyStats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// 2. Top 5 clients (by number of validated orders + by amount)
//    between two dates
// ═══════════════════════════════════════════════════════════════
exports.getShopTopClients = async (req, res) => {
    try {
        const { shop_id, startDate, endDate } = req.query;

        if (!shop_id) return res.status(400).json({ message: 'shop_id is required' });
        if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate are required' });

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const shopObjectId = new mongoose.Types.ObjectId(shop_id);
        const matchStage = {
            $match: {
                shop_id: shopObjectId,
                status: { $in: ['confirmed', 'shipped', 'delivered'] },
                created_at: { $gte: start, $lte: end }
            }
        };

        const [topByCount, topByAmount] = await Promise.all([
            // Top 5 by order count
            Order.aggregate([
                matchStage,
                {
                    $group: {
                        _id: "$buyer_id",
                        orderCount: { $sum: 1 },
                        totalAmount: { $sum: "$amounts.total" }
                    }
                },
                { $sort: { orderCount: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: "$user" },
                {
                    $project: {
                        _id: 1,
                        orderCount: 1,
                        totalAmount: 1,
                        firstname: "$user.profile.firstname",
                        lastname: "$user.profile.lastname",
                        email: "$user.profile.email"
                    }
                }
            ]),
            // Top 5 by total amount
            Order.aggregate([
                matchStage,
                {
                    $group: {
                        _id: "$buyer_id",
                        orderCount: { $sum: 1 },
                        totalAmount: { $sum: "$amounts.total" }
                    }
                },
                { $sort: { totalAmount: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: "$user" },
                {
                    $project: {
                        _id: 1,
                        orderCount: 1,
                        totalAmount: 1,
                        firstname: "$user.profile.firstname",
                        lastname: "$user.profile.lastname",
                        email: "$user.profile.email"
                    }
                }
            ])
        ]);

        res.status(200).json({
            topByCount,
            topByAmount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// 3. Stats per product for a given year
//    - Lists ALL products of the shop
//    - For each: order count + total amount (0 if no orders)
// ═══════════════════════════════════════════════════════════════
exports.getShopProductStats = async (req, res) => {
    try {
        const { shop_id, year } = req.query;

        if (!shop_id) return res.status(400).json({ message: 'shop_id is required' });
        if (!year) return res.status(400).json({ message: 'Year is required' });

        const startOfYear = new Date(`${year}-01-01`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        const shopObjectId = new mongoose.Types.ObjectId(shop_id);

        // 1. Get ALL products of this shop
        const allProducts = await Product.find({ shop_id: shopObjectId })
            .select('_id name')
            .lean();

        // 2. Get order stats per product for the year
        const orderStats = await Order.aggregate([
            {
                $match: {
                    shop_id: shopObjectId,
                    created_at: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product_id",
                    orderCount: { $sum: 1 },
                    totalAmount: { $sum: "$items.total_price_ttc" }
                }
            }
        ]);

        // 3. Build a map of product_id -> stats
        const statsMap = {};
        orderStats.forEach(s => {
            statsMap[s._id.toString()] = {
                orderCount: s.orderCount,
                totalAmount: s.totalAmount
            };
        });

        // 4. Merge: all products with their stats (0 if none)
        const result = allProducts.map(p => ({
            _id: p._id,
            productName: p.name,
            orderCount: statsMap[p._id.toString()]?.orderCount || 0,
            totalAmount: statsMap[p._id.toString()]?.totalAmount || 0
        }));

        // Sort by totalAmount descending
        result.sort((a, b) => b.totalAmount - a.totalAmount);

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// 4. Stats per category for a given year
//    - Gets ALL products of this shop, groups by their category
//    - For each category: order count + total amount (0 if none)
// ═══════════════════════════════════════════════════════════════
exports.getShopCategoryStats = async (req, res) => {
    try {
        const { shop_id, year } = req.query;

        if (!shop_id) return res.status(400).json({ message: 'shop_id is required' });
        if (!year) return res.status(400).json({ message: 'Year is required' });

        const startOfYear = new Date(`${year}-01-01`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        const shopObjectId = new mongoose.Types.ObjectId(shop_id);

        // 1. Get ALL products of this shop with their category populated
        const allProducts = await Product.find({ shop_id: shopObjectId })
            .select('_id name category_id')
            .populate('category_id', 'name')
            .lean();

        // 2. Build category map from shop products (unique categories)
        const categoryMap = {};
        allProducts.forEach(p => {
            const catId = p.category_id?._id?.toString() || 'uncategorized';
            const catName = p.category_id?.name || 'Sans catégorie';
            if (!categoryMap[catId]) {
                categoryMap[catId] = {
                    _id: p.category_id?._id || null,
                    categoryName: catName,
                    productIds: [],
                    orderCount: 0,
                    totalAmount: 0
                };
            }
            categoryMap[catId].productIds.push(p._id);
        });

        // 3. Get order stats per product for the year
        const orderStats = await Order.aggregate([
            {
                $match: {
                    shop_id: shopObjectId,
                    created_at: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product_id",
                    orderCount: { $sum: 1 },
                    totalAmount: { $sum: "$items.total_price_ttc" }
                }
            }
        ]);

        // 4. Map order stats to product_id
        const productStatsMap = {};
        orderStats.forEach(s => {
            productStatsMap[s._id.toString()] = {
                orderCount: s.orderCount,
                totalAmount: s.totalAmount
            };
        });

        // 5. Aggregate product stats into their categories
        Object.values(categoryMap).forEach(cat => {
            cat.productIds.forEach(pid => {
                const pStats = productStatsMap[pid.toString()];
                if (pStats) {
                    cat.orderCount += pStats.orderCount;
                    cat.totalAmount += pStats.totalAmount;
                }
            });
        });

        // 6. Build result (remove productIds from output)
        const result = Object.values(categoryMap).map(({ _id, categoryName, orderCount, totalAmount }) => ({
            _id,
            categoryName,
            orderCount,
            totalAmount
        }));

        result.sort((a, b) => b.totalAmount - a.totalAmount);

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// 5. Shop global stats for a given year
//    - total orders + diff vs previous year
//    - total order amount + diff vs previous year
//    - shop average rating
//    - unique customers count
// ═══════════════════════════════════════════════════════════════
exports.getShopGlobalStats = async (req, res) => {
    try {
        const { shop_id, year } = req.query;

        if (!shop_id) return res.status(400).json({ message: 'shop_id is required' });
        if (!year) return res.status(400).json({ message: 'Year is required' });

        const startOfYear = new Date(`${year}-01-01`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        const dateFilter = { $gte: startOfYear, $lte: endOfYear };

        const prevYear = parseInt(year) - 1;
        const startOfPrevYear = new Date(`${prevYear}-01-01`);
        const endOfPrevYear = new Date(`${prevYear}-12-31T23:59:59.999Z`);
        const dateFilterPrev = { $gte: startOfPrevYear, $lte: endOfPrevYear };

        const shopObjectId = new mongoose.Types.ObjectId(shop_id);

        const [
            currentStats, prevStats,
            currentCustomers, prevCustomers,
            shopData
        ] = await Promise.all([
            // Current year — orders count + total amount
            Order.aggregate([
                {
                    $match: {
                        shop_id: shopObjectId,
                        created_at: dateFilter
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalAmount: { $sum: "$amounts.total" }
                    }
                }
            ]),
            // Previous year — orders count + total amount
            Order.aggregate([
                {
                    $match: {
                        shop_id: shopObjectId,
                        created_at: dateFilterPrev
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalAmount: { $sum: "$amounts.total" }
                    }
                }
            ]),
            // Current year — distinct buyers
            Order.distinct('buyer_id', {
                shop_id: shopObjectId,
                created_at: dateFilter
            }),
            // Previous year — distinct buyers
            Order.distinct('buyer_id', {
                shop_id: shopObjectId,
                created_at: dateFilterPrev
            }),
            // Shop rating
            Shop.findById(shop_id).select('avg_rating count_rating')
        ]);

        const totalOrders = currentStats.length > 0 ? currentStats[0].totalOrders : 0;
        const totalAmount = currentStats.length > 0 ? currentStats[0].totalAmount : 0;
        const totalOrdersPrev = prevStats.length > 0 ? prevStats[0].totalOrders : 0;
        const totalAmountPrev = prevStats.length > 0 ? prevStats[0].totalAmount : 0;

        const totalCustomers = currentCustomers.length;
        const totalCustomersPrev = prevCustomers.length;

        res.status(200).json({
            totalOrders,
            ordersDiff: calculatePercentageDiff(totalOrders, totalOrdersPrev),
            totalAmount,
            amountDiff: calculatePercentageDiff(totalAmount, totalAmountPrev),
            avgRating: shopData?.avg_rating || 0,
            countRating: shopData?.count_rating || 0,
            totalCustomers,
            customersDiff: calculatePercentageDiff(totalCustomers, totalCustomersPrev)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// 6. Promo vs Non-Promo orders for a given year
//    - Number of orders with promo items + total amount
//    - Number of orders without promo items + total amount
// ═══════════════════════════════════════════════════════════════
exports.getShopPromoStats = async (req, res) => {
    try {
        const { shop_id, year } = req.query;

        if (!shop_id) return res.status(400).json({ message: 'shop_id is required' });
        if (!year) return res.status(400).json({ message: 'Year is required' });

        const startOfYear = new Date(`${year}-01-01`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        const shopObjectId = new mongoose.Types.ObjectId(shop_id);

        // For each order, check if it has at least one promo item
        const promoStats = await Order.aggregate([
            {
                $match: {
                    shop_id: shopObjectId,
                    created_at: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            {
                $addFields: {
                    hasPromo: {
                        $gt: [
                            {
                                $size: {
                                    $filter: {
                                        input: "$items",
                                        as: "item",
                                        cond: { $eq: ["$$item.is_promo", true] }
                                    }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$hasPromo",
                    orderCount: { $sum: 1 },
                    totalAmount: { $sum: "$amounts.total" }
                }
            }
        ]);

        const result = {
            withPromo: { orderCount: 0, totalAmount: 0 },
            withoutPromo: { orderCount: 0, totalAmount: 0 }
        };

        promoStats.forEach(s => {
            if (s._id === true) {
                result.withPromo = { orderCount: s.orderCount, totalAmount: s.totalAmount };
            } else {
                result.withoutPromo = { orderCount: s.orderCount, totalAmount: s.totalAmount };
            }
        });

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
