CREATE DATABASE mvm CHARACTER SET utf8mb4 COLLATE utf8_general_ci

use mvm

CREATE TABLE files (
  id INT(20) AUTO_INCREMENT not null PRIMARY KEY,
  name varchar(255),
  content longblob
);
