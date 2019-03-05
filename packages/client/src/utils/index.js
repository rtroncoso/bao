export const checkScreen = (w, h, cw, ch) => w !== cw || h !== ch;
export const randomRange = (m, x) => Math.random() * (x - m) + m;
export const round = (value, digits = 2) => parseFloat(Number(value).toFixed(digits));
export const distance = (p1, p2) => Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
export const isNear = (p1, p2, r = 30) => distance(p1, p2) < r;
export const diff = (a, b) => a.filter(i => b.indexOf(i) < 0);
export const polygon = a => a.flatMap(p => [p.x, p.y]);
