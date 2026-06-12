import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const domElement = document.createElement('canvas');

const dispose = vi.fn();
const render = vi.fn();
const setSize = vi.fn();
const setPixelRatio = vi.fn();
const setClearColor = vi.fn();
const addEventListener = vi.fn();
const removeEventListener = vi.fn();

vi.mock('three', () => {
	class Scene {
		add() {}
		remove() {}
	}

	class PerspectiveCamera {
		position = { set() {} };
		aspect = 1;
		updateProjectionMatrix() {}
	}

	class WebGLRenderer {
		domElement = domElement;
		setPixelRatio(value) {
			setPixelRatio(value);
		}
		setClearColor(value, alpha) {
			setClearColor(value, alpha);
		}
		setSize(width, height) {
			setSize(width, height);
		}
		render(scene, camera) {
			render(scene, camera);
		}
		dispose() {
			dispose();
		}
	}

	class CircleGeometry {}
	class EdgesGeometry {}
	class Group {
		scale = { setScalar() {} };
		rotation = { z: 0 };
		position = { set() {} };
		add() {}
		traverse(callback) {
			callback({ geometry: undefined, material: undefined });
		}
	}
	class MeshBasicMaterial {
		dispose() {}
	}
	class LineBasicMaterial {
		dispose() {}
	}
	class Mesh {
		constructor(geometry, material) {
			this.geometry = geometry;
			this.material = material;
		}
	}
	class LineSegments {
		constructor(geometry, material) {
			this.geometry = geometry;
			this.material = material;
		}
	}
	class Clock {
		getElapsedTime() {
			return 0;
		}
	}

	return {
		Scene,
		PerspectiveCamera,
		WebGLRenderer,
		CircleGeometry,
		EdgesGeometry,
		Group,
		MeshBasicMaterial,
		LineBasicMaterial,
		Mesh,
		LineSegments,
		Clock,
		SRGBColorSpace: 'srgb',
	};
});

import FluidHexBackground from '../../src/components/FluidHexBackground.vue';

describe('FluidHexBackground', () => {
	beforeEach(() => {
		addEventListener.mockClear();
		removeEventListener.mockClear();
		setPixelRatio.mockClear();
		setClearColor.mockClear();
		setSize.mockClear();
		render.mockClear();
		dispose.mockClear();
		window.requestAnimationFrame = vi.fn(() => 1);
		window.cancelAnimationFrame = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('mounts without errors', () => {
		const wrapper = shallowMount(FluidHexBackground);

		expect(wrapper.exists()).toBe(true);
		wrapper.unmount();
	});
});
