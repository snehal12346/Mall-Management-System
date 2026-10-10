/**
 * Parking Controller
 * Manages Multi-Level Slots, Entry/Exit Logging, Automated Triggers, and Fee Calculation
 */

const db = require('../config/db');

/**
 * GET /api/parking/slots
 */
const getParkingSlots = async (req, res, next) => {
  try {
    const { floor, vehicle_type, status } = req.query;
    let sql = `
      SELECT
        ps.*,
        pe.entry_id,
        pe.entry_time,
        v.vehicle_number,
        v.vehicle_type AS current_vehicle_type,
        c.customer_name
      FROM PARKING_SLOT ps
      LEFT JOIN PARKING_ENTRY pe ON ps.slot_id = pe.slot_id AND pe.exit_time IS NULL
      LEFT JOIN VEHICLE v ON pe.vehicle_id = v.vehicle_id
      LEFT JOIN CUSTOMER c ON v.customer_id = c.customer_id
    `;
    const params = [];
    const conditions = [];

    if (floor) {
      params.push(floor);
      conditions.push(`ps.floor = $${params.length}`);
    }

    if (vehicle_type) {
      params.push(vehicle_type);
      conditions.push(`ps.vehicle_type = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`ps.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY ps.floor, ps.slot_number';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/parking/slots/available-count
 * Uses stored function fn_get_available_parking_slots
 */
const getAvailableSlotsCount = async (req, res, next) => {
  try {
    const { vehicle_type } = req.query;
    const result = await db.query(`SELECT fn_get_available_parking_slots($1) AS available_slots`, [
      vehicle_type || 'ALL',
    ]);
    return res.status(200).json({ success: true, availableSlots: result.rows[0].available_slots });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/parking/slots
 */
const createParkingSlot = async (req, res, next) => {
  try {
    const { floor, slot_number, vehicle_type, status } = req.body;

    if (!floor || !slot_number || !vehicle_type) {
      return res.status(400).json({
        success: false,
        message: 'floor, slot_number, and vehicle_type are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO PARKING_SLOT (floor, slot_number, vehicle_type, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [floor, slot_number.trim(), vehicle_type, status || 'Available']
    );

    return res.status(201).json({
      success: true,
      message: 'Parking slot created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/parking/slots/:id
 */
const updateParkingSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { floor, slot_number, vehicle_type, status } = req.body;

    const result = await db.query(
      `UPDATE PARKING_SLOT
       SET floor = COALESCE($1, floor),
           slot_number = COALESCE($2, slot_number),
           vehicle_type = COALESCE($3, vehicle_type),
           status = COALESCE($4, status)
       WHERE slot_id = $5
       RETURNING *`,
      [floor, slot_number, vehicle_type, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Parking slot updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/parking/slots/:id
 */
const deleteParkingSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM PARKING_SLOT WHERE slot_id = $1 RETURNING slot_id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }
    return res.status(200).json({ success: true, message: 'Parking slot deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/parking/entries
 */
const getParkingEntries = async (req, res, next) => {
  try {
    const { active_only } = req.query;
    let sql = `
      SELECT
        pe.*,
        v.vehicle_number,
        v.vehicle_type,
        ps.floor,
        ps.slot_number,
        c.customer_name
      FROM PARKING_ENTRY pe
      JOIN VEHICLE v ON pe.vehicle_id = v.vehicle_id
      JOIN PARKING_SLOT ps ON pe.slot_id = ps.slot_id
      LEFT JOIN CUSTOMER c ON v.customer_id = c.customer_id
    `;

    if (active_only === 'true') {
      sql += ` WHERE pe.exit_time IS NULL`;
    }

    sql += ` ORDER BY pe.entry_time DESC`;

    const result = await db.query(sql);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/parking/entry (Check-in vehicle)
 * Trigger trg_occupy_parking_slot automatically marks slot as 'Occupied'
 */
const createParkingEntry = async (req, res, next) => {
  try {
    const { vehicle_id, slot_id } = req.body;

    if (!vehicle_id || !slot_id) {
      return res.status(400).json({
        success: false,
        message: 'vehicle_id and slot_id are required.',
      });
    }

    // Verify slot is available
    const slotCheck = await db.query(`SELECT status FROM PARKING_SLOT WHERE slot_id = $1`, [slot_id]);
    if (slotCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Slot not found.' });
    }
    if (slotCheck.rows[0].status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Selected slot is currently ${slotCheck.rows[0].status}. Please pick an available slot.`,
      });
    }

    const result = await db.query(
      `INSERT INTO PARKING_ENTRY (vehicle_id, slot_id, entry_time)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [vehicle_id, slot_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Vehicle parked successfully. Slot marked Occupied.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/parking/exit (Check-out vehicle & calculate fee)
 * Trigger trg_release_parking_slot automatically marks slot as 'Available'
 */
const processParkingExit = async (req, res, next) => {
  try {
    const { entry_id } = req.body;

    if (!entry_id) {
      return res.status(400).json({ success: false, message: 'entry_id is required.' });
    }

    // Call stored procedure or calculate fee
    const entryRes = await db.query(
      `SELECT pe.*, v.vehicle_type
       FROM PARKING_ENTRY pe
       JOIN VEHICLE v ON pe.vehicle_id = v.vehicle_id
       WHERE pe.entry_id = $1 AND pe.exit_time IS NULL`,
      [entry_id]
    );

    if (entryRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Active parking entry not found or vehicle has already exited.',
      });
    }

    const entry = entryRes.rows[0];
    const now = new Date();

    // Calculate fee via function
    const feeRes = await db.query(
      `SELECT fn_calculate_parking_fee($1, $2, $3) AS fee`,
      [entry.entry_time, now, entry.vehicle_type]
    );
    const fee = feeRes.rows[0].fee;

    // Update entry with exit_time and fee (trigger releases slot!)
    const updateRes = await db.query(
      `UPDATE PARKING_ENTRY
       SET exit_time = $1,
           parking_fee = $2
       WHERE entry_id = $3
       RETURNING *`,
      [now, fee, entry_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Vehicle exited successfully. Slot is now Available.',
      data: updateRes.rows[0],
      calculatedFee: fee,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getParkingSlots,
  getAvailableSlotsCount,
  createParkingSlot,
  updateParkingSlot,
  deleteParkingSlot,
  getParkingEntries,
  createParkingEntry,
  processParkingExit,
};
