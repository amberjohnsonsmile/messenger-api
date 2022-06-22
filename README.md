# TypeScript Messenger API

The Messenger API sends and retrieves short messages between users. Interact with a deployed version of the API [here](https://thawing-springs-25910.herokuapp.com/received?recipient=rupaul).

##### Table of Contents

[Technologies](#technologies)  
[Running the API locally](#running-the-api-locally)  
[Running the tests](#running-the-tests)  
[Endpoints](#endpoints)  
[About the database](#about-the-database)  
[Design tradeoffs](#design-tradeoffs)  
[Future features](#future-features)  
[License](#license)  
[Contact](#contact)

## Technologies

Express  
Jest  
Node  
Postgres  
Prisma  
TypeScript

## Running the API locally

To run the API locally, follow these steps:

1. If Postgresql is not installed, follow installation instructions [here](https://www.postgresql.org/download/).
2. In the main directory of this project, create a .env file with the following contents:

```
DATABASE_URL=postgresql://{username}:postgres@localhost:5432/postgres
```

Replace {username} with the user currently logged into the computer. If further customization is needed, use this general format:

```
DATABASE_URL=postgresql://{username}:{password}@localhost:{port}/{database}
```

3. Install dependencies and set up the local database:

```
npm run setup
```

4. Start the server:

```
npm run dev
```

## Running the tests

This project uses the Jest framework for unit testing. To run the tests:

```
npm run test
```

## Endpoints

_A deployed version of the API is available using the following base url: https://thawing-springs-25910.herokuapp.com_

[`GET /received`](#get-received)  
[`GET /conversation`](#get-conversation)  
[`POST /send`](#post-send)  
[`PUT /mark-read`](#put-mark-read)

---

#### `GET /received`

Returns a list of received messages for a particular user, ordered by most recent. A maximum of 100 messages will be returned.

**Required query parameters:**

- `recipient` (string) - username of the person receiving the messages. Must be between 3 and 36 characters.

**Optional query parameters:**

- `sender` (string) - username of a sender by which to filter. By default, messages from all senders will be returned. Must be between 3 and 36 characters.
- `range` (integer) - the number days to look back for messages. Must be a positive integer. By default this value is set to 30 days.

**Example request** :

```
curl -X GET "http://localhost:8000/received?recipient=porkchop&range=60"
```

**Example success response** : `200 OK`

```js
{
  "recipient": "porkchop", // string
  "messages": [
    {
      "id": 52, // integer
      "sender": "rupaul", // string
      "recipient": "porkchop", // string
      "content": "Porkchop! So good to see you.", // string
      "read": false, // boolean
      "created": "2022-01-01T00:00:00.000Z" // ISO 8601 date string (UTC)
    }
  ]
}
```

**Example client error response** : `400 BAD REQUEST`

```js
{
  {
    "errors": [
      {
        "msg": "'recipient' must be present", // string
        "param": "recipient", // string
        "location": "query" // string
      },
      {
        "msg": "'recipient' must be between 3 and 36 characters",
        "param": "recipient",
        "location": "query"
      }
    ]
  }
}
```

**Example server error response** : `500 INTERNAL SERVER ERROR`

```js
{
  "recipient": "porkchop", // string
  "error": "unable to get messages" // string
}
```

---

#### `GET /conversation`

Returns a list of both sent and received messages between two users, ordered by most recent. A maximum of 100 messages will be returned.

**Required query parameters:**

- `recipient` (string) - username of the person receiving the messages. Must be between 3 and 36 characters.
- `sender` (string) - username of a sender by which to filter. Must be between 3 and 36 characters.

**Optional query parameters:**

- `range` (integer) - the number days to look back for messages. Must be a positive integer. By default this value is set to 30 days.

**Example request** :

```
curl -X GET "http://localhost:8000/conversation?recipient=porkchop&sender=jinkx"
```

**Example success response** : `200 OK`

```js
{
  "recipient": "porkchop", // string
  "sender": "jinkx", // string
  "messages": [
    {
      "id": 89, // integer
      "sender": "jinkx", // string
      "recipient": "porkchop", // string
      "content": "Well hey girl!", // string
      "read": false, // boolean
      "created": "2022-01-01T05:00:00.000Z" // ISO 8601 date string (UTC)
    },
    {
      "id": 84, // integer
      "sender": "porkchop", // string
      "recipient": "jinkx", // string
      "content": "Hey there Jinkxy!", // string
      "read": true, // boolean
      "created": "2022-01-01T00:00:00.000Z" // ISO 8601 date string (UTC)
    }
  ]
}
```

**Example client error response** : `400 BAD REQUEST`

```js
{
  {
    "errors": [
      {
        "msg": "'sender' must be present", // string
        "param": "sender", // string
        "location": "query" // string
      },
      {
        "msg": "'sender' must be between 3 and 36 characters",
        "param": "sender",
        "location": "query"
      }
    ]
  }
}
```

**Example server error response** : `500 INTERNAL SERVER ERROR`

```js
{
  "recipient": "porkchop", // string
  "error": "unable to get messages" // string
}
```

---

#### `POST /send`

Sends a message to another user. This endoint expects a JSON body in the request.

**Required body parameters**

- `sender` (string) - username of a sender by which to filter. By default, messages from all senders will be returned. Must be between 3 and 36 characters.
- `recipient` (string) - username of the person receiving the messages. Must be between 3 and 36 characters.
- `content` (string) - the message to be sent. Must be between 1 and 280 characters.

**Example request** :

```
curl -X POST "http://localhost:8000/send" -H 'Content-Type: application/json' -d '{"sender":"porkchop","recipient":"jinkx","content":"Hey there Jinkxy!"}'
```

**Example success response** : `201 Created`

```js
{
  "success": true, // boolean
  "message": {
    "sender": "porkchop", // string
    "recipient": "jinkx", // string
    "content": "Hey there Jinkxy!" // string
  }
}
```

**Example client error response** : `400 BAD REQUEST`

```js
{
  "errors": [
    {
        "value": "", // string
        "msg": "'content' must be between 1 and 280 characters", // string
        "param": "content", // string
        "location": "body" // string
    }
  ]
}
```

**Example server error response** : `500 Internal Server Error`

```js
{
  "error": "unable to send message", // string
  "message": {
    "sender": "porkchop", // string
    "recipient": "jinkx", // string
    "content": "Hey there Jinkxy!" // string
  }
}
```

---

#### `PUT /mark-read`

Changes the "read" field on a messages to either true (it has been read) or false (it is unread).

**Required body parameters**

- `messageId` (int) - the message's unique identifier, must be a positive integer.
- `read` (boolean) - whether the message has been read. Must be `true` or `false`.

**Example request** :

```
curl -X PUT "http://localhost:8000/mark-read" -H 'Content-Type: application/json' -d '{"messageId":26,"read":true}'
```

**Example success response** : `200 OK`

```js
{
  "success": true,
  "data": {
    "messageId": 26,
    "read": true
  }
}
```

**Example client error response** : `400 BAD REQUEST`

```js
{
  "errors": [
    {
        "value": "maybe they read it", // string
        "msg": "'read' must be a boolean", // string
        "param": "read" // string
        "location": "body" // string
    }
  ]
}
```

**Example "not found" error response** : `404 NOT FOUND`

```js
{
  "error": "could not find message in the database",
  "data": {
    "messageId": 26,
    "read": true
  }
}
```

**Example server error response** : `500 INTERNAL SERVER ERROR`

```js
{
  "error": "unable to update 'read' status on message",
  "data": {
    "messageId": 26,
    "read": true
  }
}
```

## About the database

The Messenger API uses Postgresql to store message data. The Prisma ORM library is included for easy setup and interaction with the database.

#### Messages table schema

| column    | type                            |
| --------- | ------------------------------- |
| id        | integer (auto-incrementing, PK) |
| sender    | text                            |
| recipient | text                            |
| content   | text                            |
| read      | boolean                         |
| created   | timestamp (auto-generated)      |

## Design tradeoffs

Since speed was a priority in developing this API, certain tradeoffs needed to be made to get the project up and running.

- Not much time was devoted to testing running the project locally. It seems to work on a Mac system, but it would be great to test on more machines and test on Windows and Linux.

- The Prisma ORM library has some powerful mocking features for testing, but they take some time investment to set up. I ended up using Jest to mock database functionality, but it was very clunky to work with. It would be nice to take the time to set it up with Prisma.

- To save time while still getting test coverage for the bulk of the app, unit testing was limited to the classes that had the most functionality. It would be awesome to add more tests for the index, router, and validator.

## Future features

These potential features would be great next steps for the development of the app.

- API authentication - require a bearer token to be included in authentication headers when a request is sent to the API. This would improve security.

- Registration - work with the frontend to give users the ability to create accounts with username and password sign in. Auth0 could be a good library to leverage for this.

- Group messaging - an additional `POST` endpoint could allow users to send messages to multiple recipients at the same time. This would also require new `GET` endpoints or refactoring of the current endpoints.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

## Contact

Amber Johnson, Senior Software Engineer

![headshot](https://user-images.githubusercontent.com/31632938/174703630-24b70695-fc12-41b2-80ef-00a5ada3eb1e.jpeg)

Email amberjohnsonsmile@gmail.com  
GitHub [amberjohnsonsmile](https://github.com/amberjohnsonsmile)  
LinkedIn [amberjohnsonsmile](https://linkedin.com/in/amberjohnsonsmile)
