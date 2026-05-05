-- ==============================================================================
-- SKYVOYAGE FLIGHT RESERVATION SYSTEM - ENHANCED DATABASE SCHEMA
-- ==============================================================================
-- 
-- 1. Fully backward compatible with the existing schema.
-- 2. Added new columns to existing tables for enhanced features (pricing, loyalty, class, etc.).
-- 3. Added new tables (passengers, payments, cancellations, notifications, boarding_passes, etc.).
-- 4. Includes sample INSERT statements for all tables.
--
-- Execute this script in your PostgreSQL database to recreate the entire structure.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- DROP EXISTING TABLES (Reverse order of dependencies to avoid constraint errors)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS boarding_passes CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS price_alerts CASCADE;
DROP TABLE IF EXISTS cancellations CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS saved_passengers CASCADE;
DROP TABLE IF EXISTS meal_preference CASCADE;
DROP TABLE IF EXISTS booking_seats CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS flight_schedule CASCADE;
DROP TABLE IF EXISTS flights CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ==============================================================================
-- PART 1: EXISTING TABLES (Preserved, with new backward-compatible columns)
-- ==============================================================================

CREATE TABLE users (
    user_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(100),
    created_at TIMESTAMP,
    -- NEW COLUMNS FOR ENHANCED FEATURES --
    phone VARCHAR(20),
    loyalty_tier VARCHAR(20) DEFAULT 'Silver',
    loyalty_points INT DEFAULT 0,
    avatar_url VARCHAR(255)
);

CREATE TABLE flights (
    flight_id VARCHAR(10) PRIMARY KEY,
    source VARCHAR(10),
    destination VARCHAR(10),
    route_type VARCHAR(20),
    -- NEW COLUMNS FOR ENHANCED FEATURES --
    airline_code VARCHAR(10) DEFAULT 'SV',
    duration_minutes INT
);

CREATE TABLE flight_schedule (
    schedule_id SERIAL PRIMARY KEY,
    flight_id VARCHAR(10),
    travel_date DATE,
    total_seats INT,
    available_seats INT,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id),
    -- NEW COLUMNS FOR ENHANCED FEATURES --
    departure_time TIME,
    arrival_time TIME,
    base_price_economy DECIMAL(10, 2) DEFAULT 0.00,
    base_price_business DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE seats (
    seat_id SERIAL PRIMARY KEY,
    schedule_id INT,
    seat_number VARCHAR(5),
    seat_status VARCHAR(10),
    FOREIGN KEY (schedule_id) REFERENCES flight_schedule(schedule_id),
    -- NEW COLUMNS FOR ENHANCED FEATURES --
    seat_class VARCHAR(20) DEFAULT 'Economy', -- E.g., Economy, Business, First
    extra_price DECIMAL(10, 2) DEFAULT 0.00    -- E.g., extra fee for exit row or window
);

CREATE TABLE bookings (
    booking_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20),
    schedule_id INT,
    status VARCHAR(15),
    booking_time TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES flight_schedule(schedule_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    -- NEW COLUMNS FOR ENHANCED FEATURES --
    total_amount DECIMAL(10, 2),
    tax_amount DECIMAL(10, 2),
    cabin_class VARCHAR(20) DEFAULT 'Economy',
    checkin_status VARCHAR(20),                -- 'Pending', 'Checked-in'
    checked_in_at TIMESTAMP
);

CREATE TABLE booking_seats (
    booking_id VARCHAR(20),
    seat_id INT,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id),
    -- ENHANCEMENT: Made these a composite primary key
    PRIMARY KEY (booking_id, seat_id)
);

CREATE TABLE meal_preference (
    booking_id VARCHAR(20),
    veg_count INT,
    nonveg_count INT,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);


-- ==============================================================================
-- PART 2: NEW TABLES (For Payments, Notifications, Cancellations, etc.)
-- ==============================================================================

-- Tracks individual passengers for a booking (since a booking can have multiple pax)
CREATE TABLE passengers (
    passenger_id SERIAL PRIMARY KEY,
    booking_id VARCHAR(20),
    name VARCHAR(100),
    age INT,
    gender VARCHAR(20),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Payment transactions for bookings
CREATE TABLE payments (
    payment_id VARCHAR(30) PRIMARY KEY,
    booking_id VARCHAR(20),
    amount DECIMAL(10, 2),
    payment_method VARCHAR(50),       -- E.g., 'Credit Card', 'UPI', 'Wallet'
    payment_status VARCHAR(20),       -- E.g., 'Success', 'Pending', 'Failed'
    transaction_time TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Handles cancellation logic and refunds
CREATE TABLE cancellations (
    cancellation_id SERIAL PRIMARY KEY,
    booking_id VARCHAR(20),
    cancellation_reason TEXT,
    refund_amount DECIMAL(10, 2),
    refund_status VARCHAR(20),        -- E.g., 'Processing', 'Refunded'
    cancelled_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Stores system notifications (booking confirmation, check-in alerts, price drops)
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id VARCHAR(20),
    type VARCHAR(50),                 -- E.g., 'Booking', 'Check-in', 'Alert'
    title VARCHAR(100),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    action_url VARCHAR(255),          -- Frontend route to click
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Generates and stores boarding pass details after Web Check-in
CREATE TABLE boarding_passes (
    boarding_pass_id VARCHAR(30) PRIMARY KEY,
    booking_id VARCHAR(20),
    seat_id INT,
    gate VARCHAR(5),
    terminal VARCHAR(5),
    boarding_time TIME,
    generated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id)
);

-- Stores user Wishlist/Price alerts
CREATE TABLE price_alerts (
    alert_id SERIAL PRIMARY KEY,
    user_id VARCHAR(20),
    source VARCHAR(10),
    destination VARCHAR(10),
    target_price DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Allows users to save family members/friends in their profile for quick booking
CREATE TABLE saved_passengers (
    saved_pax_id SERIAL PRIMARY KEY,
    user_id VARCHAR(20),
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    age INT,
    gender VARCHAR(20),
    relation VARCHAR(50),
    dob DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


-- ==============================================================================
-- PART 3: INSERT SAMPLE DATA
-- ==============================================================================

-- 1. Users (Original data + New Phone/Loyalty Columns)
INSERT INTO users (user_id, name, email, password, created_at, phone, loyalty_tier, loyalty_points) VALUES
('U001', 'Umesh Prasad', 'umesh@example.com', 'pass123', NOW(), '+91-9876543210', 'Gold', 5000),
('U002', 'Rahul Sharma', 'rahul@example.com', 'pass123', NOW(), '+91-9876543211', 'Silver', 1200),
('U003', 'Anjali Singh', 'anjali@example.com', 'pass123', NOW(), '+91-9876543212', 'Platinum', 15500);

-- 2. Flights (Original data + New Airline Code/Duration Columns)
INSERT INTO flights (flight_id, source, destination, route_type, airline_code, duration_minutes) VALUES
('F101', 'Pune', 'Delhi', 'Domestic', 'SV', 130),
('F102', 'Mumbai', 'Bangalore', 'Domestic', 'SV', 105),
('F103', 'Delhi', 'Dubai', 'International', 'EK', 210);

-- 3. Flight Schedule (Original data + New Timings/Pricing Columns)
INSERT INTO flight_schedule (flight_id, travel_date, total_seats, available_seats, departure_time, arrival_time, base_price_economy, base_price_business) VALUES
('F101', '2026-05-01', 100, 95, '08:00:00', '10:10:00', 4500.00, 12000.00),
('F102', '2026-05-02', 120, 110, '14:30:00', '16:15:00', 3200.00, 9500.00),
('F103', '2026-05-03', 150, 140, '22:00:00', '01:30:00', 15000.00, 45000.00);

-- 4. Seats (Original data + New Class/Extra Price Columns)
INSERT INTO seats (schedule_id, seat_number, seat_status, seat_class, extra_price) VALUES
(1, '1A', 'Booked', 'Business', 2500.00),
(1, '1B', 'Available', 'Business', 2000.00),
(1, '1C', 'Available', 'Business', 2000.00),

(2, '1A', 'Booked', 'Economy', 800.00),
(2, '1B', 'Booked', 'Economy', 600.00),
(2, '1C', 'Available', 'Economy', 400.00),

(3, '1A', 'Available', 'First', 5000.00),
(3, '1B', 'Available', 'First', 5000.00),
(3, '1C', 'Available', 'First', 5000.00);

-- 5. Bookings (Original data + New Pricing/Check-in Columns)
INSERT INTO bookings (booking_id, user_id, schedule_id, status, booking_time, total_amount, tax_amount, cabin_class, checkin_status) VALUES
('B001', 'U001', 1, 'Confirmed', NOW(), 16240.00, 1740.00, 'Business', 'Checked-in'),
('B002', 'U002', 2, 'Confirmed', NOW(), 8736.00, 936.00, 'Economy', 'Pending'),
('B003', 'U003', 3, 'Pending', NOW(), 16800.00, 1800.00, 'First', 'Pending');

-- 6. Booking Seats (Original data - Unchanged)
INSERT INTO booking_seats (booking_id, seat_id) VALUES
('B001', 1),
('B002', 4),
('B002', 5);

-- 7. Meal Preference (Original data - Unchanged)
INSERT INTO meal_preference (booking_id, veg_count, nonveg_count) VALUES
('B001', 1, 0),
('B002', 0, 2),
('B003', 1, 1);

-- 8. Passengers (NEW TABLE DATA)
INSERT INTO passengers (booking_id, name, age, gender) VALUES
('B001', 'Umesh Prasad', 30, 'Male'),
('B002', 'Rahul Sharma', 28, 'Male'),
('B002', 'Neha Sharma', 26, 'Female');

-- 9. Payments (NEW TABLE DATA)
INSERT INTO payments (payment_id, booking_id, amount, payment_method, payment_status) VALUES
('TXN1001', 'B001', 16240.00, 'Credit Card', 'Success'),
('TXN1002', 'B002', 8736.00, 'UPI', 'Success'),
('TXN1003', 'B003', 16800.00, 'Credit Card', 'Pending');

-- 10. Notifications (NEW TABLE DATA)
INSERT INTO notifications (user_id, type, title, message, action_url) VALUES
('U001', 'Booking', 'Booking Confirmed', 'Your flight F101 is confirmed.', '/my-bookings'),
('U002', 'Reminder', 'Check-in Open', 'Web check-in for flight F102 is now open.', '/checkin'),
('U003', 'Alert', 'Price Drop Alert', 'Prices for Delhi to Dubai have dropped!', '/results');

-- 11. Boarding Passes (NEW TABLE DATA)
INSERT INTO boarding_passes (boarding_pass_id, booking_id, seat_id, gate, terminal, boarding_time) VALUES
('BP-A8F3-01', 'B001', 1, 'B12', 'T2', '07:15:00');

-- 12. Price Alerts (NEW TABLE DATA)
INSERT INTO price_alerts (user_id, source, destination, target_price) VALUES
('U001', 'Mumbai', 'Goa', 3000.00),
('U002', 'Delhi', 'London', 45000.00);

-- 13. Saved Passengers (NEW TABLE DATA)
INSERT INTO saved_passengers (user_id, name, email, phone, age, gender, relation) VALUES
('U002', 'Neha Sharma', 'neha@example.com', '+91-9876543299', 26, 'Female', 'Spouse');

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================





