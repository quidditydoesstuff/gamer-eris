import { Command } from 'yuuko'
import GamerEmbed from '../lib/structures/GamerEmbed'
import GamerClient from '../lib/structures/GamerClient'
import { PrivateChannel } from 'eris'
import { GuildSettings } from '../lib/types/settings'
import { GamerModlog } from '../lib/types/gamer'

export default new Command(`unmute`, async (message, args, context) => {
  if (message.channel instanceof PrivateChannel || !message.member) return

  const Gamer = context.client as GamerClient
  const botMember = message.channel.guild.members.get(Gamer.user.id)
  if (!botMember) return

  const guildSettings = (await Gamer.database.models.guild.findOne({
    id: message.channel.guild.id
  })) as GuildSettings | null
  const language = Gamer.i18n.get(guildSettings ? guildSettings.language : `en-US`)
  if (!language) return
  // If there is default settings the mute role won't exist
  if (!guildSettings) return message.channel.createMessage(language(`moderation/unmute:NEED_MUTE_ROLE`))

  // Check if the bot has the ban permissions
  if (!botMember.permission.has('manageRoles'))
    return message.channel.createMessage(language(`moderation/mute:NEED_MANAGE_ROLES`))

  if (
    !Gamer.helpers.discord.isModerator(message, guildSettings ? guildSettings.staff.modRoleIDs : []) &&
    !Gamer.helpers.discord.isAdmin(message, guildSettings?.staff.adminRoleID)
  )
    return

  const [userID] = args
  args.shift()

  const user = Gamer.users.get(userID) || message.mentions[0]
  if (!user) return message.channel.createMessage(language(`moderation/unmute:NEED_USER`))

  // If it was a valid duration then remove it from the rest of the text
  const [time] = args
  const duration = Gamer.helpers.transform.stringToMilliseconds(time)
  if (duration) args.shift()

  const reason = args.join(` `)
  if (!reason) return message.channel.createMessage(language(`moderation/unmute:NEED_REASON`))

  const member = message.channel.guild.members.get(user.id)
  if (!member) return
  // Checks if the bot is higher than the user
  if (!Gamer.helpers.discord.compareMemberPosition(botMember, member))
    return message.channel.createMessage(language(`moderation/unmute:BOT_TOO_LOW`))
  // Checks if the mod is higher than the user
  if (!Gamer.helpers.discord.compareMemberPosition(message.member, member))
    return message.channel.createMessage(language(`moderation/unmute:USER_TOO_LOW`))

  // Check if the mute role exists
  const muteRole = message.channel.guild.roles.get(guildSettings.moderation.roleIDs.mute)
  if (!muteRole) return

  await member.removeRole(guildSettings.moderation.roleIDs.mute)

  const embed = new GamerEmbed()
    .setDescription(language(`moderation/unmute:TITLE`, { guildName: message.channel.guild.name, user: user.username }))
    .setThumbnail(user.avatarURL)
    .setTimestamp()
    .addField(
      language(`common:REASON`),
      language(`moderation/unmute:REASON`, { user: message.author.username, reason })
    )

  // Send the user a message. AWAIT to make sure message is sent before they are banned and lose access
  const dmChannel = await user.getDMChannel().catch(() => undefined)
  if (dmChannel) dmChannel.createMessage({ embed: embed.code }).catch(() => undefined)

  const modlogID = Gamer.helpers.moderation.createModlog(
    message,
    guildSettings,
    language,
    user,
    `unmute`,
    reason,
    duration
  )

  // Response that will get sent in the channel
  const response = new GamerEmbed()
    .setAuthor(language(`moderation/warn:MODERATOR`, { mod: message.author.username }), message.author.avatarURL)
    .addField(
      language(`moderation/modlog:MEMBER`),
      language(`moderation/warn:MEMBER_INFO`, { member: member?.mention, user: member.username, id: member.id })
    )
    .addField(language(`common:REASON`), reason)
    .setTimestamp()
    .setFooter(language(`moderation/modlog:CASE`, { id: modlogID }))

  message.channel.createMessage({ embed: response.code })

  // Set this users mute log to no no longer need to unmute the user
  const log = (await Gamer.database.models.modlog.findOne({
    action: `mute`,
    userID: member.id,
    guildID: member.guild.id,
    needUnmute: true
  })) as GamerModlog | null
  if (!log) return
  log.needsUnmute = false
  return log.save()
})
