
# Table of Contents

1.  [Introduction](#orgaa18786)
2.  [Usage](#orgc600c98)
    1.  [Slack](#org4ef4b9e)
    2.  [Environment variables](#org595ccee)
    3.  [Development](#org0feba35)
    4.  [Deployment](#org5545ceb)
    5.  [Seeding](#org4c052d9)
3.  [Documentation](#orgbbd3e6b)
4.  [Testing](#org2c98da7)
```
     __  __          __                                                         
    /\ \/\ \        /\ \                                             __         
    \ \ \ \ \     __\ \ \___     ____     __   _ __   __  __    ___ /\_\  _ __  
     \ \ \ \ \  /'__`\ \  _ `\  /',__\  /'__`\/\`'__\/\ \/\ \  / __`\/\ \/\`'__\
      \ \ \_/ \/\  __/\ \ \ \ \/\__, `\/\  __/\ \ \/ \ \ \_/ |/\ \L\ \ \ \ \ \/ 
       \ `\___/\ \____\\ \_\ \_\/\____/\ \____\\ \_\  \ \___/ \ \____/\ \_\ \_\ 
        `\/__/  \/____/ \/_/\/_/\/___/  \/____/ \/_/   \/__/   \/___/  \/_/\/_/ 
```

<a id="orgaa18786"></a>


# Introduction

Vehservoir (vehicle reservation reservoir) is a vehicle reservation system for USU IT, with a slack integration and real-time parking-lot visualization.

<a id="orgbbd3e6b"></a>


https://user-images.githubusercontent.com/25559600/201492887-5cc75b32-6985-477e-8c88-4c618571bd61.mov


# Usage


<a id="org4ef4b9e"></a>

## Slack

To integrate this service with Slack, firstly create a Slack application in the preferred workspace.

Then, create a bot account and give it the following permissions (in "OAuth & Permissions" under Scopes -> Bot Token Scopes):

-   `chat:write`
-   `commands`
-   `users:read`

Next, add the interactions url (reads submissions from modals) in "Interactivity & Shortcuts", pointing to the host `/api/slack/interactions`.

Finally, add the slash commands (in "Slash Commands"):

-   `/reserve` points to `/api/slack/reserve`
-   `/unreserve` points to `/api/slack/unreserve`
-   `/reservations` points to `/api/slack/reservations`
-   `/quickreserve` points to `/api/slack/~quickreserve`
-   `/prefer` points to `/api/slack/prefer`
-   `/mypreference` points to `/api/slack/mypreference`


<a id="org595ccee"></a>

## Environment variables

The file `.env.example` in the project root lists the environment variables necessary to run the application.

From the slack installation section, there should be both a slack bot token listed in "OAuth & Permissions" in the Slack App Portal, as well as a signing secret in "Basic Information". Copy those to their respective env vars.

Additionally, set `RESERVATION_CHANNEL_ID` to the channel id you wish to restrict the application to.

Each `POSTGRES` variable should contain new values that the postgres docker image will use to create the database.

Finally, ensure `JWT_SECRET` is a somewhat long random sequence of characters. You can generate one with `head -c 32 /dev/urandom | base64`.


<a id="org0feba35"></a>

## Development

0. Have `postgres` and `node` setup on your machine
1.  Run `npm i` in each of `server`, `frontend`, and the root directory
2.  Copy `.env.example` from the root into `server/.env`, setting the environment variables as described above, ensuring `NODE_ENV=development` and `POSTGRES_HOSTNAME` is, most likely, `localhost`
3.  Spin up vehservoir via `npm run dev` in the root directory
4.  Follow the steps below to seed an admin user
5.  (optional, for slack integrations) Point the slack endpoints to the locally running backend via `ngrok http <port (likely 4000)>` and change the endpoints in each of the slash commands and interactions url (as mentioned above in the "Usage > Slack" section) to your ngrok link.


<a id="org5545ceb"></a>

## Deployment

Deployment is "easy" with `docker-compose`!

1.  Use `.env.example` as a template for your `.env`, setting the environment variables as described above, ensuring `NODE_ENV=production` and `POSTGRES_PASSWORD` to a secure random string of characters.
2.  `docker compose up`
3.  Follow the steps below to seed an admin user into postgres (enter the postgres REPL by running `docker compose exec -it db psql -U vehservoir`)


<a id="org4c052d9"></a>

## Seeding

1.  Bcrypt a temporary administrator password <https://bcrypt.online/>
    - Alternatively, just use this: `$2y$10$pLnySAAsMIjjqhKhH8ItFOwNpqpf.8FuDMHAu8EvJ6jtAGT9Hxh16` (it's "password")
2.  `insert into admin ("username", "password") values ('admin', 'theHashedPasswordHere');`
3.  Navigate to vehservoir, and authenticate as admin via your username and password.
4.  Create at least one vehicle in the "Vehicles" tab.


<a id="org2c98da7"></a>

# Documentation

View the dev-only Swagger API documentation at `/api/` on the backend host (likely `http://localhost:4000`).

Additionally, you may view the initial design decisions made (and a fun little diagram) in the `/docs`.

<a id="orgc600c98"></a>

# Testing

There are a few controller and helper date function unit tests that can be run with `npm run test` in `server`.
