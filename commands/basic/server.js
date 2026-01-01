const { SlashCommandBuilder } = require('@discordjs/builders');
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
} = require('discord.js');
const lang = require('../../events/loadLanguage');
const cmdIcons = require('../../UI/icons/commandicons');
function chunkArray(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription(lang.serverInfoDescription)
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Hiển thị thông tin chi tiết của server kèm phân trang.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('icon')
                .setDescription('Hiển thị icon của server.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('banner')
                .setDescription('Hiển thị banner của server.')
        ),
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        await interaction.deferReply();

        const server = interaction.guild;
        if (!server) return interaction.editReply(lang.serverInfoError);

        // Kiểm tra subcommand được sử dụng
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'info') {
            try {
                const owner = await server.fetchOwner();
                const emojis = server.emojis.cache;
                const roles = server.roles.cache.filter(role => role.id !== server.id);
                const channels = server.channels.cache;
        
                const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
                const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
                const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;
                const stageChannels = channels.filter(c => c.type === ChannelType.GuildStageVoice).size;
                const totalChannels = textChannels + voiceChannels + stageChannels + categories;
        
                const boostCount = server.premiumSubscriptionCount || 0;
                const boostLevel = server.premiumTier || 0;
        
                // === TRANG 1: Thông tin cơ bản ===
                const baseEmbed = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setAuthor({ name: 'Thông tin Server', iconURL: server.iconURL({ dynamic: true }) })
                    .setThumbnail(server.iconURL({ dynamic: true, size: 1024 }))
                    .addFields([
                        { name: '📛 Tên Server', value: `\`${server.name}\``, inline: true },
                        { name: '👑 Chủ Server', value: `<@${owner.id}>`, inline: true },
                        { name: '🆔 ID Server', value: `\`${server.id}\``, inline: true },
                        { name: '👥 Thành viên', value: `\`${server.memberCount}\``, inline: true },
                        { name: '🤖 Bot', value: `\`${server.members.cache.filter(m => m.user.bot).size}\``, inline: true },
                        { name: '🚀 Boost', value: `\`${boostCount} (Cấp ${boostLevel})\``, inline: true },
                        { name: '📂 Danh mục', value: `\`${categories}\``, inline: true },
                        { name: '💬 Kênh chữ', value: `\`${textChannels}\``, inline: true },
                        { name: '🔊 Kênh thoại', value: `\`${voiceChannels}\``, inline: true },
                        { name: '🎭 Vai trò', value: `\`${roles.size}\``, inline: true },
                        { name: '😀 Emoji', value: `\`${emojis.size}\``, inline: true },
                        { name: '🆕 Ngày tạo', value: `<t:${Math.floor(server.createdTimestamp / 1000)}:F>`, inline: false },
                    ])
                    .setTimestamp();
        
                // === TRANG 2: Vai trò ===
                const roleEmbed = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setTitle('🎭 Vai trò')
                    .setDescription(roles.size > 0 ? roles.map(role => `<@&${role.id}>`).join(', ') : 'Không có vai trò nào.');
        
                // === TRANG 3+: Emoji, chia mỗi trang 25 cái ===
                const emojiChunks = chunkArray(emojis.map(e => e.toString()), 25);
                const emojiEmbeds = emojiChunks.map((chunk, i) =>
                    new EmbedBuilder()
                        .setColor('#FFFFFF')
                        .setTitle(`😀 Emoji (Trang ${i + 1})`)
                        .setDescription(chunk.join(' '))
                );
        
                // Gộp tất cả trang
                const embeds = [baseEmbed, roleEmbed, ...emojiEmbeds];
        
                // Nút điều hướng
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('previous').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Secondary)
                );
        
                let currentPage = 0;
                await interaction.editReply({ embeds: [embeds[currentPage]], components: [row] });
        
                const filter = i => ['previous', 'next'].includes(i.customId) && i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        
                collector.on('collect', async i => {
                    if (i.customId === 'previous') currentPage--;
                    if (i.customId === 'next') currentPage++;
        
                    row.components[0].setDisabled(currentPage === 0);
                    row.components[1].setDisabled(currentPage === embeds.length - 1);
        
                    await i.update({ embeds: [embeds[currentPage]], components: [row] });
                });
        
                collector.on('end', async () => {
                    try {
                        await interaction.editReply({ components: [] });
                    } catch (err) {
                        console.error('Không thể xoá nút sau khi collector kết thúc:', err);
                    }
                });
        
            } catch (error) {
                console.error('Lỗi khi lấy thông tin server:', error);
                return interaction.editReply({ content: '❌ Không thể lấy thông tin server.' });
            }
        }
        else if (subcommand === 'icon') {
            // Tạo embed hiển thị icon server
            const iconURL = server.iconURL({ format: 'png', dynamic: true, size: 1024 });
            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(lang.serverIconTitle)
                .setImage(iconURL)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } 
        else if (subcommand === 'banner') {
            // Tạo embed hiển thị banner server (nếu có)
            const bannerURL = server.bannerURL({ format: 'png', dynamic: true, size: 1024 });
            if (!bannerURL) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(lang.serverNoBanner);
                return await interaction.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(lang.serverBannerTitle)
                .setImage(bannerURL)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Cảnh báo!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/hZM6zS9Km7"
            })
            .setDescription('- Lệnh này chỉ sử dụng được bằng slash command!\n- Vui lòng dùng `/server`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } 
    },
};
