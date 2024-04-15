const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comparesimilarity')
        .setDescription('Compares how similar two user IDs are.')
        .addUserOption(option => option.setName('user1').setDescription('First user').setRequired(true))
        .addUserOption(option => option.setName('user2').setDescription('Second user').setRequired(true)),
    async execute(interaction) {
        const user1 = interaction.options.getUser('user1');
        const user2 = interaction.options.getUser('user2');

        const id1 = BigInt(user1.id);
        const id2 = BigInt(user2.id);

        // Calculate the relative difference
        const maxId = id1 > id2 ? id1 : id2;
        const minId = id1 < id2 ? id1 : id2;
        const difference = maxId - minId;
        const similarity = 100 - (Number(difference) / Number(maxId) * 100);

        await interaction.reply(`The similarity between the user's ${user1} and ${user2} IDs is ${similarity.toFixed(2)}%.`);
    },
};
