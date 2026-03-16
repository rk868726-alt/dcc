const { EmbedBuilder } = require("discord.js")

module.exports = {
 name: "serverinfo",

 execute(message) {

  const guild = message.guild

  const embed = new EmbedBuilder()
   .setColor("Blue")
   .setTitle("📊 Server Information")
   .setThumbnail(guild.iconURL())
   .addFields(
    { name: "Server Name", value: guild.name, inline: true },
    { name: "Server ID", value: guild.id, inline: true },
    { name: "Members", value: `${guild.memberCount}`, inline: true },
    { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
    { name: "Created At", value: `${guild.createdAt.toDateString()}`, inline: true }
   )

  message.channel.send({ embeds: [embed] })

 }
}
