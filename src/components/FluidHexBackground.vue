<template>
	<div
		ref="mountEl"
		class="fluid-bg"
		aria-hidden="true"
	/>
</template>

<script setup>
	import { onMounted, onBeforeUnmount, ref } from 'vue';
	import * as THREE from 'three';

	const mountEl = ref(null);

	let renderer;
	let scene;
	let camera;
	let frameId;
	let startTime = 0;
	const cells = [];

	function setupScene() {
		const el = mountEl.value;
		if (!el) return;

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
		camera.position.set(0, 0, 28);

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
		renderer.setClearColor(0x0a1018, 0.92);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		el.appendChild(renderer.domElement);

		const hexGeometry = new THREE.CircleGeometry(0.48, 6);
		const edgeGeometry = new THREE.EdgesGeometry(hexGeometry);

		const count = window.innerWidth < 900 ? 30 : 58;
		for (let i = 0; i < count; i += 1) {
			const layer = new THREE.Group();

			const fillMat = new THREE.MeshBasicMaterial({
				color: 0x00d4b8,
				transparent: true,
				opacity: 0.08 + Math.random() * 0.06,
			});
			const fill = new THREE.Mesh(hexGeometry, fillMat);

			const edgeMat = new THREE.LineBasicMaterial({
				color: 0x00d4b8,
				transparent: true,
				opacity: 0.2 + Math.random() * 0.3,
			});
			const edge = new THREE.LineSegments(edgeGeometry, edgeMat);

			const scale = 0.7 + Math.random() * 1.8;
			layer.scale.setScalar(scale);
			layer.rotation.z = Math.PI / 6;
			layer.add(fill);
			layer.add(edge);
			scene.add(layer);

			cells.push({
				layer,
				baseX: (Math.random() - 0.5) * 34,
				baseY: (Math.random() - 0.5) * 20,
				depth: -8 + Math.random() * 16,
				driftX: 0.35 + Math.random() * 1.0,
				driftY: 0.35 + Math.random() * 1.0,
				offset: Math.random() * Math.PI * 2,
				spin: (Math.random() - 0.5) * 0.24,
				bob: 0.25 + Math.random() * 0.55,
			});
		}

		startTime = performance.now();
		resize();
		animate();
	}

	function resize() {
		if (!renderer || !camera || !mountEl.value) return;
		const width = mountEl.value.clientWidth;
		const height = mountEl.value.clientHeight;
		if (!width || !height) return;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}

	function animate(now = performance.now()) {
		if (!renderer || !scene || !camera || !startTime) return;

		const t = (now - startTime) / 1000;

		for (const cell of cells) {
			const xFlow = Math.sin(t * cell.driftX + cell.offset) * 1.8;
			const yFlow = Math.cos(t * cell.driftY + cell.offset * 0.7) * 1.1;
			const sway = Math.sin(t * 0.5 + cell.offset) * cell.bob;

			cell.layer.position.set(
				cell.baseX + xFlow,
				cell.baseY + yFlow + sway,
				cell.depth,
			);
			cell.layer.rotation.z += cell.spin * 0.0025;
		}

		renderer.render(scene, camera);
		frameId = window.requestAnimationFrame(animate);
	}

	function cleanup() {
		if (frameId) window.cancelAnimationFrame(frameId);
		window.removeEventListener('resize', resize);

		for (const cell of cells) {
			cell.layer.traverse((obj) => {
				if (obj.geometry) obj.geometry.dispose();
				if (obj.material) {
					if (Array.isArray(obj.material)) {
						obj.material.forEach((m) => m.dispose());
					} else {
						obj.material.dispose();
					}
				}
			});
			scene.remove(cell.layer);
		}
		cells.length = 0;

		if (renderer) {
			renderer.dispose();
			if (mountEl.value?.contains(renderer.domElement)) {
				mountEl.value.removeChild(renderer.domElement);
			}
		}

		renderer = undefined;
		scene = undefined;
		camera = undefined;
		startTime = 0;
	}

	onMounted(() => {
		setupScene();
		window.addEventListener('resize', resize, { passive: true });
	});

	onBeforeUnmount(() => {
		cleanup();
	});
</script>

<style scoped>
	.fluid-bg {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.fluid-bg canvas {
		display: block;
		width: 100%;
		height: 100%;
		opacity: 1;
	}
</style>
