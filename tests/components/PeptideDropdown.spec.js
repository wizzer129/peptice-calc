import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import PeptideDropdown from '../../src/components/PeptideDropdown.vue';

describe('PeptideDropdown', () => {
	it('mounts without errors', () => {
		const wrapper = shallowMount(PeptideDropdown, {
			props: {
				groups: [
					{
						label: 'Test Group',
						peptides: [{ id: 'test', name: 'Test Peptide' }],
					},
				],
			},
		});

		expect(wrapper.exists()).toBe(true);
		wrapper.unmount();
	});
});
