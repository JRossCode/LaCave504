const images = require.context(
    "./photos",
    false,
    /\.(png|jpe?g|webp)$/i
);

export const photoList = images.keys().map(images);