const express = require("express")
const fs = require("fs")
const app = express()

app.use(express.json())

/* LOAD FILES */
let mirror = require("./data/mirror.json")
let antilink = require("./data/antilink.json")

/* HOME */
app.get("/", (req, res) => {
 res.send(`
  <h1>Bot Dashboard</h1>
  <form action="/set-mirror" method="POST">
    Source Channel ID: <input name="source"/><br>
    Target Channel ID: <input name="target"/><br>
    <button type="submit">Set Mirror</button>
  </form>
 `)
})

/* SET MIRROR */
app.post("/set-mirror", express.urlencoded({ extended: true }), (req, res) => {

 const { source, target } = req.body

 mirror[source] = target
 fs.writeFileSync("./data/mirror.json", JSON.stringify(mirror, null, 2))

 res.send("✅ Mirror Updated")
})

/* TOGGLE ANTILINK */
app.post("/antilink", express.urlencoded({ extended: true }), (req, res) => {

 const { channel } = req.body

 antilink[channel] = !antilink[channel]

 fs.writeFileSync("./data/antilink.json", JSON.stringify(antilink, null, 2))

 res.send("✅ AntiLink toggled")
})

/* START SERVER */
app.listen(3001, () => {
 console.log("🌐 Dashboard running on http://localhost:3001")
})
