USE hospital_hr;

INSERT INTO department(name)
VALUES 
("Supply Chain"),
("Sterile"),
("OR"),
("Rehab");

INSERT INTO roles(title, salary, department_id)
VALUES
("Supply Chain Manager", 60000, 1),
("Supply Chain Tech", 30000, 1),
("Sterile Supervisor", 60000, 2),
("Sterile Tech", 30000, 2),
("OR Manager", 150000, 3),
("Lead Nurse", 120000, 3),
("OR nurse", 100000, 3),
("Surgical Tech", 80000, 3),
("Rehab Supervisor", 70000, 4),
("Rehab Tech", 45000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Nikki", "Park", 1, NULL),
("Charles", "Webster",3 , NULL),
("Zoe", "Chen", 9, NULL),
("Yeji", "Kim", 5, NULL),
("Joshua", "Hernandez",2 , 1),
("Vivian", "Illieva", 4, 2),
("Albert", "Morehouse", 6, 4),
("Erin", "West", 7, 4),
("Michelle", "Robinson", 8, 4),
("Thomas", "Wilks", 10, 3);
