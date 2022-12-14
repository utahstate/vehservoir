# Vehicle Reservation - Initial Design Doc

The overall goal of this application is to provide a Slack interface for IT employees to reserve vehicles.

## Note: This document may be out of date

Some stuff has changed since writing the initial design doc.

A picture is worth a thousand words:
![Slack and realtime](slack_and_realtime.png)

Please view the swagger API documentation for the final revision of this service pertaining to the admin service
and other endpoints.

## Shortcomings of Previous Design

In terms of user experience, the previous implementation was not perfect:

* Integration with Outlook's calendar to schedule reservations: 
  + Requires creation of a new calendar for every single vehicle.
  + Requires maintenance of a completely seperate Outlook account, and its API tokens, with oauth.
  + Does not allow users to view the vehicle reservation calendar.

* Current Integration with Slack:
  + User does not receive feedback if the reservation system fails on the server - only "we will process
    that shortly".
  + Form does not have a saved state: if a user makes a reservation and it fails, all details have to be
    re-entered manually.
  + Requires users to "guess and check" which vehicles are available during the period they wish to reserve.
  + Does not use "slash"(/) commands, instead, requires mentions of a "user" (nitpick, but, it would be cool)

## New Design

The proposed new design will consist of a REST API to manage vehicle reservations, a frontend to provide admin
access to the reservation system, and a Slack integration to provide a convenient way to interface with the API
without opening the frontend.

Additionally, a fun real-time visualization will be made to show which vehicles are currently reserved.

### Requirements

- [X] A user can reserve a vehicle using a /slash command.
- [X] A user can filter vehicles by time available.
- [X] Vehicles cannot be double-booked in the same period.
- [X] If a request fails, form is re-sent to the user with pre-populated fields.

### Database

It has been proposed to use PostgreSQL as the DBMS.

The database might consist of four tables: 

1. A request table to store slack commands to the application
2. A vehicle table to store vehicle information
3. A vehicle type table to store different models of vehicles (van, golf cart, etc.)
3. A reservation table referencing a vehicle

#### Request
```
 id: primary int,
 slackUserId: text,
 userName: text,
 slackReminderSent: boolean,
```

Note that [`slack_user_id`](https://api.slack.com/interactivity/slash-commands#app_command_handling) is unique to 
the message's user.

#### Vehicle Type
```
 id: primary int,
 name: text unique index
```

#### Vehicle
```
 id: primary int,
 name: text,
 type: foreign int references vehicle_type.id
```

Here the vehicle type table provides a faster way to index vehicles by their model: for now, van and golf cart.

Side note: the frontend portal will have both a dropdown pre-populated with previous vehicle types, allowing for
insertion with a seperate input field.

#### Reservation
```
 id: primary int,
 vehicle_id: foreign int references vehicle.id,
 request_id: foreign int references request.id,
 start: timestamptz,
 end: timestamptz
```

### API

The API is proposed to be written in TypeScript utilizing the Nest.JS framework and TypeORM as the ORM.

#### Routes
Most routes require a valid webhook request from Slack or a correctly authenticated admin session (probably placed
in a cookie) - a hashed global admin password read from an environment variable will be satisfactory for 
this small application.

```
/api/reservations - POST
/api/reservations?start_time&end_time&slack_user_id - GET
/api/reservations/:id - DELETE
/api/reservations/:id - GET
/api/reservations/vehicles/:vehicle_id - GET 

/api/vehicles - POST
/api/vehicles?type&name - GET
/api/vehicles/free?start_time&end_time&time_period&vehicle_type - GET ;; Between start_time and end_time for time_period and optional vehicle type
/api/vehicles/:id - GET
/api/vehicles/:id - DELETE
```

#### Reservation Attempt
A reservation POST request may look like:
```
{
  slack_user_id,
  response_url,
  start_time,
  end_time,
  vehicle_id?,
  vehicle_type?,
}
```

An attempt should be made to send an [ephemeral](https://api.slack.com/messaging/managing#ephemeral) message back to `response_url`
with the status of the reservation:
* No vehicles free - send help for the /api/vehicles/free command
* Vehicle reserved - send the reservation details

### Frontend

The frontend is proposed to be written in React and server-side rendered with Next.JS, using TypeScript which 
@Simponic and @parkerfreestone have experience with.

Additionally, @Simponic has experience with https://fullcalendar.io/, which provides a really easy to use
drag-and-droppable calendar component with hooks to listen to user events. This will be very nice to visualize
the vehicle reservations.

## Milestones and Estimates

### M0 (1 week)
- [X] Project initiated - simple Nest.JS routes setup and rendered with React
- [X] Schema successfully migrated
- [X] Barebones API - can request Vehicles and Reservations

### M1 (1.5 - 2.5 weeks)
- [X] Users can successfully make a vehicle reservation
- [X] Users can list their reservations
- [X] Users can filter vehicles by periods available
- [X] Safeguards implemented to prevent double booking
- [X] Calendar rendering vehicle reservations
- [X] Slack integration

### M2 (1 week)
- [X] "Bug free"
- [ ] Slack app deployed to USU IT workspace
- [X] Documentation not covered in M0 and M1 "sprints"

## Going further

For the sake of time, some features could be added in the future, which are not hard "requirements". However,
the current design is made with extensibility for these features in the future.

* Vehicles have their own slots during which they can be reserved. No reservations for that can be made unless they
  are within those periods. (Consider making a new vehicle_reservation_periods table with a one-to-many relationship)
* Some vehicles can only be reserved by certain users.
* Many to many relationship between vehicles and reservations - allowing for reservations to be related to multiple
  vehicles at a time.
