const mysql = require("mysql2");
const inquirer = require("inquirer");
const dataB = require("./database/dbIndex")
require("console.table");

const connection = mysql.createConnection(
{ 
    host: "localhost",
    user: "root",
    password: "JavaTac9753!",
    database: "hospital_hr"
},
console.log(`Connected to the hospital_db database.`)
);   

const db = new dataB(connection);

const exit = () => {
    console.log("Have a Great Day!");
    process.exit(0);
};

const mainMenu = async() => {
  
    const answer = await inquirer.prompt([
 {
    type: "list",
    name: "choices",
    message: "What would you like do?",
    choices:[
    {name: "View all departments", value: viewDepartments}, 
    {name: "View all roles", value: viewRoles},
    {name: "view all employees", value: viewEmployees},
    {name: "Add a department", value: addDepartment},
    {name: "Add a role", value: addRole},
    {name: "Add an employee", value: addEmployee},
    {name: "Update an employee role", value: updateEmployeeRole},
    {name: "Update employee managers", value: updateManagers},
    {name: "View employees by manager", value: empByManager},
    {name: "View employees by department", value: empByDepartment},
    {name: "Delete employee", value: deleteEmployee},
    {name: "Delete role", value: deleteRole},
    {name: "Delete department", value: deleteDepartment},
    {name: "Budget for department", value: findDepBudget},
    {name: "Exit", value: exit},
    ]
 } 
]);

answer.choices();
};
function viewDepartments() {
db.findAllDepartments().then(([rows])=>
{
    console.table(rows);
    return mainMenu();
});
}
function viewRoles() {
    db.findAllRoles().then(([rows]) => {
        console.table(rows);
        return mainMenu();
    });
}
function viewEmployees() {
    db.findAllEmployees().then(([rows]) => {
        console.table(rows);
        return mainMenu();
    }); 
}

function validateInput(value) {
    if (value) {
        return true;
    }else{console.log("Please enter in a value");
return false;
}
    }

const addDepartment = async () => {
    const answer = await inquirer.prompt ([
       {
         type: "input",
         name: "department",
         message: "What is the department name that you want to add?",
         validate: validateInput
       },
]);
const departmentName = answer.department;
db.addDepartment(departmentName).then(() => {
    db.findAllDepartments().then(([rows]) => {
        console.table(rows);
        return mainMenu();
    });
});
};

const addRole = async() => {
   const [rows] = await db.findAllDepartments();
   console.table(rows);
   const departmentChoices = rows.map(({name, id}) => ({name, value: id}));
   const answer = await inquirer.prompt ([
    {
    type: "input",
    name: "position",
    message:"What role title would you like to add?",
    validate: validateInput
   },
   {
    type: "input",
    name:"salary",
    message:"What will the salary be for this role?",
    validate: validateInput
   },
   {
    type: "list",
    name:"roleDepartment",
    message:"To which department should this role be added?",
    choices: departmentChoices
   },

]); 
 db.addRoleDep(answer.position, answer.salary, answer.roleDepartment).then(() => {
    db.findAllRoles().then(([rows]) => {
    console.table(rows);
    return mainMenu();
    });
 });
};

function mapNewEmployee({id, name, manager}) {
    return {name, value:id, manager};
}

const addEmployee = async() =>{
    const [rowsA] = await db.findAllRoles();
    console.log(rowsA);
    const roleChoices = rowsA.map(({ id, title} ) => ({
        name: title,
        value: id,
    }));
    console.log(roleChoices);
    
const [rowsB] = await db.findAllEmployees();
const newEmployee = rowsB.map(mapNewEmployee);
console.log(newEmployee);

const managerChoices = [...newEmployee, {name: "Null", value: null}];
console.log(managerChoices);
const answer = await inquirer.prompt([
    {
   type:"input",
   name:"first_name",
   message:"What is the first name of the employee?",
   validate: validateInput
},
{
    type:"input",
    name:"last_name",
    message:"What is the last name of the employee?",
    validate: validateInput
 },
{
    type: "list",
    name: "role_id",
    message: "What is the role of the employee?",
    choices: roleChoices
},
{
    type: "confirm",
    name: "managerOrReg",
    message: "Does this employee have a manager?",
    default: true
},
{
    type: "list",
    name:"manager_id",
    when: (answers) => answers.managerOrReg,
    message: "Who is the manager of this employee?",
    choices: managerChoices,
    default: null

},
]);

delete answer.managerOrReg;
console.log(answer);
db.addEmployee(answer).then(() => {
db.findAllEmployees().then(([rows]) => {
    console.table(rows);
    return mainMenu();
});
});
};
 const updateEmployeeRole = async () => {
    const [rowsA] = await db.findAllRoles();
    console.table(rowsA);
    const roleChoices = rowsA.map(({id, title})=> ({
        name: title,
        value: id,
    }));
    console.log(roleChoices);

    const [rowsB] = await db.findAllEmployees();
    const newEmployee = rowsB.map(mapNewEmployee);
    console.log(newEmployee);

    const answer = await inquirer.prompt([
        {
            type:"list",
            name: "employee",
            message: "Which employee's role do you want to update?",
            choices: newEmployee
        },

        {
            type: "list",
            name: "role",
            message: "What is the new role for this employee?",
            choices: roleChoices
        }
    ]);
    console.log("Selected employee ID", answer.employee);
    console.log("Selected role ID", answer.role)
    db.updateEmployeeRole(answer.role, answer.employee).then(() => {
        db.findAllEmployees().then(([rows]) => {
        console.table(rows);
        return mainMenu();
        });
    });
 };

 const updateManagers = async () => {
const [rowsB] = await db.findAllEmployees();
const newEmployee = rowsB.map(mapNewEmployee);
console.log(newEmployee);
const {employee} = await inquirer.prompt ([
    {
    type:"list",
    name:"employee",
    message:"Which employee's manager do you want to update?",
    choices: newEmployee
},
])
const [managerRows] = await db.findAllManagers(employee);
console.table(managerRows);
const managerChoices = managerRows.map(({id, first_name, last_name}) =>
({
    name: `${first_name} ${last_name}`,
    value: id,
}));
managerChoices.push({name:"No manager selected", value: null});

const {manager} = await inquirer.prompt ([
    {
        type:"list",
        name: "manager",
        message: "Who is this employee's new manager?",
        choices: managerChoices
    },
]);

db.updateEmployeeManager(manager, employee).then(()=>{
    db.findAllEmployees().then(([rows]) => {
    console.table(rows);
    return mainMenu();  
    });
});
 };
 const empByManager = async () => {
    const [allEmp] = await db.findAllEmployees();
    const managerChoices = allEmp.map(mapNewEmployee);
    const {manager} = await inquirer.prompt ([
        {
            type: "list",
            name:"manager",
            message: "Which manager's employee do you want to see?",
            choices: managerChoices
        },
    ]);
const [managersEmployee] = await db.findByManager(manager);
console.table(managersEmployee);
return mainMenu();
 };

const empByDepartment = async () => {
const[allDepartments] = await db.findAllDepartments();
console.table(allDepartments);
const departmentChoices = allDepartments.map(({id, name}) => ({
    name: name,
    value: id,
}));
const {department} = await inquirer.prompt([
    {
        type:"list",
        name: "department",
        message: "What department's employees did you want to see?",
        choices: departmentChoices

    },
]);
const [departmentEmployees] = await db.findByDepartment(department);
console.table(departmentEmployees);
return mainMenu();
};

const deleteEmployee = async () => {
    const [rowsA] = await db.findAllEmployees();
    console.table(rowsA);
    const employees = rowsA.map(({id, name}) => ({
        name,
        value: id,
    }));
    console.log(employees);
    const choice = await inquirer.prompt ([
        {
            type:"list",
            name: "employee",
            message:"Which employee would you like to delete?",
            choices: employees
        }
    ])
    .then ((response) => {
        db.deleteEmployee(response.employee);
        db.findAllEmployees().then(([rows]) => {
            console.table(rows);
            return mainMenu();
        });
    });
};
const deleteRole = async () => {
    const [rowsA] = await db.findAllRoles();
    console.table(rowsA);
    const roles = rowsA.map(({id, title}) => ({
        title,
        value: id,
    }));
    console.log(roles);
    const choice = await inquirer.prompt ([
        {
            type:"list",
            name: "role",
            message:"Which role would you like to delete?",
            choices: roles
        }
    ])
    .then ((response) => {
        db.deleteRole(response.role);
        db.findAllRoles().then(([rows]) => {
            console.table(rows);
            return mainMenu();
        });
    });
};

const deleteDepartment = async () => {
    const [allDepartments] = await db.findAllDepartments();
    console.table(allDepartments);
    const departments = allDepartments.map(({id, name}) => ({
        name,
        value: id,
    }));
    console.log(departments);
    const choice = await inquirer.prompt ([
        {
            type:"list",
            name: "department",
            message:"Which department would you like to delete?",
            choices: departments
        }
    ])
    .then ((response) => {
        db.deleteDepartment(response.department);
        db.findAllDepartments().then(([rows]) => {
            console.table(rows);
            return mainMenu();
        });
    });
};
    
    const findDepBudget = async () => {
        const [budgetForDept] = await db.findBudget();
    console.table(budgetForDept);
    return mainMenu();
    }






mainMenu();