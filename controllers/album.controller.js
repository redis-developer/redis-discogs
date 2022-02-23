const albumsList = require('../db/albumsList.json');
const usersList = require('../db/usersList.json');

const { client, repository } = require('../db/db.config');

/*
  Reload: Refreshes db with data from user.json and albumsList.json.
  Also reindexes the database to update any changes made to the schema.
  Example Call:
  GET - api/reload/
*/
exports.reload = async (req, res) => {
  await client.execute(['FLUSHALL'])
  albumsList.forEach( async (albumJSON, index) => {
    let album = repository.createEntity()
    album = Object.assign(album, albumJSON)
    const ownerIndex = index % usersList.length
    album.owner = usersList[ownerIndex].username
    await repository.save(album)
  })
  try {
    await repository.dropIndex()
    await repository.createIndex()
    res.sendStatus(200)
  } catch (e) {
    res.json({'error': e.message})
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
  albumData.forSale = 'true' && true

  await repository.createAndSave(albumData)
    .then(async response => res.json(response))
    .catch( e => res.json({'error': e.message}))
};


/*
  GetAll: retrieve all album objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/albums/?offset=10&count=10
*/
exports.getAll = async (req, res) => {
  const offset = req.query.offset || 0
  const count = req.query.count || 10
  
  await repository
    .search().return
    .page(offset, count)
    .then(response => res.json(response))
    .catch( e => res.json({'error': e.message}))

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
    .catch( e => res.json({'error': e.message}))
};


/*
  Search: Perform a simple search with one parameter
  Example Call:
  GET - api/albums/search?artist=Sleep
*/

exports.search = async (req, res) => {
  console.log('search called')
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
    .then( response => res.json(response))
    .catch( e => res.json({'error': e.message}))
}


/*
  Delete: Remove a single album from the database
  Example Call:
  DELETE - /api/albums/{entityID}
*/
exports.delete = async (req, res) => {
  const entityID = req.params.entityID
  await repository
    .remove(entityID)
    .then(response => res.sendStatus(200))
    .catch( e => res.json({'error': e.message}))
};

