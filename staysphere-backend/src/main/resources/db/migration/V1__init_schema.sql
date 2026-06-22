-- Enable UUID support if needed (we'll use SERIAL or custom VARCHAR IDs as present in frontend)

-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL, -- 'customer', 'partner', 'staff', 'admin'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for authentication lookups
CREATE INDEX idx_users_email ON users(email);

-- 2. Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- 3. Hotels Table
CREATE TABLE hotels (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    stars INT NOT NULL,
    rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    review_count INT NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    base_price DOUBLE PRECISION NOT NULL,
    tag VARCHAR(100), -- 'Best Seller', 'Luxury Stay', 'Free Cancellation', etc.
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_rating ON hotels(rating);

-- 4. Hotel Images Table
CREATE TABLE hotel_images (
    id BIGSERIAL PRIMARY KEY,
    hotel_id VARCHAR(100) NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- 5. Hotel Amenities Table
CREATE TABLE hotel_amenities (
    id BIGSERIAL PRIMARY KEY,
    hotel_id VARCHAR(100) NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    amenity VARCHAR(255) NOT NULL
);

-- 6. Rooms Table
CREATE TABLE rooms (
    id VARCHAR(100) PRIMARY KEY,
    hotel_id VARCHAR(100) NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'deluxe', 'suite', 'standard', 'family'
    price DOUBLE PRECISION NOT NULL,
    guests_capacity INT NOT NULL,
    beds_capacity INT NOT NULL,
    size_sq_ft INT NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Room Amenities Table
CREATE TABLE room_amenities (
    id BIGSERIAL PRIMARY KEY,
    room_id VARCHAR(100) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amenity VARCHAR(255) NOT NULL
);

-- 8. Room Images Table
CREATE TABLE room_images (
    id BIGSERIAL PRIMARY KEY,
    room_id VARCHAR(100) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- 9. Room Numbers Table (Live inventory tracker)
CREATE TABLE room_numbers (
    id BIGSERIAL PRIMARY KEY,
    room_id VARCHAR(100) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    number VARCHAR(50) NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'Available' -- 'Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'Blocked'
);

-- 10. Reviews Table
CREATE TABLE reviews (
    id VARCHAR(100) PRIMARY KEY,
    hotel_id VARCHAR(100) NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    rating DOUBLE PRECISION NOT NULL,
    date DATE NOT NULL,
    comment TEXT NOT NULL,
    positive_points TEXT,
    negative_points TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);

-- 11. Bookings Table
CREATE TABLE bookings (
    id VARCHAR(100) PRIMARY KEY,
    hotel_id VARCHAR(100) REFERENCES hotels(id) ON DELETE SET NULL,
    hotel_name VARCHAR(255) NOT NULL,
    hotel_image TEXT NOT NULL,
    room_id VARCHAR(100) REFERENCES rooms(id) ON DELETE SET NULL,
    room_name VARCHAR(255) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    rooms_count INT NOT NULL,
    total_price DOUBLE PRECISION NOT NULL,
    guest_full_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(100) NOT NULL,
    special_requests TEXT,
    payment_method VARCHAR(255) NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'Pending Approval', -- 'Pending Approval', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled', 'Refunded'
    coupon_code VARCHAR(50),
    discount_amount DOUBLE PRECISION DEFAULT 0.0,
    cgst DOUBLE PRECISION DEFAULT 0.0,
    sgst DOUBLE PRECISION DEFAULT 0.0,
    gst_company VARCHAR(255),
    gstin VARCHAR(100),
    assigned_room_number VARCHAR(50),
    qr_code_token VARCHAR(255),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);

-- 12. Favorites Table (ManyToMany Join Table)
CREATE TABLE favorites (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id VARCHAR(100) NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, hotel_id)
);

-- 13. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    time_string VARCHAR(100) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- 14. Activity Logs (Audit Logs)
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
