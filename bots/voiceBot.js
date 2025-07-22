const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

function createBot(token, voiceChannelId) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates
    ]
  });

  client.once('ready', async () => {
    console.log(`🤖 ${client.user.tag} đã online.`);

    const channel = await client.channels.fetch(voiceChannelId);
    if (!channel || channel.type !== 2) {
      console.log(`❌ Không tìm thấy voice channel.`);
      return;
    }

    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true
    });

    console.log(`✅ ${client.user.tag} đã vào voice.`);
  });

  client.login(token);
}

module.exports = createBot;
