import Event from '../lib/structures/Event'
import { TextChannel, Member, Guild } from 'eris'
import GamerClient from '../lib/structures/GamerClient'
import GamerEmbed from '../lib/structures/GamerEmbed'

export default class extends Event {
  async execute(guild: Guild, member: Member) {
    const Gamer = guild.shard.client as GamerClient
    Gamer.amplitude.push({
      authorID: member.id,
      guildID: guild.id,
      timestamp: Date.now(),
      type: 'MEMBER_ADDED'
    })

    const botMember = guild.members.get(Gamer.user.id)
    if (!botMember) return

    const language = Gamer.i18n.get(Gamer.guildLanguages.get(guild.id) || `en-US`)
    if (!language) return

    const botsHighestRole = Gamer.helpers.discord.highestRole(botMember)
    const membersHighestRole = Gamer.helpers.discord.highestRole(member)

    const guildSettings = await Gamer.database.models.guild.findOne({ id: guild.id })
    // If no custom guild settings cancel out
    if (!guildSettings) return

    // Mute Role

    // In case other bots/users add a role to the user we do this check
    if (botMember.permission.has('manageRoles') && botsHighestRole.position > membersHighestRole.position) {
      if (guildSettings.moderation.roleIDs.mute && guildSettings.moderation.users.mutedUserIDs.includes(member.id))
        member.addRole(guildSettings.moderation.roleIDs.mute, language(`moderation/mute:GUILDMEMBERADD_MUTED`))

      // Verify Or AutoRole

      // If verification is enabled and the role id is set add the verify role
      if (guildSettings.verify.enabled && guildSettings.verify.roleID)
        member.addRole(guildSettings.verify.roleID, language(`basic/verify:VERIFY_ACTIVATE`))
      // If discord verification is disabled and auto role is set give the member the auto role
      else if (!guildSettings.verify.discordVerificationStrictnessEnabled && guildSettings.moderation.roleIDs.autorole)
        member.addRole(guildSettings.moderation.roleIDs.autorole, language(`basic/verify:AUTOROLE_ASSIGNED`))
    }

    // Welcome Message
    if (guildSettings.hibye.welcome.message) {
      try {
        const isEmbed = guildSettings.hibye.welcome.message.startsWith('{')
        const transformed = Gamer.helpers.transform.variables(guildSettings.hibye.welcome.message)

        const embed = isEmbed ? JSON.parse(transformed) : null

        if (guildSettings.hibye.welcome.dmEnabled) {
          const dmChannel = await member.user.getDMChannel()
          if (embed) dmChannel.createMessage({ embed })
          else dmChannel.createMessage(transformed)
        } else if (!guildSettings.hibye.welcome.dmOnly && guildSettings.hibye.welcome.channelID) {
          const welcomeChannel = guild.channels.get(guildSettings.hibye.welcome.channelID)
          if (welcomeChannel && welcomeChannel instanceof TextChannel) {
            if (embed) welcomeChannel.createMessage({ embed })
            else welcomeChannel.createMessage(transformed)
          }
        }
      } catch {}
    }

    // Server logs feature
    // If there is no channel set for logging this cancel
    if (!guildSettings.moderation.logs.serverlogs.members.channelID) return

    // Create the base embed that first can be sent to public logs
    const embed = new GamerEmbed()
      .setTitle(language(`moderation/logs:MEMBER_JOINED`))
      .addField(language(`moderation/logs:MEMBER_NAME`), member.mention, true)
      .addField(language(`moderation/logs:USER_ID`), member.id, true)
      .addField(language(`moderation/logs:TOTAL_MEMBERS`), member.guild.memberCount.toString(), true)
      .setFooter(`${member.username}#${member.discriminator}`, `https://i.imgur.com/Ya0SXdI.png`)
      .setThumbnail(member.avatarURL)
      .setTimestamp()

    const logs = guildSettings.moderation.logs

    // If public logs are enabled properly then send the embed there
    if (logs.serverlogs.members.addPublicEnabled && logs.publiclogsChannelID) {
      const publicLogChannel = guild.channels.get(logs.publiclogsChannelID)
      if (publicLogChannel instanceof TextChannel) {
        const botPerms = publicLogChannel.permissionsOf(Gamer.user.id)
        if (
          publicLogChannel &&
          botPerms.has('embedLinks') &&
          botPerms.has('readMessages') &&
          botPerms.has('sendMessages')
        )
          publicLogChannel.createMessage({ embed: embed.code })
      }
    }

    // Send the finalized embed to the log channel
    const logChannel = guild.channels.get(guildSettings.moderation.logs.serverlogs.members.channelID)
    if (logChannel instanceof TextChannel) {
      const botPerms = logChannel.permissionsOf(Gamer.user.id)
      if (botPerms.has(`embedLinks`) && botPerms.has(`readMessages`) && botPerms.has(`sendMessages`))
        logChannel.createMessage({ embed: embed.code })
    }
  }
}