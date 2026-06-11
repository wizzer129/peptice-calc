<template>
	<div class="syringe-wrap">
		<svg
			viewBox="0 0 80 220"
			xmlns="http://www.w3.org/2000/svg"
			class="syringe-svg"
		>
			<!-- Needle tip -->
			<polygon points="40,210 36,198 44,198" class="needle-part" />
			<!-- Needle shaft -->
			<rect x="38.5" y="190" width="3" height="10" class="needle-part" />

			<!-- Barrel body -->
			<rect
				x="22"
				y="30"
				width="36"
				height="162"
				rx="4"
				class="barrel-body"
				stroke-width="1.5"
			/>

			<!-- Fill level (animated) -->
			<rect
				x="24"
				:y="fillY"
				width="32"
				:height="fillHeight"
				:class="['fill-level', fillClass]"
				rx="2"
			/>

			<!-- Plunger rod -->
			<rect
				x="36"
				y="2"
				width="8"
				height="34"
				rx="2"
				class="plunger-rod"
			/>
			<!-- Plunger head -->
			<rect
				x="18"
				y="28"
				width="44"
				height="12"
				rx="3"
				class="plunger-head"
				stroke-width="1"
			/>

			<!-- Tick marks -->
			<g class="tick-marks" stroke-width="1">
				<line
					v-for="i in 10"
					:key="i"
					:x1="i % 5 === 0 ? 18 : 22"
					:y1="30 + i * 16"
					:x2="22"
					:y2="30 + i * 16"
				/>
				<line
					v-for="i in 10"
					:key="'r' + i"
					:x1="i % 5 === 0 ? 62 : 58"
					:y1="30 + i * 16"
					:x2="58"
					:y2="30 + i * 16"
				/>

				<!-- Extra emphasis ticks requested: 10, 30, 70, 90 units -->
				<line
					v-for="u in emphasisTicks"
					:key="`e-l-${u}`"
					x1="16"
					:y1="unitToY(u)"
					x2="22"
					:y2="unitToY(u)"
					stroke-width="1.4"
				/>
				<line
					v-for="u in emphasisTicks"
					:key="`e-r-${u}`"
					x1="64"
					:y1="unitToY(u)"
					x2="58"
					:y2="unitToY(u)"
					stroke-width="1.4"
				/>
			</g>

			<!-- Unit labels -->
			<text
				v-for="i in [2, 4, 6, 8, 10]"
				:key="'t' + i"
				x="14"
				:y="30 + i * 16 + 4"
				font-family="Inter, sans-serif"
				font-size="10"
				class="unit-label"
				text-anchor="middle"
			>
				{{ (10 - i) * 10 }}
			</text>

			<!-- Fill level to label connector -->
			<line
				v-if="drawY !== null"
				x1="60"
				:y1="drawY + 1"
				x2="108"
				:y2="drawY + 1"
				:class="`accent-${fillTone}`"
				stroke-width="1.8"
				stroke-linecap="round"
			/>
			<circle
				v-if="drawY !== null"
				cx="62"
				:cy="drawY + 1"
				r="2.6"
				:class="['connector-point', `accent-fill-${fillTone}`]"
			/>

			<!-- Barrel outline overlay -->
			<rect
				x="22"
				y="30"
				width="36"
				height="162"
				rx="4"
				fill="none"
				class="barrel-outline"
				stroke-width="1.5"
			/>
		</svg>

		<!-- Unit marker bubble -->
		<div
			v-if="clampedUnits > 0"
			:class="['unit-bubble', `bubble-${fillTone}`]"
			:style="{ top: bubbleTop + 'px' }"
		>
			{{ clampedUnits.toFixed(0) }} u
		</div>
	</div>
</template>

<script setup>
	import { computed, onBeforeUnmount, ref, watch } from 'vue';

	const props = defineProps({
		units: { type: Number, default: 0 },
		maxUnits: { type: Number, default: 100 },
	});

	const clampedUnits = computed(() =>
		Math.max(0, Math.min(props.units, props.maxUnits))
	);

	const animatedUnits = ref(clampedUnits.value);
	let rafId = null;

	function easeOutCubic(t) {
		return 1 - Math.pow(1 - t, 3);
	}

	function animateUnits(from, to) {
		if (!Number.isFinite(from) || !Number.isFinite(to)) {
			animatedUnits.value = Number.isFinite(to) ? to : 0;
			return;
		}

		if (rafId) cancelAnimationFrame(rafId);

		const duration = 420;
		const start = performance.now();

		const step = (now) => {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeOutCubic(progress);

			animatedUnits.value = from + (to - from) * eased;

			if (progress < 1) {
				rafId = requestAnimationFrame(step);
			} else {
				rafId = null;
			}
		};

		rafId = requestAnimationFrame(step);
	}

	watch(
		clampedUnits,
		(next, prev) => {
			const from = Number.isFinite(prev) ? prev : next;
			animateUnits(from, next);
		},
		{ immediate: true }
	);

	onBeforeUnmount(() => {
		if (rafId) cancelAnimationFrame(rafId);
	});

	const fillFraction = computed(() => animatedUnits.value / props.maxUnits);

	// Barrel spans y=30 to y=192 → height=162
	const BARREL_TOP = 30;
	const BARREL_BTM = 191;
	const BARREL_H = BARREL_BTM - BARREL_TOP;
	const emphasisTicks = [10, 30, 70, 90];

	function unitToY(unit) {
		return BARREL_BTM - (unit / props.maxUnits) * BARREL_H;
	}

	const fillHeight = computed(() =>
		Math.max(0, fillFraction.value * BARREL_H)
	);

	const fillY = computed(() => BARREL_BTM - fillHeight.value);

	const drawY = computed(() => {
		if (animatedUnits.value <= 0) return null;
		return fillY.value;
	});

	const fillClass = computed(() => {
		if (props.units > props.maxUnits) return 'fill-danger';
		if (props.units > props.maxUnits * 0.85) return 'fill-warning';
		return 'fill-success';
	});

	const fillTone = computed(() => {
		if (props.units > props.maxUnits) return 'danger';
		if (props.units > props.maxUnits * 0.85) return 'warning';
		return 'success';
	});

	// For the floating bubble: map drawY (SVG coords 30–192) → pixel coords
	// SVG viewBox height = 220, rendered height ~290px
	const SVG_H = 220;
	const RENDER_H = 290;

	const bubbleTop = computed(() => {
		if (drawY.value === null) return 0;
		return (drawY.value / SVG_H) * RENDER_H - 11.5;
	});
</script>

<style lang="less" scoped>
	@import '../assets/main.less';

	.syringe-wrap {
		position: relative;
		display: inline-block;
	}

	.fill-level {
		transition: fill 0.25s ease;
	}

	.fill-success {
		fill: @teal;
	}

	.fill-warning {
		fill: @amber;
	}

	.fill-danger {
		fill: @red;
	}

	.accent-success {
		stroke: @teal;
	}

	.accent-warning {
		stroke: @amber;
	}

	.accent-danger {
		stroke: @red;
	}

	.accent-fill-success {
		fill: @teal;
	}

	.accent-fill-warning {
		fill: @amber;
	}

	.accent-fill-danger {
		fill: @red;
	}

	.needle-part {
		fill: @text-muted;
	}

	.barrel-body {
		fill: @surface;
		stroke: @border;
	}

	.plunger-rod,
	.plunger-head {
		fill: @border;
	}

	.plunger-head {
		stroke: @text-muted;
	}

	.tick-marks {
		stroke: @border;
	}

	.unit-label {
		fill: @text-muted;
	}

	.barrel-outline {
		stroke: @border;
	}

	.syringe-svg {
		width: 122px;
		height: 290px;
		overflow: visible;
	}

	.unit-bubble {
		position: absolute;
		right: -56px;
		font-family: @sans;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		white-space: nowrap;
		pointer-events: none;
	}

	.bubble-success {
		background: @teal;
		color: @bg;

		&::before {
			content: '';
			position: absolute;
			left: -5px;
			top: 50%;
			transform: translateY(-50%);
			width: 0;
			height: 0;
			border-top: 4px solid transparent;
			border-bottom: 4px solid transparent;
			border-right: 5px solid @teal;
		}
	}

	.bubble-warning {
		background: @amber;
		color: @bg;

		&::before {
			content: '';
			position: absolute;
			left: -5px;
			top: 50%;
			transform: translateY(-50%);
			width: 0;
			height: 0;
			border-top: 4px solid transparent;
			border-bottom: 4px solid transparent;
			border-right: 5px solid @amber;
		}
	}

	.bubble-danger {
		background: @red;
		color: @text;

		&::before {
			content: '';
			position: absolute;
			left: -5px;
			top: 50%;
			transform: translateY(-50%);
			width: 0;
			height: 0;
			border-top: 4px solid transparent;
			border-bottom: 4px solid transparent;
			border-right: 5px solid @red;
		}
	}
</style>
