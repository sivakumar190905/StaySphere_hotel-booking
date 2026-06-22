-- Normalize existing roles to uppercase
UPDATE users SET role = UPPER(role);

-- Add email verification flag to users
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Add entity tracking to activity_logs for audit trails
ALTER TABLE activity_logs ADD COLUMN entity_type VARCHAR(100);
ALTER TABLE activity_logs ADD COLUMN entity_id VARCHAR(100);

-- Create password_reset_tokens table
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL
);

-- Create payments table
CREATE TABLE payments (
    id VARCHAR(100) PRIMARY KEY,
    booking_id VARCHAR(100) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    method VARCHAR(50) NOT NULL, -- 'CARD', 'UPI', 'NETBANKING', 'CASH'
    status VARCHAR(50) NOT NULL, -- 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'
    transaction_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE invoices (
    id VARCHAR(100) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    booking_id VARCHAR(100) UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    subtotal DOUBLE PRECISION NOT NULL,
    discount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    cgst DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    sgst DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create guest_requests table
CREATE TABLE guest_requests (
    id BIGSERIAL PRIMARY KEY,
    booking_id VARCHAR(100) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    request_type VARCHAR(150) NOT NULL, -- 'Extra Towels', 'Extra Pillow', 'Airport Pickup', 'Late Checkout'
    details TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create support_tickets table
CREATE TABLE support_tickets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'PENDING', 'RESOLVED', 'CLOSED'
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create reward_points table
CREATE TABLE reward_points (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INT NOT NULL DEFAULT 0,
    transaction_type VARCHAR(50) NOT NULL, -- 'EARNED', 'REDEEMED'
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_tickets table
CREATE TABLE maintenance_tickets (
    id BIGSERIAL PRIMARY KEY,
    room_number_id BIGINT NOT NULL REFERENCES room_numbers(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'RESOLVED'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
