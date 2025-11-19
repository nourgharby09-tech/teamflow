CREATE DATABASE IF NOT EXISTS employees_db;
USE employees_db;

-- Drop the table if it exists to ensure a clean slate
DROP TABLE IF EXISTS employees;

-- Create the employees table with the correct schema
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    age INT,
    dept_id INT,
    base_salary DECIMAL(10, 2),
    hire_date DATE
);

-- Insert your data
INSERT INTO employees (first_name, last_name, age, dept_id, base_salary, hire_date) VALUES
('Nour', 'Gharbi', 25, 1, 1600, '2022-03-01'),
('Ali', 'Mansour', 30, 2, 1800, '2021-07-15'),
('Sara', 'Ben Salah', 27, 1, 1700, '2020-11-10'),
('Omar', 'Trabelsi', 34, 4, 1900, '2019-02-20'),
('Amira', 'Jlassi', 26, 3, 1500, '2023-01-05'),
('Karim', 'Hammami', 29, 1, 1750, '2021-05-11'),
('Imen', 'Mejri', 28, 5, 1550, '2022-10-03'),
('Hatem', 'Chaabane', 31, 2, 2000, '2018-09-30'),
('Mouna', 'Louati', 24, 5, 1450, '2023-06-21'),
('Walid', 'Zitouni', 33, 1, 2100, '2017-04-19'),
('Sami', 'Ammar', 32, 4, 1850, '2019-08-12'),
('Rania', 'Krichen', 27, 3, 1550, '2020-01-14'),
('Chedi', 'Saidi', 26, 1, 1650, '2022-02-28'),
('Nadia', 'Bouaziz', 35, 2, 2200, '2016-12-01'),
('Yassine', 'Ben Ali', 29, 5, 1600, '2021-09-06'),
('Ameni', 'Souissi', 23, 3, 1400, '2024-01-10'),
('Khalil', 'Riahi', 28, 1, 1750, '2020-06-16'),
('Ons', 'Ben Amor', 27, 5, 1500, '2022-11-07'),
('Habib', 'Jerbi', 31, 4, 1950, '2019-05-29'),
('Manel', 'Chakroun', 30, 2, 2000, '2020-03-02'),
('Majdi', 'Briki', 33, 1, 2050, '2018-07-23'),
('Marwa', 'Garci', 26, 5, 1550, '2022-04-15'),
('Hamdi', 'Miled', 27, 3, 1500, '2021-11-09'),
('Hiba', 'Ayari', 25, 1, 1650, '2023-08-18'),
('Slim', 'Ben Messaoud', 34, 2, 2150, '2017-10-05'),
('Rim', 'Baccar', 28, 4, 1850, '2020-09-27'),
('Nizar', 'Guesmi', 32, 1, 2000, '2019-01-31'),
('Sahar', 'Ferchichi', 24, 5, 1450, '2023-02-12'),
('Moez', 'Kerkeni', 29, 2, 1900, '2021-03-08'),
('Leila', 'Dridi', 27, 3, 1500, '2022-05-30'),
('Houssem', 'Mtiba', 28, 1, 1750, '2020-10-10'),
('Farah', 'Toumi', 26, 5, 1550, '2022-07-21'),
('Fares', 'Hajri', 31, 2, 1950, '2019-12-02'),
('Meriam', 'Abid', 25, 3, 1450, '2023-09-14'),
('Ayoub', 'Brahmi', 30, 4, 1850, '2020-02-26'),
('Hiba', 'Nebli', 27, 1, 1700, '2021-06-06'),
('Kais', 'Belaid', 29, 5, 1600, '2021-09-19'),
('Nermine', 'Ben Youssef', 28, 2, 2000, '2019-03-16'),
('Aymen', 'Kefi', 26, 1, 1700, '2022-01-25'),
('Sinda', 'Gmati', 27, 3, 1500, '2021-04-04'),
('Salma', 'Rahali', 24, 5, 1450, '2023-03-28'),
('Youssef', 'Zaibi', 33, 4, 1900, '2018-05-07'),
('Sarra', 'Boukhris', 25, 1, 1650, '2023-11-01'),
('Iheb', 'Marzouk', 31, 2, 2050, '2018-08-22'),
('Oumaima', 'Latiri', 28, 3, 1550, '2020-12-19'),
('Mahdi', 'Ayadi', 29, 1, 1750, '2021-02-14'),
('Fatma', 'Guedri', 27, 5, 1500, '2022-06-01'),
('Zied', 'Bessaoud', 30, 4, 1850, '2019-09-09'),
('Maryem', 'Triki', 26, 2, 1950, '2020-04-13'),
('Ghassen', 'Mannai', 28, 1, 1800, '2019-06-24');
