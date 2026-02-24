1. this app should be deployable with docker-compose up --build 
2. This will have a frontend in next.js with its apis, a backend of dynamodb (using localstack). 
3. This app will use a .env file. This will be created manually by the user by copying a .env.example which will contain all the required secrets, without a .env file the app should use the .env.example file to deploy (so when it is pushed online it will just need the secrets adding to actions. 
4. This is a reminder application, where the user can add and tick off reminders, with optional calendar integration. There will also be a calendar page where we can view them all. There will also be a categorisation feature e.g. shopping/cleaning etc which should all be edited by the user.
5. This docker-compose command should include scripts for the initialisation of the database including users and todos etc. Whenever a new table is added the script should be amended. 
6. Use the official next.js command to run the dev server. 
7. If in doubt, please ask me questions and I can answer them to build this. 
