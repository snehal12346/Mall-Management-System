/**
 * Express Application Setup
 * Mall Management System Backend (Case Study: Phoenix Marketcity, Mumbai)
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const membershipRoutes = require('./routes/membership.routes');
const shopRoutes = require('./routes/shop.routes');
const tenantRoutes = require('./routes/tenant.routes');
const leaseRoutes = require('./routes/lease.routes');
const productRoutes = require('./routes/product.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const paymentRoutes = require('./routes/payment.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const parkingRoutes = require('./routes/parking.routes');
const eventRoutes = require('./routes/event.routes');
const eventRegistrationRoutes = require('./routes/eventRegistration.routes');
const employeeRoutes = require('./routes/employee.routes');
const complaintRoutes = require('./routes/complaint.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const offerRoutes = require('./routes/offer.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// System Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Mall Management System API',
    caseStudy: 'Phoenix Marketcity, Mumbai',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-registrations', eventRegistrationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
