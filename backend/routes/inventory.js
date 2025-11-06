const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Medicine = require('../models/Medicine');

// Create new medicine
router.post('/',
  authenticate,
  authorize('admin', 'pharmacist'),
  async (req, res) => {
    try {
      const medicine = new Medicine(req.body);
      await medicine.save();

      res.status(201).json({
        success: true,
        message: 'Medicine added successfully',
        medicine
      });
    } catch (error) {
      console.error('Medicine creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding medicine',
        error: error.message
      });
    }
  }
);

// Get all medicines with filtering
router.get('/',
  authenticate,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        stockStatus,
        search
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      let query = { isActive: true };

      // Filter by category
      if (category) {
        query.category = category;
      }

      // Filter by stock status
      if (stockStatus === 'low') {
        query['$expr'] = {
          '$lte': ['$stock.quantity', '$stock.reorderLevel']
        };
      } else if (stockStatus === 'out') {
        query['stock.quantity'] = 0;
      }

      // Search by name
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { genericName: new RegExp(search, 'i') }
        ];
      }

      const medicines = await Medicine.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ name: 1 });

      const total = await Medicine.countDocuments(query);

      res.json({
        success: true,
        medicines,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching medicines'
      });
    }
  }
);

// Get medicine by ID
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const medicine = await Medicine.findById(req.params.id);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }

      res.json({
        success: true,
        medicine
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching medicine'
      });
    }
  }
);

// Update medicine
router.put('/:id',
  authenticate,
  authorize('admin', 'pharmacist'),
  async (req, res) => {
    try {
      const updates = req.body;
      updates.updatedAt = new Date();

      const medicine = await Medicine.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }

      res.json({
        success: true,
        message: 'Medicine updated successfully',
        medicine
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating medicine'
      });
    }
  }
);

// Update stock (add/remove)
router.patch('/:id/stock',
  authenticate,
  authorize('admin', 'pharmacist'),
  async (req, res) => {
    try {
      const { action, quantity, batchInfo } = req.body;
      const medicine = await Medicine.findById(req.params.id);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }

      if (action === 'add') {
        medicine.stock.quantity += quantity;
        if (batchInfo) {
          medicine.batchInfo.push(batchInfo);
        }
      } else if (action === 'remove') {
        if (medicine.stock.quantity < quantity) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock'
          });
        }
        medicine.stock.quantity -= quantity;
      }

      medicine.updatedAt = new Date();
      await medicine.save();

      res.json({
        success: true,
        message: `Stock ${action}ed successfully`,
        medicine
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating stock'
      });
    }
  }
);

// Get low stock items
router.get('/alerts/low-stock',
  authenticate,
  authorize('admin', 'pharmacist'),
  async (req, res) => {
    try {
      const lowStockMedicines = await Medicine.find({
        isActive: true,
        $expr: { $lte: ['$stock.quantity', '$stock.reorderLevel'] }
      }).sort({ 'stock.quantity': 1 });

      res.json({
        success: true,
        count: lowStockMedicines.length,
        medicines: lowStockMedicines
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching low stock items'
      });
    }
  }
);

// Get expiring medicines
router.get('/alerts/expiring',
  authenticate,
  authorize('admin', 'pharmacist'),
  async (req, res) => {
    try {
      const daysAhead = parseInt(req.query.days) || 30;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const expiringMedicines = await Medicine.find({
        isActive: true,
        'batchInfo.expiryDate': {
          $lte: futureDate,
          $gte: new Date()
        }
      });

      res.json({
        success: true,
        count: expiringMedicines.length,
        medicines: expiringMedicines
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching expiring medicines'
      });
    }
  }
);

// Delete medicine (soft delete)
router.delete('/:id',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const medicine = await Medicine.findByIdAndUpdate(
        req.params.id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }

      res.json({
        success: true,
        message: 'Medicine deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting medicine'
      });
    }
  }
);

module.exports = router;