import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import InputCard from '../../src/components/InputCard.vue';

describe('InputCard', () => {
	it('mounts without errors', () => {
		const wrapper = shallowMount(InputCard, {
			props: {
				num: '01',
				title: 'Desired Dose',
				hint: 'per injection',
				options: [0.1, 0.25, 0.5],
				unit: 'mg',
				chip: null,
				custom: '',
				customPlaceholder: 'e.g. 0.3',
				customMin: 0.001,
				customStep: 0.001,
				presetValue: null,
				avLabel: 'DOSE',
				displayValue: '–',
			},
		});

		expect(wrapper.exists()).toBe(true);
		wrapper.unmount();
	});
});
