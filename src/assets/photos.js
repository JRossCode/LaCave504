const modules = import.meta.glob('./photos/*.{png,jpg,jpeg,webp}', {
    eager: true,
    import: 'default',
});

export const photoList = Object.values(modules);
