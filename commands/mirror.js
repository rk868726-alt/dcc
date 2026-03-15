const fs = require("fs")

module.exports = {
 name: "mirror",

 execute(message, args) {

  if (!message.member.permissions.has("ManageChannels"))
   return message.reply("You need Manage Channels permission")

  const from = message.mentions.channels.first()
  const to = message.mentions.channels.last()

  if (!from || !to)
   return message.reply("Usage: !mirror #from-channel #to-channel")

  let data = JSON.parse(fs.readFileSync("./data/mirror.json"))

  data[from.id] = to.id

  fs.writeFileSync("./data/mirror.json", JSON.stringify(data, null, 2))

  message.reply(`Messages from ${from} will now mirror to ${to}`)
 }
}
