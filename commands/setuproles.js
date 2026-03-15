const { EmbedBuilder } = require("discord.js")
const fs = require("fs")

module.exports = {

 name: "setuproles",

 async execute(message) {

  const embed = new EmbedBuilder()
   .setColor("Purple")
   .setTitle("🎮 React to get roles!")
   .setDescription(`
🔥 = **BANKAI** 🔥
😈 = **SHARINGAN** 😈
⚡ = **HAKI** ⚡
`)
   .setFooter({ text: "Choose your power" })

  const msg = await message.channel.send({ embeds: [embed] })

  await msg.react("🔥")
  await msg.react("😈")
  await msg.react("⚡")

  const data = JSON.parse(fs.readFileSync("./data/reactionroles.json"))

  data[msg.id] = {
   "🔥": "ROLE_ID_1",
   "😈": "ROLE_ID_2",
   "⚡": "ROLE_ID_3"
  }

  fs.writeFileSync("./data/reactionroles.json", JSON.stringify(data, null, 2))

 }

}
