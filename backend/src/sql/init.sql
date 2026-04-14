CREATE DATABASE IF NOT EXISTS secondhand CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE secondhand;

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    street VARCHAR(150),
    house_number VARCHAR(20),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(150),
    notes TEXT,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_customer_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    size VARCHAR(30),
    brand VARCHAR(100),
    color VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    status ENUM('active', 'reserved', 'sold', 'withdrawn') NOT NULL DEFAULT 'active',
    is_in_store TINYINT(1) NOT NULL DEFAULT 1,
    is_online_visible TINYINT(1) NOT NULL DEFAULT 0,
    sold_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_owner FOREIGN KEY (owner_customer_id) REFERENCES customers(id)
);


CREATE TABLE IF NOT EXISTS sales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL UNIQUE,
    owner_customer_id BIGINT NOT NULL,
    sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sale_price DECIMAL(10, 2) NOT NULL,
    owner_amount DECIMAL(10, 2) NOT NULL,
    shop_amount DECIMAL(10, 2) NOT NULL,
    sale_type ENUM('store', 'online') NOT NULL DEFAULT 'store',
    payment_method ENUM('cash', 'bank_transfer') NOT NULL DEFAULT 'cash',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_item FOREIGN KEY (item_id) REFERENCES items(id),
    CONSTRAINT fk_sales_owner FOREIGN KEY (owner_customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS shop_orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  street VARCHAR(150) NOT NULL,
  house_number VARCHAR(20),
  postal_code VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  payment_method ENUM('bank_transfer') NOT NULL DEFAULT 'bank_transfer',
  order_status ENUM('open', 'reserved', 'paid', 'shipped', 'completed', 'cancelled') NOT NULL DEFAULT 'open',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  item_id BIGINT NOT NULL UNIQUE,
  item_title VARCHAR(150) NOT NULL,
  item_price DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shop_order_items_order FOREIGN KEY (order_id) REFERENCES shop_orders(id),
  CONSTRAINT fk_shop_order_items_item FOREIGN KEY (item_id) REFERENCES items(id)
);


ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL;