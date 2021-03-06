import { Command } from 'yuuko'
import GamerClient from '../../lib/structures/GamerClient'
import { MessageEmbed } from 'helperis/dist/src/MessageEmbed'

const allAdvice = [
  `**Take time to know yourself.** "Know thyself" said Aristotle. When you know who you are, you can be wise about your goals, your dreams, your standards, your convictions. Knowing who you are allows you to live your life with purpose and meaning.`,
  `**A narrow focus brings big results.** The number one reason people give up so fast is because they tend to look at how far they still have to go instead of how far they have come. But it's a series of small wins that can give us the most significant success.`,
  `**Show up fully.** Don't dwell on the past, and don't daydream about the future, but concentrate on showing up fully in the present moment.`,
  `**Don't make assumptions.** If you don't know the situation fully, you can't offer an informed opinion.`,
  `**Be patient and persistent.** Life is not so much what you accomplish as what you overcome.`,
  `**In order to get, you have to give.** If you support, guide, and lead others, if you make contributions to their lives, you will reap the best rewards.`,
  `**Luck comes from hard work.** Luck happens when hard work and timing and talent intersect.`,
  `**Be your best at all times.** You never know what the future will bring, so always make the best use of the present.`,
  `**Don't try to impress everyone.** The unhappiest people are those who care the most about what other people think.`,
  `**Don't be afraid of being afraid.** Sometimes the one thing you need for growth is the one thing you are most afraid to do.`,
  `**Listen to learn. Learn how to listen.** You can't learn anything when you're talking.`,
  `**Life's good, but it's not fair.** The delusion that life's supposed to be fair is the source of much unhappiness.`,
  `**No task is beneath you.** Don't put yourself above anyone or anything; work hard in silence and let success make the noise.`,
  `**You can't always get what you want.** But, as the song says, if you try you may find you get what you need.`,
  `**Don't make decisions when you are angry or ecstatic.** The best decisions are made with a clear conscious mind, not in the throes of any emotion--positive or negative.`,
  `**Don't worry what other people think.** Personality begins where comparison leaves off.Be unique.Be memorable.Be confident.Be proud.`,
  `**Use adversity as an opportunity.** Every loss leads to an opportunity, and every adversity leads to new possibilities.`,
  `**Do what is right, not what is easy.** Strength of character leads us to do the right thing, even when there are easier options.`,
  `**Dreams remain dreams until you take action.** Without action, an idea is just a dream.`,
  `**Treat others the way you want to be treated.** Do right. Do your best. Treat others as you would want them to treat you.`,
  `**When you quit, you fail.** The surest way to lose at any endeavor is to quit. But fatigue, discomfort, and discouragement are merely symptoms of effort.`,
  `**Trust your instincts.** What good is intuition if you let second-guessing drown it out? The worst enemy of success is self-doubt.`,
  `**Learn something new every day.** Have the mindset of a student. Never think you are too old to ask questions or know too much to learn something new.`,
  `**Make what is valuable important.** Instead of thinking about what is profitable, think about what is valuable. Invest in others and you will grow your portfolio.`,
  `**Believe in yourself.** The way you see yourself is the way you will treat yourself, and the way you treat yourself is what you become.`,
  `**Don’t look at the calendar.** Just keep celebrating every day.`,
  `**Invest in quality pieces,** they never go out of style.`,
  `**I make myself go out every day,** even if it’s only to walk around the block. The key to staying young is to keep moving.`
]

export default new Command([`advice`, `ad`], async (message, _args, context) => {
  if (!message.guildID) return

  const Gamer = context.client as GamerClient

  const advice = Gamer.helpers.utils.chooseRandom(allAdvice)

  const [user] = message.mentions
  const embed = new MessageEmbed()
    .setAuthor(message.member?.nick || message.author.username, message.author.avatarURL)
    .setDescription(`${user?.mention || message.author.mention}, ${advice}`)

  message.channel.createMessage({ embed: embed.code })

  if (message.member) Gamer.helpers.levels.completeMission(message.member, `advice`, message.guildID)
})
