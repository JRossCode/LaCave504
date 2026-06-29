const modules = import.meta.glob('./photos/*.{avif,webp,png,jpg,jpeg}', {
    eager: true,
    import: 'default',
});

export const photoList = Object.values(modules);
