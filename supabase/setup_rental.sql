-- -------------------------------------------------------------
-- READY2DRIVESV RENTAL MODULE SETUP
-- -------------------------------------------------------------

-- Enums for Rental Module
DO $$ BEGIN
    CREATE TYPE transmission_type AS ENUM ('AUTOMATIC', 'MANUAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fuel_type AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rental_status AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RentalCar Table
CREATE TABLE IF NOT EXISTS rental_cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    vehicle_class TEXT NOT NULL, -- e.g., 'Platinum Class', 'Economy'
    image_url TEXT,
    seats INTEGER DEFAULT 4,
    doors INTEGER DEFAULT 4,
    luggage_capacity INTEGER DEFAULT 2,
    transmission transmission_type DEFAULT 'AUTOMATIC',
    fuel_type fuel_type DEFAULT 'GASOLINE',
    price_per_day FLOAT NOT NULL,
    status rental_status DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RentalReservation Table
CREATE TABLE IF NOT EXISTS rental_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    rental_car_id UUID REFERENCES rental_cars(id) NOT NULL,
    pickup_location TEXT NOT NULL,
    return_location TEXT NOT NULL,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    renters_age_check BOOLEAN DEFAULT true,
    promo_code TEXT,
    total_price FLOAT NOT NULL,
    status reservation_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE rental_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_reservations ENABLE ROW LEVEL SECURITY;

-- Policies for rental_cars
CREATE POLICY "Allow public read access to rental_cars" ON rental_cars
    FOR SELECT USING (true);

-- Policies for rental_reservations
CREATE POLICY "Allow users to view their own reservations" ON rental_reservations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create reservations" ON rental_reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Data for rental_cars
INSERT INTO rental_cars (plate, brand, model, year, vehicle_class, image_url, seats, doors, luggage_capacity, transmission, fuel_type, price_per_day, status)
VALUES 
('P-123456', 'Toyota', 'Corolla', 2024, 'Economy', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800', 5, 4, 2, 'AUTOMATIC', 'GASOLINE', 45.0, 'AVAILABLE'),
('P-789012', 'Mercedes-Benz', 'C-Class', 2024, 'Platinum Class', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800', 5, 4, 3, 'AUTOMATIC', 'HYBRID', 120.0, 'AVAILABLE'),
('P-345678', 'Ford', 'Explorer', 2023, 'SUV', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', 7, 4, 4, 'AUTOMATIC', 'GASOLINE', 85.0, 'AVAILABLE'),
('P-901234', 'Tesla', 'Model 3', 2024, 'Electric', 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=800', 5, 4, 2, 'AUTOMATIC', 'ELECTRIC', 110.0, 'AVAILABLE');
