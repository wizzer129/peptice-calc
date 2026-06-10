<template>
  <div class="syringe-wrap">
    <svg
      viewBox="0 0 80 220"
      xmlns="http://www.w3.org/2000/svg"
      class="syringe-svg"
    >
      <!-- Needle tip -->
      <polygon
        points="40,210 36,198 44,198"
        fill="#8b949e"
      />
      <!-- Needle shaft -->
      <rect
        x="38.5"
        y="190"
        width="3"
        height="10"
        fill="#8b949e"
      />

      <!-- Barrel body -->
      <rect
        x="22"
        y="30"
        width="36"
        height="162"
        rx="4"
        fill="#161b22"
        stroke="#2d3748"
        stroke-width="1.5"
      />

      <!-- Fill level (animated) -->
      <rect
        x="24"
        y="192"
        width="32"
        :height="fillHeight"
        :transform="`translate(0, ${-fillHeight})`"
        :fill="fillColor"
        rx="2"
        style="
					transition:
						height 0.4s ease,
						fill 0.3s ease;
				"
      />

      <!-- Plunger rod -->
      <rect
        x="36"
        y="2"
        width="8"
        height="34"
        rx="2"
        fill="#2d3748"
      />
      <!-- Plunger head -->
      <rect
        x="18"
        y="28"
        width="44"
        height="12"
        rx="3"
        fill="#2d3748"
        stroke="#8b949e"
        stroke-width="1"
      />

      <!-- Tick marks -->
      <g
        stroke="#2d3748"
        stroke-width="1"
      >
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
        font-family="IBM Plex Mono, monospace"
        font-size="7"
        fill="#8b949e"
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
        stroke="#00d4b8"
        stroke-width="1.5"
        stroke-dasharray="3 2"
      />

      <!-- Barrel outline overlay -->
      <rect
        x="22"
        y="30"
        width="36"
        height="162"
        rx="4"
        fill="none"
        stroke="#2d3748"
        stroke-width="1.5"
      />
    </svg>

    <!-- Unit marker bubble -->
    <div
      v-if="clampedUnits > 0"
      class="unit-bubble"
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

const fillColor = computed(() => {
    if (props.units > props.maxUnits) return '#ff4f4f';
    if (props.units > props.maxUnits * 0.85) return '#f5a623';
    return '#00d4b8';
});

// For the floating bubble: map drawY (SVG coords 30–192) → pixel coords
// SVG viewBox height = 220, rendered height ~180px
const SVG_H = 220;
const RENDER_H = 180;

const bubbleTop = computed(() => {
    if (drawY.value === null) return 0;
    return (drawY.value / SVG_H) * RENDER_H - 10;
});
</script>

<style lang="less" scoped>
.syringe-wrap {
	position: relative;
	display: inline-block;
}

.syringe-svg {
	width: 80px;
	height: 180px;
}

.unit-bubble {
	position: absolute;
	right: -48px;
	background: #00d4b8;
	color: #0d1117;
	font-family: 'IBM Plex Mono', monospace;
	font-size: 0.68rem;
	font-weight: 600;
	padding: 2px 6px;
	border-radius: 4px;
	white-space: nowrap;
	pointer-events: none;

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
		border-right: 5px solid #00d4b8;
	}
}
</style>
