const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comparesimilarity')
        .setDescription('Compares how similar two user IDs are and shows their pfps on a base image if similar.')
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

        if (similarity > 90) {
            const baseImagePath = path.join(__dirname, '../../public/image.png'); // Adjust the path as necessary
            try {
                const baseImage = await loadImage(baseImagePath);
                const imgUrl1 = user1.displayAvatarURL({ format: 'png', size: 128 });
                const imgUrl2 = user2.displayAvatarURL({ format: 'png', size: 128 });
                const images = await Promise.all([
                    axios.get(imgUrl1, { responseType: 'arraybuffer' }), 
                    axios.get(imgUrl2, { responseType: 'arraybuffer' })
                ]);
                const img1 = await loadImage(Buffer.from(images[0].data));
                const img2 = await loadImage(Buffer.from(images[1].data));

                // Create a canvas the size of the base image and draw the base image
                const canvas = createCanvas(baseImage.width, baseImage.height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(baseImage, 0, 0);

                // Draw user pfps on the base image
                ctx.drawImage(img1, 260, 120, 128, 128); // Adjust position as necessary
                ctx.drawImage(img2, baseImage.width - 408, 120, 128, 128); // Adjust position as necessary

                // Convert canvas to a buffer and create a message attachment
                const buffer = canvas.toBuffer('image/png');
                const attachment = new AttachmentBuilder(buffer, { name: 'profile-composite.png' });

                await interaction.reply({ 
                    content: `The similarity between the user IDs is ${similarity.toFixed(2)}%. Round of applause to these great clones:`, 
                    files: [attachment] 
                });
            } catch (error) {
                console.error('Failed to create image:', error);
                await interaction.reply('Failed to process the images.');
            }
        } else {
            await interaction.reply(`The similarity between the user IDs is ${similarity.toFixed(2)}%.`);
        }
    },
};
