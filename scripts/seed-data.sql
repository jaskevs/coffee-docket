-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, balance, total_spent, visit_count, last_visit) VALUES
('John', 'Doe', 'john.doe@email.com', 25.50, 47.25, 12, NOW() - INTERVAL '2 days'),
('Jane', 'Smith', 'jane.smith@email.com', 15.75, 89.50, 23, NOW() - INTERVAL '1 day'),
('Mike', 'Johnson', 'mike.johnson@email.com', 0.00, 156.75, 34, NOW() - INTERVAL '3 hours'),
('Sarah', 'Wilson', 'sarah.wilson@email.com', 42.25, 203.50, 45, NOW() - INTERVAL '1 hour'),
('David', 'Brown', 'david.brown@email.com', 8.50, 78.25, 18, NOW() - INTERVAL '5 days'),
('Emily', 'Davis', 'emily.davis@email.com', 33.00, 124.75, 28, NOW() - INTERVAL '6 hours'),
('Chris', 'Miller', 'chris.miller@email.com', 19.75, 95.50, 21, NOW() - INTERVAL '2 hours'),
('Lisa', 'Garcia', 'lisa.garcia@email.com', 7.25, 67.00, 15, NOW() - INTERVAL '4 days');

-- Insert sample transactions
INSERT INTO transactions (customer_id, type, amount, description) 
SELECT 
    c.id,
    'topup',
    50.00,
    'Account top-up'
FROM customers c WHERE c.email = 'john.doe@email.com';

INSERT INTO transactions (customer_id, type, amount, description) 
SELECT 
    c.id,
    'purchase',
    4.75,
    'Large Latte with Oat Milk'
FROM customers c WHERE c.email = 'john.doe@email.com';

INSERT INTO transactions (customer_id, type, amount, description) 
SELECT 
    c.id,
    'purchase',
    3.25,
    'Medium Cappuccino'
FROM customers c WHERE c.email = 'jane.smith@email.com';

INSERT INTO transactions (customer_id, type, amount, description) 
SELECT 
    c.id,
    'topup',
    25.00,
    'Account top-up'
FROM customers c WHERE c.email = 'jane.smith@email.com';

INSERT INTO transactions (customer_id, type, amount, description) 
SELECT 
    c.id,
    'purchase',
    8.95,
    'Club Sandwich'
FROM customers c WHERE c.email = 'mike.johnson@email.com';

INSERT INTO transactions (customer_id, type, amount, description) 
SELECT 
    c.id,
    'purchase',
    2.50,
    'Espresso'
FROM customers c WHERE c.email = 'sarah.wilson@email.com';

-- Insert sample menu items
INSERT INTO menu_items (name, description, category, base_price, is_available) VALUES
('Espresso', 'Rich and bold espresso shot', 'coffee', 2.50, true),
('Americano', 'Espresso with hot water', 'coffee', 3.00, true),
('Cappuccino', 'Espresso with steamed milk and foam', 'coffee', 4.25, true),
('Latte', 'Espresso with steamed milk', 'coffee', 4.75, true),
('Macchiato', 'Espresso with a dollop of steamed milk', 'coffee', 4.50, true),
('Mocha', 'Espresso with chocolate and steamed milk', 'coffee', 5.25, true),
('Green Tea', 'Fresh green tea leaves', 'tea', 3.00, true),
('Earl Grey', 'Classic black tea with bergamot', 'tea', 3.25, true),
('Chamomile', 'Soothing herbal tea', 'tea', 3.00, true),
('Croissant', 'Buttery, flaky pastry', 'pastries', 3.50, true),
('Muffin', 'Fresh baked muffin', 'pastries', 3.25, true),
('Danish', 'Sweet pastry with fruit filling', 'pastries', 4.00, true),
('Club Sandwich', 'Triple-decker with turkey, bacon, and vegetables', 'sandwiches', 8.95, true),
('Grilled Cheese', 'Classic grilled cheese sandwich', 'sandwiches', 6.50, true),
('BLT', 'Bacon, lettuce, and tomato sandwich', 'sandwiches', 7.25, true);

-- Insert sample sizes
INSERT INTO menu_sizes (name, price_modifier, is_available) VALUES
('Small', 0.00, true),
('Medium', 0.75, true),
('Large', 1.25, true),
('Extra Large', 1.75, true);

-- Insert sample add-ons
INSERT INTO menu_addons (name, price, is_available) VALUES
('Extra Shot', 0.75, true),
('Decaf', 0.00, true),
('Oat Milk', 0.60, true),
('Almond Milk', 0.60, true),
('Soy Milk', 0.50, true),
('Coconut Milk', 0.65, true),
('Vanilla Syrup', 0.50, true),
('Caramel Syrup', 0.50, true),
('Hazelnut Syrup', 0.50, true),
('Sugar-Free Vanilla', 0.50, true),
('Whipped Cream', 0.75, true),
('Extra Hot', 0.00, true),
('Extra Foam', 0.00, true),
('Light Foam', 0.00, true);
