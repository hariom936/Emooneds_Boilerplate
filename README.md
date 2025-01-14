
# EMOONEEDS CRM 

The core Emooneeds CRM api service.

## Prerequisites

 - [NodeJS](https://nodejs.org/en)  - v18.12.x or higher
 - [VS Code](https://code.visualstudio.com/) (Recommended Code Editor) - Latest

## Recommended VSC Extensions

 - [ES Lint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) for static code analysis and linting
 - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for code formatting

## Recommended Reading For The Tech Stack Used

 - [Mongoose](https://mongoosejs.com/docs/guide.html)
 - [typeDI](https://github.com/typestack/typedi#readme)
 - [Routing Controllers](https://github.com/typestack/routing-controllers#readme)
 - [Class Validators](https://github.com/typestack/class-validator#readme)
 - [Passport JS](https://www.passportjs.org/docs/)

## Code Directory Structure
```
scripts/               # Pre-setup scripts here
seeders/               # Seeder files to populate DB
src/                   # Houses almost all the code
 |--api/v1.0.0/        # App api related logic here
    |--controllers/    # Controller + api routing layer
    |--decorators/     # Routing controllers standard decorators here
    |--interceptors/   # Api response interceping logic to alter data send to client
    |--middlewares/    # All middlewares here
    |--services/       # The actual business logic written here (service layer)
    |--validations/    # Class based validation defintions
 |--config/            # Environment variables & code configurations
 |--constants/         # Message and other common constants
 |--docs/              # Swagger documentations
 |--models/            # ORM models (data layer)
 |--types/             # Type definitions
 |--utils/             # Utility classes and functions
 |--app.ts             # The Express App configuration done here
index.ts               # Code entry point
tests/                 # Test cases code
 |--fixtures           # Inject test data in testing context using this
 |--integration        # Integration test cases here
 |--utils              # Utility functions to help with test cases
```

## DB Access
~~DB is accessed in a password-less manner using the [X.509](https://en.wikipedia.org/wiki/X.509) standard and a TLS certificate. For this, follow the instructions to create your Allas account and download the certificate -~~

DB is accessed using a standard user name and password. You may download and install [mondoDB](https://www.mongodb.com/try/download/community) locally or setup an Atlas account. Steps to setup your mongoDB Atlas account are explained below -

 1. Login or create an account on [Mongo DB Atlas](https://www.mongodb.com/cloud/atlas/register).
 2. Setup your first DB by following the on-screen prompts.
 3. Create a new project.
 4. Create a new database by selecting the appropriate service provider.
 5. Once created, you may be prompted to add a user for database access. If not, go to **security > database** access to add a new user.
 6. Create a new user for the database access and choose **password** for authentication method. Fill in a user name and password. Note down these credentials.

## Code Setup

 1. Clone the repo
 2. Set you environment variables, refer the example .env file
 3. Run command `npm install` to install code dependencies
 4. Start the server on your local system by using the command `npm run serve`
 5. Swagger doc are server on the endpoint http://localhost:3000/api-docs if you set your project host port to 3000

 ## Running Seeders
 A small script is provided in seeders for running seeders which are present in the `seeders/` directory. Seeder scripts support the single, multiple and all seeding data. Below command are use respectively.
 
 1. For seeding single file data use  `npx ts-node ./scripts/populateDB.ts [up|down] filename` 
 2. For seeding mulitple files data use `npx ts-node ./scripts/populateDB.ts [up|down] filename1,filename2`
 3. For seeding all files data use `npx ts-node ./scripts/populateDB.ts [up|down]` 
 
 **Please do not use filename extension(.js,.ts,.json) while seeding the data just simple type the file name.**

<!-- npx ts-node ./scripts/populateDB.ts -->

 Running the script with no arguements or _'up-'_ (default) will run the `up()` function exported by the seeder files. This will typically populate data.

 Running the script with arguement _'down-'_ will run the `down()` function. This usually deletes data.

 ## Useful Scripts
 - `npm run build` - compile TS code
 - `npm run lint` - Static code check
 - `npm run lint:fix` - Fix all auto-fixable static code check errors
 - `npm run format` - Check code formatting errors using prettier
 - `npm run format:fix` - Automatically format your entire codebase
 - `npm run test` - Execute all jest test cases and collect coverage
 - `npm run seed` - Execute all seeds and populate db
 - `npm run seed:down` - Execute all seeds and de-populate db

---
