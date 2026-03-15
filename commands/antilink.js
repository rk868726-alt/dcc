const fs = require("fs")

module.exports = {
 name: "antilink",

 execute(message, args) {

  const channel = message.mentions.channels.first()

  const data = JSON.parse(fs.readFileSync("./data/antilink.json"))

  data[channel.id] = true

  fs.writeFileSync("./data/antilink.json", JSON.stringify(data))

  message.channel.send("Anti link enabled")
 }
}