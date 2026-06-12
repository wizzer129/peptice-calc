import { shallowMount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import SplashScreen from '../../src/components/SplashScreen.vue';

describe('SplashScreen', () => {
	it('mounts without errors', () => {
		vi.useFakeTimers();
		const wrapper = shallowMount(SplashScreen);

		expect(wrapper.exists()).toBe(true);
		wrapper.unmount();
		vi.runOnlyPendingTimers();
	});
});
