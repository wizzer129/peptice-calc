import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppHeader from '../../src/components/AppHeader.vue';

describe('AppHeader', () => {
	it('mounts without errors', () => {
		const wrapper = shallowMount(AppHeader);

		expect(wrapper.exists()).toBe(true);
		wrapper.unmount();
	});
});
