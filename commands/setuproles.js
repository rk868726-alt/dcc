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
   "🔥": "1482763269662969987",
   "😈": "1482763703584559346",
   "⚡": "1482933424892153916"
  }

  fs.writeFileSync("./data/reactionroles.json", JSON.stringify(data, null, 2))

 }

}
