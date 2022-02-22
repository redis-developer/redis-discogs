const albumsList = require('./albumsList.json');

/* 
  Redis setup
*/
const { Client, Entity, Schema, Repository } = require('redis-om');
class Album extends Entity {};
const albumStructure = {
  artist:         { type: 'string', textSearch: true },
  owner:          { type: 'string', textSearch: true},
  title:          { type: 'string', textSearch: true },
  condition:      { type: 'number' },
  format:         { type: 'string', textSearch: true  },
  comments:       { type: 'string', textSearch: true  },
  price:          { type: 'number' },
  forSale:        { type: 'boolean' }
}
let schema = new Schema(Album, albumStructure , { dataStructure: 'JSON' });

let client = new Client()
let repository = new Repository(schema, client);
client.open(process.env.REDIS_OM_URL)

/*
  Reload: clears the Redis instance of albums and re-indexes the datastore
  if any new changes were made to the schema
*/
// TODO: add users
exports.reload = async (req, res) => {
  await client.execute(['FLUSHALL'])
  await albumsList.forEach( async albumJSON => {
    let album = repository.createEntity()
    album = Object.assign(album, albumJSON)
    await repository.save(album)
  })
  try {
    await repository.dropIndex()
    await repository.createIndex()
    res.sendStatus(200)
  } catch (error) {
    res.json(error)
  }
}


/* 
  Create: creates an album entry based on the req.body data.
  Example Call: 
  POST - api/albums/
  body: { artist: "The Offspring",
          title: "Smash",
          condition: 8,
          format: "CD", comments: "Amazing sophomore album by a great LA band",
          price: 8,
          forSale: true
        }
*/
exports.create = async (req, res) => {
  const albumData = req.body
  albumData.condition = parseInt(albumData.condition)
  albumData.price = parseInt(albumData.price)

  await repository.createAndSave(albumData)
    .then(async response => {
    console.log('Success', response)
    res.json(response.entityData)
    })
    .catch( e => {
      console.log(e)
      res.json({'error': e})
    })
};


/*
  GetAll: retrieve all album objects within Redis with a given offset and count
  Example Call:
  GET - api/albums/?offset=10&count=10
*/
exports.getAll = async (req, res) => {
  const offset = req.query.offset
  const count = req.query.count
  
  await repository
    .search().return
    .page(offset, count)
    .then(response => res.json(response))
    .catch( e => res.json({'error': e}))

};

/*
  GetOne: Retrieve a single album with a given entityID
  Example Call:
  GET - api/albums/{entityID}
*/
exports.getOne = async (req, res) => {
  const entityID = req.params.entityID
  
  await repository
    .fetch(entityID)
    .then( response => res.json(response))
    .catch( e => res.json({'error': e}))
};


/*
  Search: Perform a simple search with one parameter
  Example Call:
  GET - api/albums/search?artist=Sleep
*/

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
    .catch(e => res.json(e))
}


/*
  Update: update the values of an existing album with data passed in via body.
  entityId must be passed as a parameter.
  Example Call:
    PUT - api/albums/{entityID}
    body: { artist: updatedValue, comments: updatedValue }
*/
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
    .then( response => {
      res.json(response)
    })
    .catch( e => {
      res.json({'error': e.message})
    })
}


// Delete a Tutorial with the specified id in the request
exports.delete = async (req, res) => {
  const entityID = req.params.entityID
  await repository
    .remove(entityID)
    .then(response => res.json({ response}))
    .catch( e => res.json({ 'error': e.message}))

};
// Delete all Tutorials from the database.
exports.deleteAll = async (req, res) => {
  const userKey = getKey()
  await client.json
    .set(userKey, { 'path' :'.collection' }, [])
    .then(response => res.json({ message: 'OK'}))
    .catch(e => console.log(e))
};
// Find all published Tutorials
exports.findAllPublished = (req, res) => {
  
};
