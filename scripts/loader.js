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
    console.log('Entries Deleted')
    albumsList.forEach( async (albumJSON, index) =>  {
      const ownerIndex = index % usersList.length
      let album = repository.createEntity()
      albumJSON.owner = usersList[ownerIndex].username
      album = Object.assign(album, albumJSON)
      await repository.save(album)
    })

    await repository.dropIndex()
    console.log('Index Dropped')
    await repository.createIndex()
    console.log('Entries Indexed')
    let results = await repository.search().return.all()
    console.log(`Entries created: ${results.length}`)
    process.exit(0)
  })
})()