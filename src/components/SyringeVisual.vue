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
				y="192"
				width="32"
				:height="fillHeight"
				:transform="`translate(0, ${-fillHeight})`"
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
			</g>

			<!-- Unit labels -->
			<text
				v-for="i in [2, 4, 6, 8, 10]"
				:key="'t' + i"
				x="14"
				:y="30 + i * 16 + 4"
				font-family="Inter, sans-serif"
				font-size="8"
				class="unit-label"
				text-anchor="middle"
			>
				{{ (10 - i) * 10 }}
			</text>

			<!-- Draw line indicator -->
			<line
				v-if="drawY !== null"
				x1="20"
				:y1="drawY"
				x2="60"
				:y2="drawY"
				:class="['draw-line', `accent-${fillTone}`]"
				stroke-width="1.5"
				stroke-dasharray="3 2"
			/>

			<!-- Fill level to label connector -->
			<line
				v-if="drawY !== null"
				x1="60"
				:y1="drawY + 1"
				x2="108"
				:y2="drawY + 1"
				:class="['connector-line', `accent-${fillTone}`]"
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
			{{ clampedUnits.toFixed(0) }}u
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';

	const props = defineProps({
		units: { type: Number, default: 0 },
		maxUnits: { type: Number, default: 100 },
	});

	const clampedUnits = computed(() => Math.min(props.units, props.maxUnits));
	const fillFraction = computed(() => clampedUnits.value / props.maxUnits);

	// Barrel spans y=30 to y=192 → height=162
	const BARREL_TOP = 30;
	const BARREL_BTM = 192;
	const BARREL_H = BARREL_BTM - BARREL_TOP;

	const fillHeight = computed(() => fillFraction.value * BARREL_H);

	const drawY = computed(() => {
		if (!props.units || props.units <= 0) return null;
		return BARREL_BTM - fillFraction.value * BARREL_H;
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
	// SVG viewBox height = 220, rendered height ~240px
	const SVG_H = 220;
	const RENDER_H = 240;

	const bubbleTop = computed(() => {
		if (drawY.value === null) return 0;
		return (drawY.value / SVG_H) * RENDER_H - 10;
	});
</script>

<style lang="less" scoped>
	@import '../assets/main.less';

	.syringe-wrap {
		position: relative;
		display: inline-block;
	}

	.fill-level {
		transition:
			height 0.4s ease,
			fill 0.3s ease;
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
		width: 110px;
		height: 240px;
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
