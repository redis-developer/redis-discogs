# Redis Discography (Node.js, Express, and Redis)
This application aims to provide an example of the [Redis-OM client](https://github.com/redis/redis-om-node/blob/main/README.md) connected to a [Redis](https://redis.io/) instance. Typical database actions such as create, read, update, and destroy are covered.  This is by no means a full and finalized coverage of the features of the Redis-Om Node.js client, but more a gentle introduction. 

This is a simple application that stores music albums in a database, somewhat similar to the popular website [Discogs.com](https://www.discogs.com/). Users can enter album information with the option to place the album for sale or simply to brag.


## Prerequisites:
It is recommended that you have a working knowledge of the typical Node.js with Express back-end framework. This is a standalone back-end service that responds to http requests - to interact with the service you may want to use Postman, Testfully, Insomia, or your own HTTP request script. 


## How the app works:
1. Express is used to handle routing within the Node.js server. 

2. Each Express route corresponds to a function that performs a task with the Redis server. 

3. Each function contacts the Redis server and either creates, updates, or removes an entry.

4. Each entry is a JSON object stored within Redis using the RedisJSON module. Querying, Indexing, and Search capabilities are added to the Redis Database using RediSearch.

## Acquiring a Redis instance
To run Redis, you have multiple options:
- A free instance on [Redis Cloud](https://redis.com/)
- A local [Docker Image](https://hub.docker.com/r/redislabs/redismod)
- A local [Redis Installation](https://redis.io/topics/quickstart)
- [Homebrew](https://formulae.brew.sh/formula/redis)

A Redis Cloud instance is recommended above others to ensure updated core and module versions are available and compatible with Redis-OM. Running a Docker Image is a close second. For Windows, see this [video](https://www.youtube.com/watch?v=_nFwPTHOMIY) to get up and running.

Ensure that you are using an instance of Redis that has the RedisJSON and RediSearch modules included.

A how-to video on acquiring a Redis Cloud instance can be found [here](https://youtu.be/5QLJSPn8VX0?t=99)


## Installing the app

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


## Running the app

Let's populate the Redis instance with some albums. There will be 3 users that will 'own' these albums. This will allow us to search for albums by owner later on.

```
$ npm run load
```


To run the application locally, enter the following in the same previous terminal:

```
$ npm run dev

> intro-redis-be-bez@1.0.0 dev
> node server.js
```
HTTP requests can now be sent to the server.


# HTTP Request and Routing Table:
| Action      | Method | Route | Notes|
| ----------- | ----------- | ---------|--------------|
| Create an entry   | POST  | `api/albums/{entryID}`| include data in body|
| Get all entries   | GET   | `api/albums`| offset and count query parameters
| Get one entry     | GET   | `api/albums/{entryID}`|
| Search for entries| GET   | `api/albums/search`| property and value query parameters
| Update an entry   | PUT   | `api/albums/{entryID}`| include update data in body
| Remove an entry   | DELETE| `api/albums/{entryID}`|
| Reload and reindex| GET   | `api/reload`| reloads data and reindexes after any schema change

## Get All albums
This endpoint includes optional offset and count values for pagination. You would normally want this as retrieving THE ENTIRE database of entires would be quite large in production. 

```js
exports.getAll = async (req, res) => {
  const offset = req.query.offset || 0
  const count = req.query.count || 10
  
  await repository
    .search().return
    .page(offset, count)
    .then(response => res.json(response))
    .catch( e => res.json({'error': e.message}))

};
```

Example Call:
 ```
 GET - api/albums/?offset=00&count=10
 ```
 This would return the first ten entries the database retrieves


 ## Get One album

This endpoint retrieves one single album based on the the EntryID included as a URL parameter. 

```js
exports.getOne = async (req, res) => {
  const entityID = req.params.entityID
  
  await repository
    .fetch(entityID)
    .then( response => res.json(response))
    .catch( e => res.json({'error': e.message}))
};
```

Example Call:
 ```
 GET - api/albums/01FWJ4TBXZSQEMNENDF7KJ4BE8
 ```
 This would return the the entry with the associated entryID. Note that this entryID is for RediSearch.  If you weren't using this module, you would dynamically generate the key based on a unique value.



 ## Search Albums

 This endpoint takes two query parameters and performs a search based on the property and value passed in.

```js
 exports.search = async (req, res) => {
  const queryParams = req.query
  let property, value;
  
  for(key in queryParams){
    property = key
    value = queryParams[key]
  }

  await repository
    .search()
    .where(property).matches(value)
    .all()
    .then(response => res.json(response))
    .catch(e => res.json({'error': e.message}))
}
```
Example Call:
 ```
 GET - api/albums/search/?artist=Majeure
 ```
 This would return all entries with the artist property containing the string `Majeure` in an array.

 ```
 GET - api/albums/search/?format=vinyl
 ```  
 This would return all entries where the format is set to `Vinyl`



 ## Update One Album

With Redis, an update is simply an overwrite of the specific values that are to be updated. The path parameter will contain the `entityID` and the request body will contain the key/value pairs to be updated within the entry.

```js
exports.update = async (req, res) => {
  const entityID = req.params.entityID
  const updateData = req.body

  // Retrieve existing album
  let album = await repository
    .fetch(entityID)
  // map updated data onto existing data
  album.entityData = Object.assign(album.entityData, updateData)
  // save album
  await repository.save(album)
    .then( response => res.json(response))
    .catch( e => res.json({'error': e.message}))
}
```

Example Call:
 ```
 PUT - api/albums/01FWJ4TBXZSQEMNENDF7KJ4BE8
 body:     body: { artist: updatedValue, comments: updatedValue }
 ```

 This updates only the properties and values you send within the request body. A receipt of update is sent back in the form of the original `entityID`.



## Delete One Album
This endpoint removes one entry based on the URL parameter.

```js
exports.delete = async (req, res) => {
  const entityID = req.params.entityID
  await repository
    .remove(entityID)
    .then(response => res.sendStatus(200))
    .catch( e => res.json({'error': e.message}))
};
```

Example Call:
 ```
 DELETE - api/albums/01FWJ4TBXZSQEMNENDF7KJ4BE8
  ```

 This removes the album with `entityID` `01FWJ4TBXZSQEMNENDF7KJ4BE8` and returns a successful `OK 200`.