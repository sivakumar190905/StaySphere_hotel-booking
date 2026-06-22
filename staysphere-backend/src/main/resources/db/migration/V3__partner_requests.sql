-- Create partner_requests table for onboarding review
CREATE TABLE partner_requests (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    hotel_name VARCHAR(255) NOT NULL,
    hotel_address TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
