import { Command } from 'yuuko'
import { PrivateChannel, GroupChannel } from 'eris'
import GamerClient from '../lib/structures/GamerClient'
import constants from '../constants'

export default new Command([`balance`, `bal`, `wallet`], async (message, _args, context) => {
  const Gamer = context.client as GamerClient
  if (message.channel instanceof PrivateChannel || message.channel instanceof GroupChannel || !message.member) return

  const language = Gamer.i18n.get(Gamer.guildLanguages.get(message.channel.guild.id) || `en-US`)
  if (!language) return

  const userSettings =
    (await Gamer.database.models.user.findOne({ userID: message.author.id })) ||
    (await Gamer.database.models.user.create({ userID: message.author.id }))

  // Respond telling the user how much they have
  return message.channel.createMessage(
    language(`leveling/balance:SUCCESS`, {
      mention: message.author.mention,
      amount: userSettings.leveling.currency,
      emoji: constants.emojis.coin
    })
  )
})
