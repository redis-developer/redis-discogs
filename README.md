# redis-discogs

This application aims to provide an example of the Redis-OM client connected to a Redis instance. Typical database actions such as create, read, update, and destroy are covered.  This is by no means a full and finalized coverage of the features of the Redis-Om Node.js client, but more a gentle introduction. 

This is a simple application that stores music albums in a database, somewhat similar to the popular website [Discogs.com](https://www.discogs.com/). Users can enter album information with the option to place the album for sale or simply to brag.


## Prerequisites:
It is recommended that you have a working knowledge of the typical Node.js with Express back-end framework. This is a standalone back-end service that responds to http requests - to interact with the service you may want to use Postman, Testfully, Insomia, or your own HTTP request script. 


## How the app works:
1. Express is used to handle routing within the Node.js server. 

2. Each Express route corresponds to a function that performs a task with the Redis server. 

3. Each function contacts the Redis server and either creates, updates, or removes an entry.

4. Each entry is a JSON object stored within Redis using the RedisJSON module. Querying, Indexing, and Search capabilities are added to the Redis Database using RediSearch.

## Routing Table:
| Action      | Method | Route | Notes|
| ----------- | ----------- | ---------|--------------|
| Create an entry   | POST  | `api/albums/{entryID}`| include data in body|
| Get all entries   | GET   | `api/albums`| offset and count query parameters
| Get one entry     | GET   | `api/albums/{entryID}`|
| Search for entries| GET   | `api/albums/search`| property and value query parameters
| Update an entry   | PUT   | `api/albums/{entryID}`| include update data in body
| Remove an entry   | DELETE| `api/albums/{entryID}`|
| Reload and reindex| GET   | `api/reload`| reloads data and reindexes after any schema change

## Acquiring a Redis instance
To run Redis, you have multiple options:
- A free instance on [Redis Cloud](https://redis.com/)
- A local [Docker Image](https://hub.docker.com/r/redislabs/redismod)
- A local [Redis Installation](https://redis.io/topics/quickstart)
- [Homebrew](https://formulae.brew.sh/formula/redis)

A Redis Cloud instance is recommended above others to ensure updated core and module versions are available and compatible with Redis-OM. Running a Docker Image is a close second. For Windows, see this [video](https://www.youtube.com/watch?v=_nFwPTHOMIY) to get up and running.

Ensure that you are using an instance of Redis that has the RedisJSON and RediSearch modules included.

A how-to video on acquiring a Redis Cloud instance can be found [here](https://youtu.be/5QLJSPn8VX0?t=99)


## Installation

Clone this repository:
```
$ git clone https://github.com/redis-developer/redis-discogs-be.git
```

Navigate into `redis-discogs-be` directory:
```
$ cd redis-discogs-be
```

Install necessary node package contents:
```
$ npm install
```

## Setting up Environment variables

### `REDIS_OM_URL`
You will now need to set an environment variable for your Redis instance. If you are running a local cloud instance or a Docker image, your Redis URL would most likely be something like this:

`redis://localhost:6379`

If you are using a Redis Cloud instance, you will need to assemble the Redis URL in this format:

`redis://username:password@host:port/db_number`

The redis cloud database configuration window will have all the necessary information to create this string.

In the `.env` file within this repository, update this line to include your Redis URL:

```
REDIS_OM_URL="<redis://username:password@host:port/db_number>"
```

The default `PORT` environment variable will be set to `3001` unless otherwise specified


### 