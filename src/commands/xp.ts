import { Command } from 'yuuko'
import { PrivateChannel, GroupChannel } from 'eris'
import GamerClient from '../lib/structures/GamerClient'

export default new Command(`xp`, async (message, args, context) => {
  const Gamer = context.client as GamerClient
  if (message.channel instanceof PrivateChannel || message.channel instanceof GroupChannel || !message.member) return
  if (!args.length) return

  const guildSettings = await Gamer.database.models.guild.findOne({
    id: message.channel.guild.id
  })

  if (!Gamer.helpers.discord.isAdmin(message, guildSettings?.staff.adminRoleID)) return

  const language = Gamer.getLanguage(message.channel.guild.id)

  const [type, number, ...idOrRoleName] = args
  const isAdding = type.toLowerCase() === `add`
  const amount = parseInt(number, 10)
  if (!amount) return

  const idOrName = idOrRoleName.join(' ').toLowerCase()
  const memberID = message.mentions.length ? message.mentions[0].id : idOrName

  const role =
    message.channel.guild.roles.get(idOrName) ||
    message.channel.guild.roles.find(r => r.name.toLowerCase() === idOrName)

  if (role) {
    for (const member of message.channel.guild.members.values()) {
      if (!member.roles.includes(role.id)) continue
      // User has the role so they need to be updated
      if (isAdding) Gamer.helpers.levels.addLocalXP(member, amount, true)
      else if (type.toLowerCase() === `remove`) Gamer.helpers.levels.removeXP(member, amount)
    }

    // Respond telling the user how much they gained
    return message.channel.createMessage(
      language(isAdding ? `leveling/xp:ADDED_ALL` : `leveling/xp:REMOVED_ALL`, {
        rolename: role.name,
        amount
      })
    )
  }

  // The user is trying to update just 1 member
  const member = message.channel.guild.members.get(memberID) || message.member
  if (isAdding) Gamer.helpers.levels.addLocalXP(member, amount, true)
  else if (type.toLowerCase() === `remove`) Gamer.helpers.levels.removeXP(member, amount)
  // Cancel out if not add or remove
  else return
  // Respond telling the user how much they gained
  return message.channel.createMessage(
    language(isAdding ? `leveling/xp:ADDED` : `leveling/xp:REMOVED`, {
      mention: member.username,
      amount
    })
  )
})
