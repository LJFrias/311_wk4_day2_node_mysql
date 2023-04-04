CREATE TABLE regUser (
  id int primary key auto_increment,
  username varchar(50) NOT null unique,
  password_hash varchar(1000) NOT null,
  full_name varchar(100) NOT null
)
