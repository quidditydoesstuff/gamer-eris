import { Command } from 'yuuko'
import GamerClient from '../../lib/structures/GamerClient'
import { GamerSubscriptionType } from '../../database/schemas/subscription'
import { fetchRSSFeed } from '../../lib/utils/rss'
import { needMessage } from '../../lib/utils/eris'
import { fetchChannelIDWithName } from '../../lib/utils/youtube'

export default new Command(`youtube`, async (message, args, context) => {
  if (!message.member) return

  const Gamer = context.client as GamerClient
  const guildSettings = await Gamer.database.models.guild.findOne({ id: message.member.guild.id })

  // If the user is not an admin/mod cancel out
  if (!Gamer.helpers.discord.isModOrAdmin(message, guildSettings)) return

  const helpCommand = Gamer.commandForName('help')
  const [type, username, ...gameName] = args
  if (!type) return helpCommand?.execute(message, [`youtube`], { ...context, commandName: 'help' })

  const language = Gamer.getLanguage(message.guildID)

  if (type && type.toLowerCase() === `list`) {
    const youtubeSubs = await Gamer.database.models.subscription.find()

    let response = ``
    for (const sub of youtubeSubs) {
      if (response.length === 2000) break
      const listener = sub.subs.find(s => s.guildID === message.guildID)
      if (!listener) continue

      const text = `${sub.username} <#${listener.channelID}>\n`
      if (response.length + text.length > 2000) break
      response += text
    }

    if (!response.length) return message.channel.createMessage(language(`utility/youtube:NONE`))
    return message.channel.createMessage(response)
  }

  if (!username) return helpCommand?.execute(message, [`youtube`], { ...context, commandName: 'help' })

  // Fetch this username from subscriptions specifically for youtube
  const userSubscription = await Gamer.database.models.subscription.findOne({
    username,
    type: GamerSubscriptionType.YOUTUBE
  })

  const game = gameName.join(' ')
  const subPayload = {
    game: game?.toLowerCase() ?? null,
    guildID: message.member.guild.id,
    channelID: message.channel.id,
    text: '',
    latestLink: ''
  }

  switch (type.toLowerCase()) {
    case `subscribe`:
      const youtubeID = await fetchChannelIDWithName(username)
      // If it does not exist create a new subscription for the user
      if (!userSubscription) {
        const payload = {
          username,
          type: GamerSubscriptionType.YOUTUBE,
          subs: [subPayload]
        }

        message.channel.createMessage(language('utility/youtube:CUSTOM_RESPONSE', { mention: message.author.mention }))
        const customMessage = await needMessage(message)
        subPayload.text = customMessage.content

        const feed = await fetchRSSFeed(`https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeID}`)
        if (feed?.items) {
          const videos = feed.items.reverse()
          message.channel.createMessage(`I have subscribed to this user, and now posting there most recent videos:`)
          for (const video of videos) {
            if (video.link) {
              message.channel.createMessage(video.link)
              subPayload.latestLink = video.link
            }
          }
        }
        await Gamer.database.models.subscription.create(payload)
        return message.channel.createMessage(
          language(`utility/youtube:SUBSCRIBED`, { username, channel: message.channel.mention })
        )
      }
      // The user already has a subscription created for youtube we only need to add a sub to it
      const subscription = userSubscription.subs.find(sub => sub.channelID === message.channel.id)
      if (subscription) return message.channel.createMessage(language(`utility/youtube:ALREADY_SUBBED`, { username }))

      message.channel.createMessage(language('utility/youtube:CUSTOM_RESPONSE', { mention: message.author.mention }))
      const customMessage = await needMessage(message)
      subPayload.text = customMessage.content

      userSubscription.subs.push(subPayload)
      userSubscription.save()

      const feed = await fetchRSSFeed(`https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeID}`)
      if (feed?.items) {
        const videos = feed.items.reverse()
        message.channel.createMessage(`I have subscribed to this user, and now posting there most recent videos:`)
        for (const video of videos) {
          if (video.link) {
            message.channel.createMessage(video.link)
            subPayload.latestLink = video.link
          }
        }
      }
      return message.channel.createMessage(
        language(`utility/youtube:SUBSCRIBED`, { username, channel: message.channel.mention })
      )
    case `unsubscribe`:
      // If the user tries to remove a sub but this username has no existing subscriptions
      if (!userSubscription)
        return message.channel.createMessage(language(`utility/youtube:NOT_SUBSCRIBED`, { username }))

      // If the username does have a subscription BUT he wasnt subscribed to get alerts in this channel
      const relevantSubscription = userSubscription.subs.find(sub => sub.channelID === message.channel.id)
      if (!relevantSubscription)
        return message.channel.createMessage(language(`utility/youtube:NOT_SUBBED`, { username }))

      userSubscription.subs = userSubscription.subs.filter(sub => sub.channelID !== message.channel.id)
      userSubscription.save()

      return message.channel.createMessage(language(`utility/youtube:UNSUBBED`, { username }))
  }

  return helpCommand?.execute(message, [`youtube`], { ...context, commandName: 'help' })
})
