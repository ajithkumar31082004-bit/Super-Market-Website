-- Schema for Super Market Backend

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category VARCHAR(100),
    image VARCHAR(255),
    stock INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert dummy data
INSERT INTO products (name, description, price, original_price, category, image, stock, featured) VALUES
('Organic Apples', 'Fresh organic apples from Himachal Pradesh orchards, rich in vitamins and antioxidants.', 120.00, 140.00, 'Fruits', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 45, true),
('Fresh Cow Milk', 'Pure pasteurized cow milk, rich in calcium and vitamins.', 60.00, NULL, 'Dairy', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 120, true),
('Brown Bread', 'Whole wheat brown bread, perfect for sandwiches and toast.', 40.00, NULL, 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 75, true),
('Fresh Potatoes', 'Fresh farm potatoes, great for curries and fries.', 30.00, NULL, 'Vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 200, false),
('Orange Juice', '100% pure orange juice without added sugar.', 90.00, NULL, 'Beverages', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 50, true),
('Fresh Tomatoes', 'Red ripe tomatoes, perfect for salads and cooking.', 25.00, NULL, 'Vegetables', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 150, false),
('Farm Eggs', 'Fresh farm eggs, rich in protein and nutrients.', 80.00, NULL, 'Dairy', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 90, true),
('Bananas', 'Fresh bananas, great source of potassium.', 40.00, NULL, 'Fruits', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 100, false),
('Coca Cola', 'Classic Coca Cola soft drink.', 50.00, NULL, 'Beverages', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 200, false),
('Lays Chips', 'Classic salted potato chips.', 20.00, NULL, 'Snacks', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 300, false),
('Basmati Rice', 'Premium quality basmati rice, long grain.', 120.00, NULL, 'Grains', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 80, true),
('Toor Dal', 'High protein toor dal for daily cooking.', 140.00, NULL, 'Pulses', 'https://images.unsplash.com/photo-1596040033221-a1f4f8a7c8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 60, false),
('Chicken Breast', 'Fresh chicken breast, boneless and skinless.', 250.00, NULL, 'Meat', 'https://images.unsplash.com/photo-1604503468508-5e5e7d5b5b1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 40, true),
('Fresh Fish', 'Fresh seawater fish, cleaned and ready to cook.', 300.00, NULL, 'Seafood', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 30, false),
('Paneer', 'Fresh cottage cheese, perfect for curries.', 180.00, NULL, 'Dairy', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 50, true),
('Butter', 'Pure butter for cooking and baking.', 60.00, NULL, 'Dairy', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 70, false),
('Cooking Oil', 'Refined sunflower oil for cooking.', 180.00, NULL, 'Cooking', 'https://images.unsplash.com/photo-1533050487297-09b450131914?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 45, false),
('Sugar', 'Fine granulated sugar.', 45.00, NULL, 'Groceries', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 120, false),
('Tea Leaves', 'Premium quality tea leaves.', 150.00, NULL, 'Beverages', 'https://images.unsplash.com/photo-1561047029-3000c68339ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 60, true),
('Coffee Powder', '100% pure coffee powder.', 200.00, NULL, 'Beverages', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 40, true);
