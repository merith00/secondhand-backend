delete from shop_order_items;
delete from shop_orders;
delete from sales;
delete from items;
delete from customers;

ALTER TABLE customers AUTO_INCREMENT = 1;
ALTER TABLE items AUTO_INCREMENT = 1;
ALTER TABLE sales AUTO_INCREMENT = 1;
ALTER TABLE shop_orders AUTO_INCREMENT = 1;
ALTER TABLE shop_order_items AUTO_INCREMENT = 1;

INSERT INTO customers (customer_number, first_name, last_name, street, house_number, postal_code, city, phone, email)
VALUES
('CUST-1001', 'Max', 'Mustermann', 'Hauptstraße', '1', '49661', 'Cloppenburg', '015112345678', 'max@example.de'),
('CUST-1002', 'Anna', 'Schmidt', 'Bahnhofstraße', '12', '49661', 'Cloppenburg', '015198765432', 'anna@example.de'),
('CUST-1003', 'Tim', 'Meyer', 'Lange Straße', '45', '26169', 'Friesoythe', '017012345678', 'tim@example.de'),
('CUST-1004', 'Laura', 'Fischer', 'Dorfstraße', '8', '26197', 'Großenkneten', '016012345678', 'laura@example.de'),
('CUST-1005', 'Jonas', 'Wagner', 'Mühlenweg', '22', '49685', 'Emstek', '015112312312', 'jonas@example.de'),
('CUST-1006', 'Lisa', 'Becker', 'Am Markt', '3', '49624', 'Löningen', '015198712312', 'lisa@example.de'),
('CUST-1007', 'Paul', 'Hoffmann', 'Ringstraße', '14', '49632', 'Essen (Oldenburg)', '017098765432', 'paul@example.de');


INSERT INTO items (owner_customer_id, title, description, category, size, brand, color, price, is_online_visible)
VALUES
(1, 'Nike Hoodie', 'Sehr guter Zustand', 'Hoodie', 'M', 'Nike', 'Schwarz', 35.00, 1),
(2, 'Zara Jeans', 'Slim Fit', 'Hose', 'S', 'Zara', 'Blau', 25.00, 1),
(3, 'Adidas T-Shirt', 'Kaum getragen', 'Shirt', 'L', 'Adidas', 'Weiß', 15.00, 0),
(4, 'H&M Jacke', 'Winterjacke', 'Jacke', 'M', 'H&M', 'Grau', 40.00, 1),
(5, 'Levi’s Jeans', 'Vintage', 'Hose', 'M', 'Levis', 'Hellblau', 50.00, 1),
(6, 'Puma Sneaker', 'Größe 42', 'Schuhe', '42', 'Puma', 'Weiß', 45.00, 1),
(7, 'Tommy Hilfiger Pullover', 'Top Zustand', 'Pullover', 'L', 'Tommy Hilfiger', 'Rot', 60.00, 0),
(1, 'Guess Tasche', 'Damen Tasche', 'Accessoires', 'One Size', 'Guess', 'Beige', 55.00, 1),
(2, 'Nike Jogginghose', 'Bequem', 'Hose', 'M', 'Nike', 'Schwarz', 30.00, 1),
(3, 'Adidas Hoodie', 'Oversize', 'Hoodie', 'XL', 'Adidas', 'Grün', 35.00, 0);

INSERT INTO sales (item_id, owner_customer_id, buyer_customer_id, sale_price, owner_amount, shop_amount, sale_type, payment_method)
VALUES
(1, 1, 2, 35.00, 17.50, 17.50, 'store', 'cash'),
(2, 2, 3, 25.00, 12.50, 12.50, 'store', 'cash'),
(3, 3, 1, 15.00, 7.50, 7.50, 'store', 'cash'),
(4, 4, 5, 40.00, 20.00, 20.00, 'online', 'bank_transfer'),
(5, 5, 6, 50.00, 25.00, 25.00, 'online', 'bank_transfer');


INSERT INTO shop_orders (
  order_number, first_name, last_name, email, street, house_number, postal_code, city, total_amount
)
VALUES
('ORD-1001', 'Felix', 'Krüger', 'felix@example.de', 'Teststraße', '5', '49661', 'Cloppenburg', 75.00),
('ORD-1002', 'Sarah', 'Neumann', 'sarah@example.de', 'Wiesenweg', '10', '26169', 'Friesoythe', 40.00);


INSERT INTO shop_order_items (order_id, item_id, item_title, item_price)
VALUES
(1, 6, 'Puma Sneaker', 45.00),
(1, 8, 'Guess Tasche', 30.00),
(2, 9, 'Nike Jogginghose', 30.00);

commit;