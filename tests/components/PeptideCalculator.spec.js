import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import PeptideCalculator from '../../src/components/PeptideCalculator.vue';

describe('PeptideCalculator', () => {
	it('mounts without errors', () => {
		const wrapper = shallowMount(PeptideCalculator);

		expect(wrapper.exists()).toBe(true);
		wrapper.unmount();
	});
});
