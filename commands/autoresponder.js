const fs = require("fs")

module.exports = {
 name: "autoresponder",

 execute(message, args) {

  const trigger = args[0]
  const response = args.slice(1).join(" ")

  const data = JSON.parse(fs.readFileSync("./data/autoresponder.json"))

  data[trigger] = response

  fs.writeFileSync("./data/autoresponder.json", JSON.stringify(data))

  message.channel.send("Auto responder added")
 }
}