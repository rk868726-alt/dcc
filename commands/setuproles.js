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
   "🔥": "𝐇𝐀𝐊𝐈⚡",
   "😈": "𝐒𝐇𝐀𝐑𝐈𝐍𝐆𝐀𝐍😈",
   "⚡": "𝐁𝐀𝐍𝐊𝐀𝐈🔥"
  }

  fs.writeFileSync("./data/reactionroles.json", JSON.stringify(data, null, 2))

 }

}
