require('dotenv').config({ override: false })

const albumsList = require('../db/albumsList.json');
const usersList = require('../db/usersList.json');
const { Client, Entity, Schema, Repository } = require('redis-om');

(async () => {
  class Album extends Entity {}
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
  let schema = new Schema(Album, albumStructure , { dataStructure: 'JSON' })
  let client = new Client()
  await client.open(process.env.REDIS_OM_URL)
  let repository = new Repository(schema, client)

  client.execute(['FLUSHALL'])
  .then( async () => {
    albumsList.forEach( async (albumJSON, index) =>  {
      const ownerIndex = index % usersList.length
      let album = repository.createEntity()
      albumJSON.owner = usersList[ownerIndex].username
      album = Object.assign(album, albumJSON)
      let result = await repository.save(album)
      console.log(result)
    })
    await repository.dropIndex()
    await repository.createIndex()
    console.log('Indexes reindexed')
    process.exit(0)
  })


})()