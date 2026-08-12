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


ALTER TABLE items ADD COLUMN image_url VARCHAR(500) NULL;


ALTER TABLE sales
ADD COLUMN buyer_customer_id BIGINT NOT NULL,
ADD CONSTRAINT fk_sales_buyer
    FOREIGN KEY (buyer_customer_id) REFERENCES customers(id);


    CREATE TABLE IF NOT EXISTS item_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('category', 'size', 'brand', 'color') NOT NULL,
    value VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_item_option (type, value)
);

INSERT IGNORE INTO item_options (type, value) VALUES
-- Kategorien
('category', 'T-Shirt'),
('category', 'Hose'),
('category', 'Jeans'),
('category', 'Kleid'),
('category', 'Rock'),
('category', 'Hemd'),
('category', 'Bluse'),
('category', 'Pullover'),
('category', 'Hoodie'),
('category', 'Jacke'),
('category', 'Mantel'),
('category', 'Weste'),
('category', 'Shorts'),
('category', 'Leggings'),
('category', 'Jogginghose'),
('category', 'Anzug'),
('category', 'Sakko'),
('category', 'Blazer'),
('category', 'Schlafbekleidung'),
('category', 'Unterwäsche'),
('category', 'Bademode'),
('category', 'Schuhe'),
('category', 'Accessoires'),
('category', 'Sonstiges'),

-- Größen
('size', 'XS'),
('size', 'S'),
('size', 'M'),
('size', 'L'),
('size', 'XL'),
('size', '32'),
('size', '34'),
('size', '36'),
('size', '38'),
('size', '40'),
('size', '42'),
('size', '44'),

-- Marken
('brand', 'Nike'),
('brand', 'Adidas'),
('brand', 'Puma'),
('brand', 'Reebok'),
('brand', 'Under Armour'),
('brand', 'New Balance'),
('brand', 'Asics'),
('brand', 'Converse'),
('brand', 'Vans'),
('brand', 'Fila'),
('brand', 'Levi''s'),
('brand', 'Tommy Hilfiger'),
('brand', 'Calvin Klein'),
('brand', 'Ralph Lauren'),
('brand', 'H&M'),
('brand', 'Zara'),
('brand', 'Uniqlo'),
('brand', 'Only'),
('brand', 'Vero Moda'),
('brand', 'Mango'),
('brand', 'Esprit'),
('brand', 'Jack & Jones'),
('brand', 'Superdry'),
('brand', 'Sonstiges'),

-- Farben
('color', 'Schwarz'),
('color', 'Weiß'),
('color', 'Grau'),
('color', 'Rot'),
('color', 'Blau'),
('color', 'Grün'),
('color', 'Gelb'),
('color', 'Orange'),
('color', 'Lila'),
('color', 'Braun'),
('color', 'Beige'),
('color', 'Rosa'),
('color', 'Türkis'),
('color', 'Silber'),
('color', 'Gold'),
('color', 'Bunt'),
('color', 'Sonstiges');



ALTER TABLE sales
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(36) NULL AFTER id;

CREATE INDEX idx_sales_transaction_id
ON sales (transaction_id);


ALTER TABLE sales
ADD COLUMN buyer_credit_used DECIMAL(10, 2) NULL
AFTER buyer_customer_id,
ADD COLUMN buyer_cash_paid DECIMAL(10, 2) NOT NULL DEFAULT 0
AFTER buyer_credit_used,
ADD COLUMN cash_difference_confirmed TINYINT(1) NOT NULL DEFAULT 0
AFTER buyer_cash_paid;