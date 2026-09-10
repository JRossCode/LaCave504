const modules = import.meta.glob('./photos/*.{avif,webp,png,jpg,jpeg}', {
    eager: true,
    import: 'default',
});

// iPhone names its exports sequentially (IMG_3122, IMG_3164, …), so the number
// is a reliable stand-in for the shooting date: highest first = newest first.
// Files without such a number carry no date info and go at the end.
const seq = (path) => {
    const match = path.match(/IMG[_ ]?(\d+)/i);
    return match ? Number(match[1]) : -1;
};

export const photoList = Object.keys(modules)
    .sort((a, b) => seq(b) - seq(a))
    .map((path) => modules[path]);
