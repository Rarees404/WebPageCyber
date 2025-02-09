-- Create the products table
CREATE TABLE IF NOT EXISTS products (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        name TEXT NOT NULL,
                                        category TEXT NOT NULL,
                                        price REAL NOT NULL,
                                        imagelink TEXT NOT NULL,
                                        numberofunits INTEGER
);

-- Insert default products only if they don't exist

INSERT INTO products (name, category, price, imagelink)
VALUES ('Aged Whiskey32', 'Alcohol', 80, '/images/whiskey.png');

INSERT INTO products (name, category, price, imagelink)
VALUES ('Aged Whiskey', 'Alcohol', 80, '/images/whiskey.png');

INSERT INTO products (name, category, price, imagelink)
VALUES ('Aged Whiskey', 'Alcohol', 80, '/images/whiskey.png');

INSERT INTO products (name, category, price, imagelink)
VALUES ('Cuban Cigar', 'Tabacoo', 100, '/images/cigar.png');

INSERT INTO products (name, category, price, imagelink)
VALUES ('Aged Whiskey', 'Alcohol', 80, '/images/whiskey.png');





CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     name TEXT NOT NULL,
                                     email TEXT UNIQUE NOT NULL,
                                     password TEXT NOT NULL,
                                     phone TEXT,
                                     address TEXT,
                                     cardnumber TEXT,
                                     carddate DATE,
                                     cvv TEXT
);

INSERT INTO users (name, email, password, phone, address, cardnumber, carddate, cvv)
VALUES
    ('John Doe', 'john.doe@example.com', 'password123', '555-1234', '123 Main St, Springfield, USA', '4111111111111111', '2025-12-31', '123'),
    ('Jane Smith', 'jane.smith@example.com', 'pass456', '555-5678', '456 Elm St, Metropolis, USA', '5500000000000004', '2026-06-30', '456'),
    ('Alice Johnson', 'alice.j@example.com', 'qwerty789', '555-9012', '789 Maple Ave, Gotham, USA', '340000000000009', '2027-03-15', '789');

CREATE TABLE IF NOT EXISTS tickets (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     description TEXT,
                                     status TEXT
);

INSERT INTO tickets (description,status)
VALUES
    ('User cannot login to the page.', 'OPEN'),
    ('Payment gateway error encountered during checkout.', 'OPEN'),
    ('Page not loading properly on mobile devices.', 'OPEN');

CREATE TABLE IF NOT EXISTS orders (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       userid INTEGER,
                                       productid INTEGER,
                                       price REAL,
                                       address TEXT,
                                       numberofunits INTEGER
);

INSERT INTO orders (userid, productid, price, address, numberofunits)
VALUES
    (1, 101, 15.99, '123 Main St, Springfield, USA', 2),
    (2, 102, 29.99, '456 Elm St, Metropolis, USA', 1),
    (3, 103, 9.99, '789 Maple Ave, Gotham, USA', 5);


CREATE TABLE IF NOT EXISTS privileges (
                                      id INTEGER ,
                                      password TEXT NOT NULL
);

INSERT INTO privileges (id,password)
VALUES (7, 'admin');





