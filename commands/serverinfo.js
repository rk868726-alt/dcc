const { EmbedBuilder } = require("discord.js")

module.exports = {
 name: "serverinfo",

 execute(message) {

  const guild = message.guild

  const totalMembers = guild.memberCount
  const humans = guild.members.cache.filter(m => !m.user.bot).size
  const bots = guild.members.cache.filter(m => m.user.bot).size

  const textChannels = guild.channels.cache.filter(c => c.type === 0).size
  const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size
  const categories = guild.channels.cache.filter(c => c.type === 4).size

  const roles = guild.roles.cache.size
  const emojis = guild.emojis.cache.size

  const embed = new EmbedBuilder()
   .setColor("Purple")
   .setTitle(`📊 ${guild.name} Server Information`)
   .setThumbnail(guild.iconURL({ dynamic: true }))
   .addFields(
    { name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: true },
    { name: "🆔 Server ID", value: guild.id, inline: true },
    { name: "📅 Created", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },

    { name: "👥 Total Members", value: `${totalMembers}`, inline: true },
    { name: "🙋 Humans", value: `${humans}`, inline: true },
    { name: "🤖 Bots", value: `${bots}`, inline: true },

    { name: "💬 Text Channels", value: `${textChannels}`, inline: true },
    { name: "🔊 Voice Channels", value: `${voiceChannels}`, inline: true },
    { name: "📁 Categories", value: `${categories}`, inline: true },

    { name: "🎭 Roles", value: `${roles}`, inline: true },
    { name: "😀 Emojis", value: `${emojis}`, inline: true }
   )
   .setFooter({ text: `Requested by ${message.author.tag}` })
   .setTimestamp()

  message.channel.send({ embeds: [embed] })

 }
}
