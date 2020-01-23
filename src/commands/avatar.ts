import { Command } from 'yuuko'
import GamerEmbed from '../lib/structures/GamerEmbed'
import GamerClient from '../lib/structures/GamerClient'

export default new Command([`avatar`, `pfp`, `userimage`], (message, _args, context) => {
  if (!message.guildID) return

  const Gamer = context.client as GamerClient
  const user = message.mentions.length ? message.mentions[0] : message.author

  const embed = new GamerEmbed()
    .setAuthor(message.member?.nick || message.author.username, message.author.avatarURL)
    .setImage(user.dynamicAvatarURL('webp', 2048))

  message.channel.createMessage({ embed: embed.code })
  if (message.member) Gamer.helpers.levels.completeMission(message.member, `avatar`, message.guildID)
})
