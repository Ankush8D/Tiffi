-- ============================================================
-- TIFFI DATABASE SCHEMA
-- MySQL 8 | Timezone: Asia/Kolkata
-- ============================================================

CREATE DATABASE IF NOT EXISTS tiffi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tiffi_db;

-- ============================================================
-- OWNERS
-- ============================================================
CREATE TABLE IF NOT EXISTS owners (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                    VARCHAR(100) NOT NULL,
    phone                   VARCHAR(15) NOT NULL UNIQUE,
    business_name           VARCHAR(150) NOT NULL,
    business_logo_url       VARCHAR(500),
    upi_id                  VARCHAR(100),
    address                 TEXT,
    working_days_per_month  INT DEFAULT 26,
    default_cutoff_time     TIME DEFAULT '10:00:00',
    is_deleted              BOOLEAN DEFAULT FALSE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
);

-- ============================================================
-- DELIVERY BOYS
-- ============================================================
CREATE TABLE IF NOT EXISTS delivery_boys (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id    BIGINT NOT NULL,
    name        VARCHAR(100) NOT NULL,
    phone       VARCHAR(15) NOT NULL,
    zone        VARCHAR(100),
    is_active   BOOLEAN DEFAULT TRUE,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    INDEX idx_owner_id (owner_id)
);

-- ============================================================
-- PACKAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS packages (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id    BIGINT NOT NULL,
    name        VARCHAR(100) NOT NULL,
    meal_type   ENUM('lunch', 'dinner', 'both') NOT NULL DEFAULT 'both',
    price       DECIMAL(10,2) NOT NULL,
    tiffin_count INT NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    INDEX idx_owner_id (owner_id)
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id                BIGINT NOT NULL,
    customer_code           VARCHAR(10) NOT NULL,
    name                    VARCHAR(100) NOT NULL,
    phone                   VARCHAR(15) NOT NULL,
    photo_url               VARCHAR(500),
    address                 TEXT,
    zone                    VARCHAR(100),
    package_id              BIGINT,
    tiffins_total           INT DEFAULT 0,
    tiffins_remaining       INT DEFAULT 0,
    subscription_start      DATE,
    subscription_end        DATE,
    delivery_boy_id         BIGINT,
    notes                   TEXT,
    status                  ENUM('active', 'paused', 'expired') DEFAULT 'active',
    referral_code           VARCHAR(20) UNIQUE,
    referred_by_customer_id BIGINT,
    is_deleted              BOOLEAN DEFAULT FALSE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    FOREIGN KEY (delivery_boy_id) REFERENCES delivery_boys(id) ON DELETE SET NULL,
    FOREIGN KEY (referred_by_customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    UNIQUE KEY uq_owner_customer_code (owner_id, customer_code),
    INDEX idx_owner_id (owner_id),
    INDEX idx_phone (phone),
    INDEX idx_customer_code (customer_code),
    INDEX idx_status (status)
);

-- ============================================================
-- MENUS
-- ============================================================
CREATE TABLE IF NOT EXISTS menus (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id    BIGINT NOT NULL,
    date        DATE NOT NULL,
    meal_type   ENUM('lunch', 'dinner') NOT NULL,
    description TEXT,
    photo_url   VARCHAR(500),
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_owner_date_meal (owner_id, date, meal_type),
    INDEX idx_owner_date (owner_id, date)
);

-- ============================================================
-- DELIVERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS deliveries (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    owner_id    BIGINT NOT NULL,
    date        DATE NOT NULL,
    meal_type   ENUM('lunch', 'dinner') NOT NULL,
    status      ENUM('delivered', 'missed', 'leave', 'holiday', 'pending') DEFAULT 'pending',
    marked_by   BIGINT,
    marked_at   TIMESTAMP,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_customer_date_meal (customer_id, date, meal_type),
    INDEX idx_owner_date (owner_id, date),
    INDEX idx_customer_id (customer_id)
);

-- ============================================================
-- LEAVES
-- ============================================================
CREATE TABLE IF NOT EXISTS leaves (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    date        DATE NOT NULL,
    meal_type   ENUM('lunch', 'dinner', 'both') NOT NULL DEFAULT 'both',
    reason      VARCHAR(255),
    status      ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    applied_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_customer_id (customer_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id         BIGINT NOT NULL,
    owner_id            BIGINT NOT NULL,
    amount              DECIMAL(10,2) NOT NULL,
    payment_mode        ENUM('cash', 'upi', 'card', 'online') NOT NULL,
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    status              ENUM('paid', 'partial', 'pending') DEFAULT 'pending',
    payment_date        DATE,
    notes               TEXT,
    is_deleted          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    INDEX idx_customer_id (customer_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status)
);

-- ============================================================
-- EXTRA ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS extra_items (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id            BIGINT NOT NULL,
    name                VARCHAR(100) NOT NULL,
    price               DECIMAL(10,2) NOT NULL,
    is_available_today  BOOLEAN DEFAULT FALSE,
    is_deleted          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    INDEX idx_owner_id (owner_id)
);

-- ============================================================
-- EXTRA ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS extra_orders (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id  BIGINT NOT NULL,
    owner_id     BIGINT NOT NULL,
    date         DATE NOT NULL,
    items        JSON NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status       ENUM('placed', 'confirmed', 'delivered') DEFAULT 'placed',
    is_deleted   BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    INDEX idx_customer_date (customer_id, date)
);

-- ============================================================
-- REFERRAL REWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_rewards (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    referrer_id  BIGINT NOT NULL,
    referred_id  BIGINT NOT NULL,
    reward_type  VARCHAR(50) DEFAULT 'free_tiffins',
    reward_value INT DEFAULT 2,
    is_applied   BOOLEAN DEFAULT FALSE,
    is_deleted   BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (referred_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- ============================================================
-- FEEDBACK
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    delivery_id BIGINT,
    rating      ENUM('thumbs_up', 'thumbs_down') NOT NULL,
    comment     TEXT,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    user_type   ENUM('owner', 'customer', 'delivery_boy') NOT NULL,
    title       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    type        VARCHAR(50),
    is_read     BOOLEAN DEFAULT FALSE,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id, user_type),
    INDEX idx_is_read (is_read)
);
