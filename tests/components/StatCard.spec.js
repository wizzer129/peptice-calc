import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import StatCard from '../../src/components/StatCard.vue';

describe('StatCard', () => {
	it('mounts without errors', () => {
		const wrapper = shallowMount(StatCard, {
			props: {
				label: 'PEPTIDE DOSE',
				value: 0.25,
				unit: 'mg',
				sub: '250 mcg',
				highlight: false,
				statusMsg: null,
				statusClass: null,
			},
		});

		expect(wrapper.exists()).toBe(true);
		wrapper.unmount();
	});
});
