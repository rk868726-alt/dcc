const fs = require("fs")

module.exports = {
 name: "mirror",

 execute(message, args) {

  const from = message.mentions.channels.first()
  const to = message.mentions.channels.last()

  if (!from || !to) return message.reply("Usage: !mirror #from #to")

  const data = JSON.parse(fs.readFileSync("./data/mirror.json"))

  data[from.id] = to.id

  fs.writeFileSync("./data/mirror.json", JSON.stringify(data))

  message.channel.send("Mirror set")
 }
}