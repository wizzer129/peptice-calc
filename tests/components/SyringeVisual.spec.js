import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SyringeVisual from '../../src/components/SyringeVisual.vue';

describe('SyringeVisual', () => {
	it('mounts without errors', () => {
		const wrapper = shallowMount(SyringeVisual, {
			props: {
				units: 25,
				maxUnits: 100,
			},
		});

		expect(wrapper.exists()).toBe(true);
		wrapper.unmount();
	});
});
