// Logs that a command run (even if it was inhibited)
import { PossiblyUncachedMessage, Message, PrivateChannel } from 'eris'
import Event from '../lib/structures/Event'
import { ReactionEmoji } from '../lib/types/discord'
import constants from '../constants'
import Gamer from '..'
import { GamerEvent } from '../lib/types/gamer'
import { GuildSettings } from '../lib/types/settings'

const eventEmojis: string[] = []
export default class extends Event {
  async execute(rawMessage: PossiblyUncachedMessage, emoji: ReactionEmoji, userID: string) {
    if (!eventEmojis.length) {
      const emojis = [constants.emojis.greenTick, constants.emojis.redX]

      for (const emoji of emojis) {
        const id = Gamer.helpers.discord.convertEmoji(emoji, `id`)
        if (id) eventEmojis.push(id)
      }
    }

    const user = Gamer.users.get(userID)
    if (!user || user.bot) return

    // If it is an uncached message we need to fetch the message
    const message =
      rawMessage instanceof Message ? rawMessage : await Gamer.getMessage(rawMessage.channel.id, rawMessage.id)

    if (eventEmojis.includes(emoji.id)) this.handleEventReaction(message, emoji, userID)
  }

  async handleEventReaction(message: Message, emoji: ReactionEmoji, userID: string) {
    if (!message.author.bot || message.channel instanceof PrivateChannel) return
    const event = (await Gamer.database.models.event.findOne({ adMessageID: message.id })) as GamerEvent | null
    if (!event) return

    const guildSettings = (await Gamer.database.models.guild.findOne({
      id: message.channel.guild.id
    })) as GuildSettings | null
    const language = Gamer.i18n.get(guildSettings ? guildSettings.language : `en-US`)
    if (!language) return

    const [joinEmojiID, denyEmojiID] = [constants.emojis.greenTick, constants.emojis.redX].map(e =>
      Gamer.helpers.discord.convertEmoji(e, `id`)
    )

    switch (emoji.id) {
      case joinEmojiID:
        const joinReaction = Gamer.helpers.discord.convertEmoji(constants.emojis.greenTick, `reaction`)
        if (!joinReaction) return
        const joinReactors = await message.getReaction(joinReaction).catch(() => [])
        if (joinReactors.find(user => user.id === userID)) message.removeReaction(joinReaction)

        const response = Gamer.helpers.events.joinEvent(event, userID, language)
        message.channel.createMessage(response).then(msg => setTimeout(() => msg.delete(), 10000))
        break
      case denyEmojiID:
        const denyReaction = Gamer.helpers.discord.convertEmoji(constants.emojis.redX, `reaction`)
        if (!denyReaction) return
        const denyReactors = await message.getReaction(denyReaction).catch(() => [])
        if (denyReactors.find(user => user.id === userID)) message.removeReaction(denyReaction)

        Gamer.helpers.events.denyEvent(event, userID)
        message.channel
          .createMessage(language(`events/eventdeny:DENIED`))
          .then(msg => setTimeout(() => msg.delete(), 10000))
        break
    }
  }
}
