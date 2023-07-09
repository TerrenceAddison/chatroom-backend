# Chatroom Backend

Simple backend of a chatroom with 3 APIs

- Send Message (will automatically create a chatroom if no chatroom exist between the users)
- Get messages of a chatroom
- Get chatrooms of a user

## Setup

### Local

run `npm install` to download all required packages to run the server.
create a `.env` file and copy the content of `.env.example` for variable `POSTGRES_HOST` please use the one commented for local
and delete the one for docker. Make sure to assign the other values for local environment, and make sure there exists a database
(recommended from pg admin) with the same name assigned to `POSTGRES_DB`

### Docker

create a `.env` file and copy the content of `.env.example` for variable `POSTGRES_HOST` please use the one commented for docker
and delete the one for local. For the other variables, use the values as is.

## Running

### Local

run `npm run start-dev` to start local server

### Docker

run `docker-compose up` for first time and if you need to rebuild run `docker-compose up -d --build`

## Usage

API server port by default is set to 8000. You can send requests via postman or others.

## Test

make sure to already followed the instruction for local setup and run `npm run test`
