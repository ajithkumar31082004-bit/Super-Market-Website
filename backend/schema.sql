-- Schema for Super Market Backend

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'staff') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
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

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert comprehensive 52-product inventory
INSERT INTO products (name, description, price, original_price, category, image, stock, featured) VALUES
('Organic Himachal Apples', 'Crisp and juicy organic apples directly from Himachal Pradesh orchards, rich in antioxidants.', 120.00, 140.00, 'Fruits', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', 45, true),
('Fresh Bananas (Robusta)', 'Naturally ripened sweet bananas packed with potassium and essential daily vitamins.', 40.00, 50.00, 'Fruits', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', 100, false),
('Fresh Alphonso Mangoes', 'King of Mangoes! Premium Ratnagiri Alphonso mangoes with rich golden pulp and sweet aroma.', 350.00, 420.00, 'Fruits', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80', 30, true),
('Fresh Farm Strawberries', 'Handpicked Mahabaleshwar red strawberries, sweet, juicy and packed with Vitamin C.', 120.00, 150.00, 'Fruits', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80', 35, true),
('Fresh Nagpur Oranges', 'Juicy and citrusy fresh Nagpur oranges, great for fresh morning juice.', 90.00, 110.00, 'Fruits', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80', 60, false),
('Seedless Black Grapes', 'Sweet, crisp and seedless fresh black grapes straight from Nashik vineyards.', 110.00, 130.00, 'Fruits', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80', 50, false),
('Ripe Hass Avocado', 'Buttery, nutrient-dense imported Hass avocados, perfect for guacamole, salads and toast.', 180.00, 220.00, 'Fruits', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80', 25, true),
('Fresh Green Kiwi', 'Tangy and refreshing imported green kiwis loaded with dietary fiber and Vitamin C.', 95.00, 120.00, 'Fruits', 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&q=80', 40, false),
('Sweet Red Watermelon', 'Crisp, deeply hydrating sweet red flesh watermelon with refreshing natural juices.', 80.00, 100.00, 'Fruits', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80', 30, false),
('Ripe Sweet Papaya', 'Farm-fresh ripe yellow papaya rich in papain enzymes for healthy digestion.', 55.00, 70.00, 'Fruits', 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&q=80', 35, false),
('Fresh Farm Potatoes', 'Earthy, firm farm potatoes ideal for fries, curries, roasting and baking.', 30.00, 35.00, 'Vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80', 200, false),
('Red Ripe Tomatoes', 'Plump and juicy farm tomatoes, perfect for Indian gravies, soups and fresh salads.', 25.00, 35.00, 'Vegetables', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', 150, true),
('Fresh Red Onions', 'Crisp red onions with strong pungent flavor, a must-have base for Indian cooking.', 35.00, 45.00, 'Vegetables', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80', 180, false),
('Fresh Baby Spinach (Palak)', 'Tender, iron-rich hydroponic green spinach leaves, washed and ready to cook.', 30.00, 40.00, 'Vegetables', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', 60, true),
('Organic Green Broccoli', 'Crisp, pesticide-free fresh broccoli crowns high in dietary fiber and essential nutrients.', 65.00, 80.00, 'Vegetables', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80', 45, true),
('Red Bell Peppers (Capsicum)', 'Vibrant sweet red bell peppers, perfect for stir-fries, pizza toppings and pasta.', 75.00, 95.00, 'Vegetables', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80', 50, false),
('Fresh Orange Carrots', 'Crunchy sweet carrots rich in beta-carotene, ideal for salads, cooking and juices.', 45.00, 55.00, 'Vegetables', 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80', 90, false),
('Fresh White Cauliflower', 'Snowy-white fresh cauliflower florets, great for aloo gobi, roasting and curries.', 40.00, 50.00, 'Vegetables', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&q=80', 70, false),
('Green Salad Cucumber', 'Crisp and cooling green cucumbers for daily healthy salads and sandwiches.', 30.00, 40.00, 'Vegetables', 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&q=80', 80, false),
('Fresh White Button Mushrooms', 'Plump and tender button mushrooms, perfect for sauteing, pizzas, and pasta sauces.', 60.00, 75.00, 'Vegetables', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', 40, true),
('Fresh Farm Cow Milk', '100% pure pasteurized cow milk, rich in calcium, protein and essential dairy fats.', 60.00, 65.00, 'Dairy', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', 120, true),
('Farm Fresh Country Eggs (6pk)', 'Nutrient-dense farm fresh brown eggs with rich golden yolks, high in protein.', 65.00, 75.00, 'Dairy', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80', 90, true),
('Farm Fresh Eggs Value Pack (12pk)', 'Family economy value pack of 12 fresh farm eggs for your weekly breakfast needs.', 120.00, 140.00, 'Dairy', 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&q=80', 60, false),
('Fresh Soft Malai Paneer', 'Melt-in-mouth cottage cheese made from fresh whole milk, rich in dairy protein.', 180.00, 200.00, 'Dairy', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', 50, true),
('Pure Desi Cow Ghee (Bilona)', 'Traditional bilona churned pure golden cow ghee with rich granular texture and aroma.', 450.00, 520.00, 'Dairy', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400&q=80', 40, true),
('Fresh Set Thick Curd (Dahi)', 'Thick and creamy natural set dahi containing live gut-healthy probiotic cultures.', 45.00, 50.00, 'Dairy', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80', 80, false),
('Salted Pasteurised Table Butter', 'Classic creamy salted butter, perfect for hot parathas, toast, and baking.', 55.00, 60.00, 'Dairy', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80', 110, false),
('Greek Blueberry Yogurt', 'Thick, high-protein Greek yogurt blended with real antioxidant-rich blueberries.', 70.00, 85.00, 'Dairy', 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&q=80', 45, false),
('Whole Wheat Brown Bread', 'Freshly baked high-fiber whole wheat sliced bread with soft texture.', 40.00, 45.00, 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', 75, false),
('Classic White Sandwich Bread', 'Soft and fluffy everyday white sandwich bread, loved by kids and adults alike.', 35.00, 40.00, 'Bakery', 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&q=80', 80, false),
('Artisan Sourdough Loaf', 'Authentic naturally fermented crusty sourdough loaf with chewy crumb and pleasant tang.', 95.00, 120.00, 'Bakery', 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80', 25, true),
('Dark Chocolate Chip Muffins (2pk)', 'Moist, oven-baked cafe-style muffins loaded with decadent dark chocolate chips.', 80.00, 95.00, 'Bakery', 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&q=80', 35, false),
('Whole Rolled Oats', '100% whole grain rolled oats for heart-healthy oatmeal, smoothies and baking.', 160.00, 190.00, 'Bakery', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', 50, false),
('Creamy Roasted Peanut Butter', 'High-protein spread made with 100% slow-roasted peanuts without hydrogenated oils.', 190.00, 230.00, 'Bakery', 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80', 45, true),
('100% Pure Orange Juice', 'Refreshing freshly squeezed orange juice with no added sugar or preservatives.', 90.00, 110.00, 'Beverages', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80', 50, true),
('Sweet Alphonso Mango Juice', 'Rich and pulpy Alphonso mango nectar, delicious chilled on a sunny day.', 85.00, 100.00, 'Beverages', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80', 60, false),
('Sparkling Tender Coconut Water', 'Naturally isotonic coastal tender coconut water packed with natural electrolytes.', 60.00, 75.00, 'Beverages', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400&q=80', 75, true),
('Darjeeling Organic Green Tea', 'Whole leaf organic green tea from Darjeeling slopes, rich in natural antioxidants.', 160.00, 190.00, 'Beverages', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80', 40, false),
('Premium Assam CTC Strong Tea', 'Strong, brisk and malty CTC black tea blend for the perfect Indian morning chai.', 140.00, 160.00, 'Beverages', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&q=80', 65, false),
('Pure South Indian Filter Coffee', '85:15 Arabica-chicory blend roasted to perfection for traditional filter kaapi.', 200.00, 240.00, 'Beverages', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', 45, true),
('Classic Salted Potato Chips', 'Crispy golden potato slices lightly sprinkled with rock salt for crunch time.', 20.00, 25.00, 'Snacks', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80', 300, false),
('Premium California Almonds', 'Crunchy whole raw California badam/almonds, high in protein, Vitamin E and healthy fats.', 280.00, 340.00, 'Snacks', 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80', 55, true),
('Salted Roasted Cashews (Kaju)', 'Large whole Goan cashew nuts, slow-roasted with Himalayan pink salt.', 310.00, 370.00, 'Snacks', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80', 45, false),
('Roasted Peri-Peri Makhana', 'Crispy roasted foxnuts tossed in zesty African peri-peri seasoning. Zero cholesterol.', 110.00, 135.00, 'Snacks', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80', 60, true),
('70% Rich Dark Chocolate Bar', 'Intense, velvety single-origin dark chocolate crafted from fermented cocoa beans.', 130.00, 160.00, 'Snacks', 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&q=80', 50, true),
('Crunchy Danish Butter Cookies', 'Traditional oven-baked golden butter cookies that melt delicately in the mouth.', 75.00, 90.00, 'Snacks', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80', 70, false),
('Royal Aged Basmati Rice', 'Extra-long grain aromatic basmati rice aged for 2 years, perfect for royal biryanis and pulao.', 120.00, 150.00, 'Grains', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', 80, true),
('100% Whole Wheat Chakki Atta', 'Stone-ground whole wheat flour that ensures extra soft, fluffy rotis with natural bran.', 210.00, 250.00, 'Grains', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', 75, true),
('Unpolished Organic Toor Dal', 'High-protein unpolished yellow pigeon peas / toor dal, essential for sambar and dal tadka.', 140.00, 165.00, 'Grains', 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80', 65, false),
('Cold-Pressed Extra Virgin Olive Oil', 'First cold-pressed Mediterranean extra virgin olive oil for gourmet salads and healthy cooking.', 490.00, 580.00, 'Grains', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80', 35, true),
('Fresh Tender Chicken Breast', '100% farm-raised antibiotic-free boneless chicken breast fillets, cleaned and trimmed.', 250.00, 290.00, 'Meat', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80', 40, true),
('Fresh Seawater Fish Steaks (Surmai)', 'Daily morning coastal catch kingfish/surmai steaks, cleaned, sliced and packed on ice.', 300.00, 360.00, 'Meat', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', 30, false);
