//added required stuff
const inquirer = require("inquirer");
const Database = require("./database/dbIndex");
require("console.table");

//created a constructor class to run async functions
class MainMenu {
    constructor(){
        this.db = new Database();
       

        this.viewDepartments = this.viewDepartments.bind(this);
        this.viewRoles = this.viewRoles.bind(this);
        this.viewEmployees = this.viewEmployees.bind(this);
        this.addDepartment = this.addDepartment.bind(this);
        this.addRole = this.addRole.bind(this);
        this.addEmployee = this.addEmployee.bind(this);
        this.updateEmployeeRole = this.updateEmployeeRole.bind(this);
        this.updateManagers = this.updateManagers.bind(this);
        this.empByManager = this.empByManager.bind(this);
        this.empByDepartment = this.empByDepartment.bind(this);
        this.deleteEmployee = this.deleteEmployee.bind(this);
        this.deleteRole = this.deleteRole.bind(this);
        this.deleteDepartment = this.deleteDepartment.bind(this);
        this.findDepBudget = this.findDepBudget.bind(this);
        this.getTotalEmployees = this.getTotalEmployees.bind(this);
        this.TotalByManager = this.TotalByManager.bind(this);
        this.TotalByDep = this.TotalByDep.bind(this);
        this.mapNewEmployee = this.mapNewEmployee.bind(this); 

        this.mainMenuOptions= [
    {name: "View all departments", value: this.viewDepartments}, 
    {name: "View all roles", value: this.viewRoles},
    {name: "view all employees", value: this.viewEmployees},
    {name: "Add a department", value: this.addDepartment},
    {name: "Add a role", value: this.addRole},
    {name: "Add an employee", value: this.addEmployee},
    {name: "Update an employee role", value: this.updateEmployeeRole},
    {name: "Update employee managers", value: this.updateManagers},
    {name: "View employees by manager", value: this.empByManager},
    {name: "View employees by department", value: this.empByDepartment},
    {name: "Delete employee", value: this.deleteEmployee},
    {name: "Delete role", value: this.deleteRole},
    {name: "Delete department", value: this.deleteDepartment},
    {name: "Budget for department", value: this.findDepBudget},
    {name: "Total employees", value: this.getTotalEmployees},
    {name: "Total employees by manager", value: this.TotalByManager},
    {name: "Total employees by department", value: this.TotalByDep},
    {name: "Exit", value: this.exit},

     ];
    
    }
  //logic to run the app and wait for answers to prompts  
    async run() {
        await this.db.connect();
        while(true){
            const answer = await inquirer.prompt([
                {
                    type:"list",
                    name: "choice",
                    message: "What would you like to do?",
                    choices: this.mainMenuOptions.map((option) => option.name)
                },
            ]);

            const selectedOption = this.mainMenuOptions.find((option) =>
            option.name === answer.choice
            );

           if (selectedOption) {
            if (selectedOption.value === this.addRole) {
                await this.addRole();
           
                await this.db.findAllRoles().then(([rows]) => {
                    console.table(rows);
                    this.run();
                    });
                }else{
             await selectedOption.value();
                }
            } else {
                console.log("Invalid option. Please try again");
            }
           }
           
        }
       
//function to map employees
    mapNewEmployee({id, name, manager}) {
            return {name, value:id, manager};
        
    }   
  
//start of the various functions set in main menu
    async viewDepartments() {
        try {
            const [rows] = await this.db.findAllDepartments();
            console.table(rows);
        } catch (error) {
            console.error("Error fetching departments", error);
        }
        this.run();
    }
    async viewRoles() {
        this.db.findAllRoles().then(([rows]) => {
            console.table(rows);
            this.run();
        });
    }
    async viewEmployees() {
        this.db.findAllEmployees().then(([rows]) => {
            console.table(rows);
            this.run();
        }); 
    }

async addDepartment(){
    const answer = await inquirer.prompt ([
       {
         type: "input",
         name: "department",
         message: "What is the department name that you want to add?",
       },
]);
const departmentName = answer.department;
this.db.addDepartment(departmentName).then(() => {
    this.db.findAllDepartments().then(([rows]) => {
        console.table(rows);
        this.run();
    });
});
};

async addRole() {
   const [rows] = await this.db.findAllDepartments();
   console.table(rows);
   const departmentChoices = rows.map(({name, id}) => ({name, value: id}));
   const answer = await inquirer.prompt ([
    {
    type: "input",
    name: "position",
    message:"What role title would you like to add?",
    
   },
   {
    type: "input",
    name:"salary",
    message:"What will the salary be for this role?",
  
   },
   {
    type: "list",
    name:"roleDepartment",
    message:"To which department should this role be added?",
    choices: departmentChoices
   },

]); 

await this.db.addRoleDep (
    answer.position,
    answer.salary,
    answer.roleDepartment,
)
//  this.db.addRoleDep(answer.position, answer.salary, answer.roleDepartment).then(() => {
//     this.db.findAllRoles().then(([rows]) => {
//     console.table(rows);
//     this.run();
//     });
//  });
}
async addEmployee() {
    const [rowsA] = await this.db.findAllRoles();
    console.log(rowsA);
    const roleChoices = rowsA.map(({ id, title} ) => ({
        name: title,
        value: id,
    }));
    console.log(roleChoices);
    
const [rowsB] = await this.db.findAllEmployees();
const newEmployee = rowsB.map(this.mapNewEmployee);
console.log(newEmployee);

const managerChoices = [...newEmployee, {name: "Null", value: null}];
console.log(managerChoices);
const answer = await inquirer.prompt([
    {
   type:"input",
   name:"first_name",
   message:"What is the first name of the employee?",
 
},
{
    type:"input",
    name:"last_name",
    message:"What is the last name of the employee?",
   
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
this.db.addEmployee(answer).then(() => {
this.db.findAllEmployees().then(([rows]) => {
    console.table(rows);
    this.run();
});
});
};
 async updateEmployeeRole(){
    const [rowsA] = await this.db.findAllRoles();
    console.table(rowsA);
    const roleChoices = rowsA.map(({id, title})=> ({
        name: title,
        value: id,
    }));
    console.log(roleChoices);

    const [rowsB] = await this.db.findAllEmployees();
    const newEmployee = rowsB.map(this.mapNewEmployee);
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
    this.db.updateEmployeeRole(answer.role, answer.employee).then(() => {
        this.db.findAllEmployees().then(([rows]) => {
        console.table(rows);
        this.run();
        });
    });
 };

 async updateManagers() {
const [rowsB] = await this.db.findAllEmployees();
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
const [managerRows] = await this.db.findAllManagers(employee);
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

this.db.updateEmployeeManager(manager, employee).then(()=>{
    this.db.findAllEmployees().then(([rows]) => {
    console.table(rows);
    this.run();
    });
});
 };
 async empByManager() {
    const [allEmp] = await this.db.findAllEmployees();
    const managerChoices = allEmp.map(mapNewEmployee);
    const {manager} = await inquirer.prompt ([
        {
            type: "list",
            name:"manager",
            message: "Which manager's employee do you want to see?",
            choices: managerChoices
        },
    ]);
const [managersEmployee] = await this.db.findByManager(manager);
console.table(managersEmployee);
this.run();
 };

async empByDepartment() {
const[allDepartments] = await this.db.findAllDepartments();
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
const [departmentEmployees] = await this.db.findByDepartment(department);
console.table(departmentEmployees);
this.run();
};

async deleteEmployee(){
    //getting info from findAllEmployees and putting them in a row so that
    //user can make a choice
    const [rowsA] = await this.db.findAllEmployees();
    console.table(rowsA);
    const employees = rowsA.map(({id, name}) => ({
        name,
        value: id,
    }));
    console.log(employees);
    //asking user to make choice based upon list
    const choice = await inquirer.prompt ([
        {
            type:"list",
            name: "employee",
            message:"Which employee would you like to delete?",
            choices: employees
        }
    ])
    //waiting for response and then deleting, showing new row of employees
    .then ((response) => {
        this.db.deleteEmployee(response.employee);
        this.db.findAllEmployees().then(([rows]) => {
            console.table(rows);
            this.run();
        });
    });
};
async deleteRole () {
    const [rowsA] = await this.db.findAllRoles();
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
        this.db.deleteRole(response.role);
        this.db.findAllRoles().then(([rows]) => {
            console.table(rows);
            this.run();
        });
    });
};

async deleteDepartment() {
    const [allDepartments] = await this.db.findAllDepartments();
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
        this.db.deleteDepartment(response.department);
        this.db.findAllDepartments().then(([rows]) => {
            console.table(rows);
            this.run();
        });
    });
};
    
 async findDepBudget (){
        const [budgetForDept] = await this.db.findBudget();
    console.table(budgetForDept);
    this.run();
    }

async getTotalEmployees() {
const [rows] = await this.db.findTotalEmp();
console.log("Total employees:", rows[0].total_employees);
this.run();
}

async TotalByManager() {
    const [rows] = await this.db.findEmployeeCountByManager();
    console.table(rows);
    this.run();
}

async TotalByDep() {
    const [rows] = await this.db.findEmployeeCountByDepartment();
    console.table(rows);
    this.run();
}


async exit() {
    console.log("Have a Great Day!");
    //   this.db.connection.end();
      process.exit(0); 
}
}
   
const mainMenu = new MainMenu();
mainMenu.run();