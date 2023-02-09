CREATE TABLE users (
    email TEXT PRIMARY KEY,
    pass TEXT,
    firstName TEXT,
    surName TEXT,
    gender TEXT,
    city TEXT,
    country TEXT
);

CREATE TABLE messages (
    messageNo INTEGER PRIMARY KEY AUTOINCREMENT,    -- Var tvungen att ha "PRIMARY KEY" innan för att AUTOINCREMENT ska funka
    email TEXT,                             
    fromEmail TEXT,
    content TEXT,

    -- PRIMARY KEY (email, messageNo),
    FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE loggedInUsers (
    email TEXT PRIMARY KEY,
    token TEXT,

    FOREIGN KEY (email) REFERENCES users(email)
);

INSERT INTO users VALUES
('test@test.test', 'test' , 'test', 'test', 'Male', 'test', 'test'),
('johan@me.se', 'pass123', 'Johan', 'Klasén', 'Male', 'Linköping', 'Sweden'),
('wilvo@me.se', 'asd123', 'Wilhelm', 'von Kantzow', 'Male', 'Linköping', 'Sweden'),
('bo@bob.com', 'volvo240', 'Bo', 'Bosson', 'Other', 'Byboda', 'Svärje');


-- Måste stå "null" på AUTOINCREMENT kolumnen..
INSERT INTO messages VALUES
(null, 'johan@me.se', 'johan@me.se', 'First!'),
(null, 'test@test.test', 'test@test.test', 'test'),
(null, 'wilvo@me.se', 'johan@me.se', 'Tja fan!'),
(null, 'johan@me.se', 'wilvo@me.se', 'Hej kompis!');



-- CREATE TABLE shadow (
--     email VARCHAR(30) PRIMARY KEY,
--     pass VARCHAR(30),

--     FOREIGN KEY (email) REFERENCES users(email)
-- );

-- INSERT INTO shadow VALUES
-- ('test@test.test', 'test'),
-- ('johan@me.se', 'pass123'),
-- ('wilvo@me.se', 'asd123'),
-- ('bo@bob.com', 'volvo240');