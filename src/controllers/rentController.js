const Rent = require('../models/Rent');

// @desc    Get all rents
// @route   GET /api/rents
// @access  Private (Admin)
const getRents = async (req, res) => {
    try {
        const rents = await Rent.find({}).populate('shop', 'name');
        res.json(rents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a rent record
// @route   POST /api/rents
// @access  Private (Admin)
const createRent = async (req, res) => {
    const { shop, amount, dueDate, period } = req.body;
    try {
        const rent = new Rent({ shop, amount, dueDate, period });
        const createdRent = await rent.save();
        res.status(201).json(createdRent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update rent status
// @route   PATCH /api/rents/:id
// @access  Private (Admin)
const updateRentStatus = async (req, res) => {
    try {
        const rent = await Rent.findById(req.params.id);
        if (rent) {
            rent.status = req.body.status || rent.status;
            if (rent.status === 'PAID') {
                rent.paymentDate = Date.now();
            }
            const updatedRent = await rent.save();
            res.json(updatedRent);
        } else {
            res.status(404).json({ message: 'Rent record not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getRents, createRent, updateRentStatus };
