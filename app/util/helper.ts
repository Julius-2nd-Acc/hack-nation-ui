// Returns a color string for a duration (in seconds) and a base color (as [r,g,b,a])
export function getDurationColor(seconds: number, base: [number, number, number, number]): string {
	// 0s = base, 5s = yellow, 10s = red
	const t = Math.max(0, Math.min(1, seconds / 10));
	let r, g, b, a;
	if (t <= 0.5) {
		// base to yellow (255,255,0)
		const t2 = t / 0.5;
		r = base[0] + (255 - base[0]) * t2;
		g = base[1] + (255 - base[1]) * t2;
		b = base[2] + (0 - base[2]) * t2;
		a = base[3];
	} else {
		// yellow to red (255,255,0) to (255,0,0)
		const t2 = (t - 0.5) / 0.5;
		r = 255;
		g = 255 + (0 - 255) * t2;
		b = 0;
		a = base[3];
	}
	return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}
