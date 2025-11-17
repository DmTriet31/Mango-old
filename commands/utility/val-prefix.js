const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require("discord.js");

// Cooldown 10 giây mỗi user
const cooldown = new Set();

// ID role Valorant
const VALORANT_ROLE_ID = "1376211286563754046";

module.exports = async (message, client) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // Detect prefix +1 → +5
  const match = content.match(/^\+([1-5])\s+(.+)/);
  if (!match) return;

  // Chống spam 10s
  if (cooldown.has(message.author.id)) {
    return message.reply("⏳ **Bạn phải đợi 10 giây trước khi dùng lại!**");
  }
  cooldown.add(message.author.id);
  setTimeout(() => cooldown.delete(message.author.id), 10000);

  // Lấy số người và code/msg
  const need = match[1];
  let msg = match[2];

  // Auto lấy CODE (chỉ số)
  const extractedCode = msg.match(/\d+/)?.[0] || msg;
  msg = extractedCode;

  const member = message.member;
  const voiceChannel = member.voice?.channel;

  let roomName = '❌ Không ở trong voice';
  let slot = '0/0';
  let row = null;

  const embed = new EmbedBuilder()
    .setColor(0xAA00FF)
    .setAuthor({
      name: `${message.author.username}`,
      iconURL: message.author.displayAvatarURL()
    })
    .setFooter({ text: 'Prefix: +1 → +5  |  Ví dụ: +3 123456' })
    .addFields(
      { name: '> [Need]', value: `+${need} players`, inline: true },
      { name: '> [Code]', value: `\`${msg}\``, inline: true }
