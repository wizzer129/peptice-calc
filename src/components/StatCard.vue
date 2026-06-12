<template>
	<div class="stat-card" :class="[{ highlight }, statusClass]">
		<span class="stat-label">{{ label }}</span>
		<span class="stat-value"
			>{{ value }} <span class="stat-unit">{{ unit }}</span></span
		>
		<span class="stat-mcg">{{ sub }}</span>
		<div v-if="statusMsg" class="status-badge" :class="statusClass">
			{{ statusMsg }}
		</div>
	</div>
</template>

<script setup>
	defineProps({
		label: { type: String, required: true },
		value: { type: [String, Number], required: true },
		unit: { type: String, required: true },
		sub: { type: String, default: '' },
		highlight: { type: Boolean, default: false },
		statusMsg: { type: String, default: null },
		statusClass: { type: String, default: null },
	});
</script>

<style lang="less" scoped>
	@import '../assets/main.less';

	.stat-card {
		background: @surface;
		border: 2px solid @border;
		border-radius: @radius-lg;
		padding: 22px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 12px;
		height: 100%;

		&:hover:not(.highlight) {
			border-color: fade(@teal, 90%);
		}

		&.highlight {
			border-color: fade(@teal, 100%);
			background: fade(@teal, 35%);
		}

		&.warn {
			border-color: fade(@amber, 40%);
		}

		&.error {
			border-color: fade(@red, 40%);
		}
	}

	.stat-label {
		font-family: @mono;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: @text;
	}

	.stat-value {
		margin-top: auto;
		font-family: @mono;
		font-size: 2.55rem;
		font-weight: 600;
		color: @text;
		line-height: 1;
	}

	.stat-unit {
		font-size: 1rem;
		color: @text-muted;
		font-weight: 400;
	}

	.stat-mcg {
		font-family: @mono;
		font-size: 1rem;
		line-height: 1.4;
		color: @text-muted;
	}

	.status-badge {
		margin-top: auto;
		display: inline-block;
		padding: 5px 9px;
		border-radius: 4px;
		font-size: 0.74rem;
		font-weight: 500;

		&.warn {
			background: fade(@amber, 15%);
			color: @amber;
		}

		&.error {
			background: fade(@red, 15%);
			color: @red;
		}
	}
</style>
