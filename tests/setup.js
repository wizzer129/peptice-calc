import { afterEach, vi } from 'vitest';

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});

window.requestAnimationFrame = vi.fn(() => 1);
window.cancelAnimationFrame = vi.fn();
