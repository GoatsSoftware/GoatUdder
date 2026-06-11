-- Active: 1781193221257@@127.0.0.1@3444@goatudder
-- GoatUdder Database Schema

DROP TABLE IF EXISTS rentals;

DROP TABLE IF EXISTS goats;

CREATE TABLE goats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    available_udders INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rentals (
    id SERIAL PRIMARY KEY,
    goat_ids INTEGER[] NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);