const express = require("express");
const app = express();
const cors = require("cors");
const controller = require('./controllers/tutorial.controller.js');

(async () => {

  app.use(cors({origin: "http://localhost:3000"}))

  app.use(express.json())

  app.use(express.urlencoded({extended:true}))

  app.get("/api/reload", controller.reload)
  app.post("/api/albums", controller.create)
  app.get("/api/albums/", controller.getAll)
  app.get("/api/albums/:entityID", controller.getOne)
  app.get("/api/albums/search/", controller.search)
  app.put("/api/albums/:entityID", controller.update)
  app.delete("/api/albums/:entityID", controller.delete)


  
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

})();
