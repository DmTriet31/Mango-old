const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

// Cooldown 10 giây mỗi user
const cooldown = new Set();

// ID role Valorant
const VALORANT_ROLE_ID = "1376211286563754046";

module.exports = {
  name: "val-prefix",
  description: "Lệnh prefix +1 → +5 giống /val",
  run: async (message, client) => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const match = content.match(/^\+([1-5])\s+(.+)/);
    if (!match) return; // Không phải +1 → +5

    // Chống spam 10s
    if (cooldown.has(message.author.id)) {
      return message.reply("⏳ **Bạn phải đợi 10 giây trước khi dùng lại!**");
    }
    cooldown.add(message.author.id);
    setTimeout(() => cooldown.delete(message.author.id), 10000);

    const need = match[1];       // số người cần
    let msg = match[2];          // code/paste

    // Auto lấy code: chỉ số
    const extractedCode = msg.match(/\d+/)?.[0] || msg;
    msg = extractedCode;

    const member = message.member;
    const voiceChannel = member.voice?.channel;

    let roomName = '❌ Không ở trong voice';
    let slot = '0/0';
    let row = null;

    const embed = new EmbedBuilder()
      .setColor(0xAA00FF)
      .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
      .setFooter({ text: 'Prefix: +1 → +5 | Ví dụ: +3 123456' })
      .addFields(
        { name: '> [Need]', value: `+${need} players`, inline: true },
        { name: '> [Code]', value: `\`${msg}\``, inline: true }
      );

    // Nếu chủ đang ở voice
    if (voiceChannel) {
      const memberCount = voiceChannel.members.size;
      const userLimit = voiceChannel.userLimit;
      slot = `${memberCount}/${userLimit === 0 ? '∞' : userLimit}`;
      roomName = voiceChannel.name;

      const joinBtn = new ButtonBuilder()
        .setLabel("🔊 Join Voice")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`join_voice_${member.id}`);

      row = new ActionRowBuilder().addComponents(joinBtn);
    }

    embed.addFields(
      { name: '> [Room]', value: roomName, inline: true },
      { name: '> [Slot]', value: slot, inline: true }
    );

    await message.channel.send({
      content: `<@&${VALORANT_ROLE_ID}> — ${member} đang cần **+${need}**`,
      embeds: [embed],
      components: row ? [row] : []
    });
  }
};

// Xử lý nút join voice (đặt trong cùng file)
module.exports.handleButton = async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("join_voice_")) {
    const ownerId = interaction.customId.split("_")[2];
    const owner = await interaction.guild.members.fetch(ownerId);

    if (!owner.voice.channel)
      return interaction.reply({ content: "❌ Chủ lobby không ở trong voice.", ephemeral: true });

    const member = interaction.member;
    if (!member.voice.channel)
      return interaction.reply({ content: "❌ Bạn phải đang ở trong 1 voice khác để join.", ephemeral: true });

    try {
      await member.voice.setChannel(owner.voice.channel.id);
      await interaction.reply({ content: `✅ Bạn đã được chuyển vào **${owner.voice.channel.name}**`, ephemeral: true });
    } catch {
      return interaction.reply({ content: "❌ Bot cần quyền **Move Members** để thực hiện.", ephemeral: true });
    }
  }
};
