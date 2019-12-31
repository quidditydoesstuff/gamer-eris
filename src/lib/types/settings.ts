import mongoose from 'mongoose'

export interface UserSettings extends mongoose.Document {
  id: string
  userID: string
  profile: {
    backgroundID: number
    theme: string
  }
  afk: {
    enabled: boolean
    message: string
  }
  moderationNetworkEnabled: boolean
  vip: {
    isVIP: boolean
    guildsRegistered: string[]
    openTickets: number
  }
  leveling: {
    boosts: Boost[]
    xp: number
    level: number
    currency: number
    backgrounds: number[]
    badges: {
      bought: number[]
      equipped: number[]
    }
    badgesUnlocked: number
  }
  network: {
    guildID?: string
  }
}

export interface Boost {
  name: string
  timestamp?: number
  multiplier: number
  active: boolean
  activatedAt?: number
}

export interface MemberSettings extends mongoose.Document {
  id: string
  guildID: string
  memberID: string
  nickname: string
  leveling: {
    xp: number
    level: number
    voicexp: number
    voicelevel: number
    joinedVoiceAt: number
    lastUpdatedAt: number
  }
}

export interface GuildSettings extends mongoose.Document {
  id: string
  language: string
  menutime: number
  prefix: string
  antiraid: {
    autoBanNudeBotsEnabled: boolean
    alertsEnabled: boolean
  }
  verify: {
    categoryID: string | undefined
    firstMessageJSON: string
    roleID: string | undefined
    channelIDs: string[]
    enabled: boolean
    discordVerificationStrictnessEnabled: boolean
  }
  mails: {
    alertRoleIDs: string[]
    blockedUserIDs: string[]
    categoryID: string | undefined
    enabled: boolean
    supportChannelID: string | undefined
  }
  staff: {
    adminRoleID: string | undefined
    modRoleIDs: string[]
  }
  vip: {
    isVIP: boolean
    registeredAt: number
    userID: string | undefined
    logoURLs: string[]
  }
  tags: {
    disabledChannels: string[]
  }
  modules: string[]
  moderation: {
    roleIDs: {
      autorole?: string
      public: string[]
      mute?: string
    }
    users: {
      mutedUserIDs: string[]
    }
    filters: {
      profanity: {
        words: string[]
        strictWords: string[]
        enabled: boolean
      }
      capital: number
      url: {
        enabled: boolean
        roleIDs: string[]
        channelIDs: string[]
        userIDs: string[]
        urls: string[]
      }
    }
    logs: {
      modlogsChannelID: string | undefined
      publiclogsChannelID: string | undefined
      serverlogs: {
        ignoredRoleIDs: string[]
        ignoredChannelIDs: string[]
        roles: {
          channelID: string | undefined
          createPublicEnabled: boolean
          deletePublicEnabled: boolean
          updatePublicEnabled: boolean
          memberPublicEnabled: boolean
        }
        members: {
          channelID: string | undefined
          addPublicEnabled: boolean
          removePublicEnabled: boolean
          nicknamePublicEnabled: boolean
        }
        bot: {
          channelID: string | undefined
        }
        messages: {
          channelID: string | undefined
          deletedPublicEnabled: boolean
          editedPublicEnabled: boolean
        }
        emojis: {
          channelID: string | undefined
          createPublicEnabled: boolean
          deletePublicEnabled: boolean
          updatePublicEnabled: boolean
        }
        channels: {
          channelID: string | undefined
          createPublicEnabled: boolean
          deletePublicEnabled: boolean
          updatePublicEnabled: boolean
        }
      }
    }
  }
  hibye: {
    welcome: {
      channelID: string | undefined
      dmEnabled: boolean
      dmOnly: boolean
      message: string
    }
    goodbye: {
      channelID: string | undefined
      dmEnabled: boolean
      dmOnly: boolean
      message: string
    }
  }
  feedback: {
    approvalChannelID: string | undefined
    logChannelID: string | undefined
    solvedChannelID: string | undefined
    rejectedChannelID: string | undefined
    solvedMessage: string
    rejectedMessage: string
    feedbacksSent: number
    idea: {
      channelID: string | undefined
      questions: string[]
      emojis: {
        down: string
        up: string
      }
    }
    bugs: {
      channelID: string | undefined
      questions: string[]
      emojis: {
        down: string
        up: string
      }
    }
  }
  eventsAdvertiseChannelID: string | undefined
  twitch: {
    current: number
    max: number
    offlineAlertsEnabled: boolean
  }
  xp: {
    inactiveDaysAllowed: number
    daily: number
    prizes: {
      first: string
      second: string
      third: string
    }
  }
  network: {
    channelIDs: {
      followers: string[]
      wall?: string
      notifications?: string
      feed?: string
      photos?: string
    }
  }
  roleIDs: {
    eventsCreate?: string
  }
  channelIDs: {
    tournaments?: string
  }
}
