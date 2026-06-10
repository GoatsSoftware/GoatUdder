-- GoatUdder Database Schema

-- Pads de chèvre
CREATE TABLE pads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    capacity INT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    amenities TEXT[],
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Réservations
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    pad_id INT REFERENCES pads(id),
    user_id INT REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chèvres
CREATE TABLE goats (
    id SERIAL PRIMARY KEY,
    pad_id INT REFERENCES pads(id),
    name VARCHAR(50) NOT NULL,
    breed VARCHAR(50) NOT NULL,
    age INT,
    milk_production DECIMAL(10,2),
    health_status VARCHAR(20) DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paiements
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    pad_id INT REFERENCES pads(id),
    user_id INT REFERENCES users(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données seed
INSERT INTO pads (name, location, capacity, price_per_day, amenities, status) VALUES
('Pasteur Alpine', 'Montagnes des Pyrénées', 20, 25.00, '{"grazing_area", "water_source", "shade"}', 'available'),
('Prairie Normande', 'Normandie, France', 15, 20.00, '{"grazing_area", "milking_station", "veterinary"}', 'available'),
('Valée Saanen', 'Valée d''Aop, France', 25, 30.00, '{"grazing_area", "water_source", "shade", "milking_station"}', 'available'),
('Pâturage Montbéliarde', 'Jura, France', 18, 22.00, '{"grazing_area", "shade"}', 'available');

INSERT INTO goats (pad_id, name, breed, age, milk_production, health_status) VALUES
(1, 'Fleur', 'Alpine', 4, 3.5, 'healthy'),
(1, 'Nana', 'Alpine', 6, 4.0, 'healthy'),
(2, 'Lola', 'Normande', 3, 2.8, 'healthy'),
(2, 'Rosa', 'Normande', 5, 3.2, 'healthy'),
(3, 'Marie', 'Saanen', 2, 4.5, 'healthy'),
(3, 'Camille', 'Saanen', 7, 3.8, 'healthy'),
(4, 'Sophie', 'Montbéliarde', 4, 3.0, 'healthy'),
(4, 'Émilie', 'Montbéliarde', 3, 2.9, 'healthy');