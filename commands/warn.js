const fs = require("fs")

module.exports = {
 name: "warn",

 execute(message, args) {

  const user = message.mentions.members.first()

  if (!user) return

  const warns = JSON.parse(fs.readFileSync("./data/warns.json"))

  if (!warns[user.id]) warns[user.id] = 0

  warns[user.id]++

  fs.writeFileSync("./data/warns.json", JSON.stringify(warns))

  message.channel.send(`${user.user.tag} warned`)
 }
}