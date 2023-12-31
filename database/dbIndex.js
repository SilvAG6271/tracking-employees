const mysql = require("mysql2");
//connecting to mysql
class Database {
    constructor() {
        this.connection = null;
    }


async connect() {
    try {
        if(!this.connection) {
        this.connection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "JavaTac9753!",
            database: "hospital_hr"
        });
        console.log("Connected to the hospital_db database.");
        }
    } catch (err) {
        throw err;
    
    }
}

//sql logic used to get the info from the tables

    findAllDepartments() {
        return this.connection.promise().query("SELECT * FROM department");
    }

    findAllRoles() {
        return this.connection.promise()
        .query
        ("SELECT roles.id, roles.title, roles.salary, department.name AS department FROM roles LEFT JOIN department ON roles.department_id = department.id");
    }

    findAllEmployees() {
        return this.connection.promise()
        .query
        (`SELECT employee.id, CONCAT (employee.first_name, ' ' , employee.last_name) AS name, roles.title, department.name AS department, roles.salary, CONCAT(manager.first_name,'', manager.last_name) AS manager
         FROM employee LEFT JOIN roles ON employee.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id`);
    }
    addDepartment(departmentName) {
        return this.connection
        .promise()
        .query("INSERT INTO department (name) values (?)", [departmentName]);

    }

    addRoleDep(roleTitle, roleSalary, roleDepartmentId) {
        return this.connection
        .promise()
        .query("INSERT INTO roles (title, salary, department_id) VALUES ( ?, ?, ?)",
        [roleTitle, roleSalary, roleDepartmentId]);
    };

    addEmployee(answer) {
       return this.connection
       .promise()
       .query("INSERT INTO employee SET ?", answer);
    }

    updateEmployeeRole(roleId, employeeId) {
       return this.connection
       .promise()
       .query("UPDATE employee SET role_id = ? WHERE id = ?", 
       [
        roleId,
        employeeId,
       ]);
    }
    updateEmployeeManager(managerId, employeeId) {
        return this.connection
        .promise()
        .query("UPDATE employee SET employee.manager_id = ? WHERE id = ?", 
        [
            managerId,
            employeeId
        ]);
    }
    findAllManagers(employeeId) {
        return this.connection
        .promise()
        .query("SELECT * FROM employee WHERE id != ?", [employeeId]);
        
    }

    findByManager(managerId){
        return this.connection
        .promise()
        .query("SELECT employee.id, employee.manager_id, CONCAT(employee.first_name, ' ' , employee.last_name) AS name FROM employee LEFT JOIN roles on employee.role_id = roles.id WHERE manager_id = ?", [managerId]);
    }

    findByDepartment(departmentId){
        return this.connection
        .promise()
        .query(`SELECT CONCAT (employee.first_name, ' ' , employee.last_name) AS name, department.name
         AS department FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id
         WHERE department.id = ?`, [departmentId]);
    }

    deleteDepartment(departmentId){
       return this.connection
       .promise()
       .query("DELETE FROM department WHERE id = ?", [departmentId]);
    }

    deleteRole(roleId){
        return this.connection
        .promise()
        .query("DELETE FROM roles WHERE id = ?", [roleId]);

    }

    deleteEmployee(employeeId){
        return this.connection
        .promise()
        .query("DELETE FROM employee WHERE id = ?", [employeeId]);

    }
    findBudget(){
        return this.connection
        .promise()
        .query(`SELECT department.name AS department, department.id, SUM(salary) 
        AS total_salary FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id
        GROUP BY department.id`);
        
    }

    findTotalEmp(){
        return this.connection
        .promise()
        .query(`SELECT COUNT(*) AS total_employees FROM employee`);
    }

    findEmployeeCountByManager(){
        return this.connection
        .promise()
        .query(`SELECT employee.manager_id, CONCAT(manager.first_name, '', manager.last_name) AS manager_name, COUNT(*) AS employee_count FROM employee LEFT JOIN employee manager ON employee.manager_id = manager.id
        GROUP BY employee.manager_id, manager_name`);
    }
    findEmployeeCountByDepartment(){
        return this.connection
        .promise()
        .query (`SELECT department.name AS department, department.id, COUNT(employee.id) 
        AS total_employees FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id
        GROUP BY department.id`);
        
    }
}

module.exports = Database