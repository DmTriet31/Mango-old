const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events,
} = require("discord.js");

module.exports = (client) => {
  // Đăng ký lệnh /resignpanel
  client.commands.set("resignpanel", {
    data: new SlashCommandBuilder()
      .setName("resignpanel")
      .setDescription("Tạo bảng từ chức role trong kênh hiện tại"),
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("🎭 Tự từ chức Role")
        .setDescription("Bấm nút bên dưới để xem role bạn đang có và chọn role muốn bỏ.")
        .setColor("Red");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("show_resign_roles")
          .setLabel("Xem role của tôi")
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    },
  });

  // Lắng nghe interaction trong chính file này
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    // Khi bấm "Xem role của tôi"
    if (interaction.customId === "show_resign_roles") {
      const member = interaction.member;
      const roles = member.roles.cache.filter(r => r.id !== interaction.guild.id); // bỏ @everyone

      if (roles.size === 0) {
        return interaction.reply({
          content: "❌ Bạn không có role nào để từ chức.",
          ephemeral: true,
        });
      }

      const rows = [];
      let currentRow = new ActionRowBuilder();
      let i = 0;

      roles.forEach((role) => {
        if (i % 5 === 0 && i !== 0) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder();
        }
        currentRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`resign_${role.id}`)
            .setLabel(role.name)
            .setStyle(ButtonStyle.Danger)
        );
        i++;
      });
      rows.push(currentRow);

      await interaction.reply({
        content: "Chọn role mà bạn muốn từ chức:",
        components: rows,
        ephemeral: true,
      });
    }

    // Khi bấm nút resign cụ thể
    if (interaction.customId.startsWith("resign_")) {
      const roleId = interaction.customId.split("_")[1];
      const member = interaction.member;

      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        await interaction.reply({
          content: `✅ Bạn đã từ chức khỏi role <@&${roleId}>.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `❌ Bạn không có role này.`,
          ephemeral: true,
        });
      }
    }
  });
};
