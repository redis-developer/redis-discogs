/* 
  Redis setup
*/
require('dotenv').config({ override: false })

const { Client, Entity, Schema, Repository } = require('redis-om')
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
client.open(process.env.REDIS_OM_URL)
let repository = new Repository(schema, client)

module.exports.client = client
module.exports.repository = repository