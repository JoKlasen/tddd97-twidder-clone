CREATE TABLE users (
    email VARCHAR(30) PRIMARY KEY,
    pass VARCHAR(30),
    firstName VARCHAR(30),
    surName VARCHAR(30),
    gender VARCHAR(10),
    city VARCHAR(30),
    country VARCHAR(30)
);

CREATE TABLE messages (
    email VARCHAR(30),
    messageNo INTEGER AUTOINCREMENT,
    fromEmail VARCHAR(30),
    content VARCHAR(300),

    PRIMARY KEY (email, messageNo),
    FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE loggedInUsers (
    email VARCHAR(30) PRIMARY KEY,
    token VARCHAR(36),

    FOREIGN KEY (email) REFERENCES users(email)
);


INSERT INTO users VALUES
('test@test.test', 'test' , 'test', 'test', 'Male', 'test', 'test'),
('johan@me.se', 'pass123', 'Johan', 'Klasén', 'Male', 'Linköping', 'Sweden'),
('wilvo@me.se', 'asd123', 'Wilhelm', 'von Kantzow', 'Male', 'Linköping', 'Sweden'),
('bo@bob.com', 'volvo240', 'Bo', 'Bosson', 'Other', 'Byboda', 'Svärje');



INSERT INTO messages VALUES
('johan@me.se', 0, 'johan@me.se', 'First!'),
('test@test.test', 1, 'test@test.test', 'test'),
('wilvo@me.se', 2, 'johan@me.se', 'Tja fan!'),
('johan@me.se', 3, 'wilvo@me.se', 'Hej kompis!');

-- Uncomment and remove above when running restart_db next time
-- INSERT INTO messages VALUES
-- ('johan@me.se', 'johan@me.se', 'First!'),
-- ('test@test.test', 'test@test.test', 'test'),
-- ('wilvo@me.se', 'johan@me.se', 'Tja fan!'),
-- ('johan@me.se', 'wilvo@me.se', 'Hej kompis!');





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