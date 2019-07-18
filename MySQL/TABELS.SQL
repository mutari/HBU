CREATE TABLE profile (
    UserID int,
    Username varchar(255),
    Password varchar(255),
    Usericon varchar(255)
);

CREATE TABLE following (
    MainUser int,
    FolowingUser int
);

CREATE TABLE post (
    Poster varchar(255),
    Image varchar(255),
    text varchar(255)
);