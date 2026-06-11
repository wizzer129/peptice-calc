<template>
	<div class="input-card">
		<div class="card-header">
			<span class="card-num">{{ num }}</span>
			<div>
				<h3 class="card-title">
					{{ title }}
				</h3>
				<p class="card-hint">
					{{ hint }}
				</p>
			</div>
		</div>

		<div class="chip-group">
			<button
				v-for="v in options"
				:key="v"
				class="chip"
				:class="{
					active: chip === v,
					preset: presetValue === v,
				}"
				@click="$emit('update:chip', v)"
			>
				{{ v }}{{ unit
				}}<span
					v-if="presetValue === v"
					class="rec-dot"
					title="Preset default"
				>★</span>
			</button>
		</div>

		<div class="input-section">
			<div class="custom-row">
				<label class="custom-label">Custom ({{ unit }})</label>
				<input
					:value="custom"
					type="number"
					class="custom-input"
					:placeholder="customPlaceholder"
					:min="customMin"
					:step="customStep"
					@input="$emit('update:custom', $event.target.value)"
				>
			</div>

			<div class="active-val">
				<span class="av-label">{{ avLabel }}</span>
				<span class="av-num">{{ displayValue
				}}<span class="av-unit">{{ unit }}</span></span>
				<span
					v-if="mcg"
					class="av-mcg"
				>= {{ mcg }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
	defineProps({
		num: { type: String, required: true },
		title: { type: String, required: true },
		hint: { type: String, required: true },
		options: { type: Array, required: true },
		unit: { type: String, required: true },
		chip: { type: Number, default: null },
		custom: { type: String, default: '' },
		customPlaceholder: { type: String, default: '' },
		customMin: { type: [Number, String], default: 0 },
		customStep: { type: [Number, String], default: 1 },
		presetValue: { type: Number, default: null },
		avLabel: { type: String, required: true },
		displayValue: { type: [String, Number], required: true },
		mcg: { type: String, default: null },
	});

	defineEmits(['update:chip', 'update:custom']);
</script>

<style lang="less" scoped>
	@import '../assets/main.less';

	.input-card {
		background: @surface;
		border: 2px solid @border;
		border-radius: @radius-lg;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		transition: border-color 0.2s;

		&:hover {
			border-color: fade(@teal, 90%);
		}
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.card-num {
		font-family: @mono;
		font-size: 1.5rem;
		font-weight: 500;
		color: @teal;
		letter-spacing: 0.05em;
	}

	.card-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: @text;
		line-height: 1.2;
	}

	.card-hint {
		font-size: 0.75rem;
		color: @text-muted;
		margin-top: auto;
	}

	.chip-group {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.input-section {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.chip {
		background: @surface2;
		border: 1px solid @border;
		color: @text;
		border-radius: 6px;
		padding: 5px 10px;
		font-family: @sans;
		font-size: 0.78rem;
		cursor: pointer;
		transition: all 0.12s;
		position: relative;

		&:hover {
			border-color: @teal;
			color: @teal;
		}

		&.active {
			background: fade(@teal, 15%);
			border-color: @teal;
			color: @teal;
			font-weight: 600;
		}

		&.preset:not(.active) {
			border-color: fade(@amber, 40%);
			color: @amber;
		}
	}

	.rec-dot {
		font-size: 0.6rem;
		vertical-align: super;
		margin-left: 2px;
		color: @amber;
	}

	.custom-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
	}

	.custom-label {
		font-size: 0.72rem;
		color: @text;
		letter-spacing: 0.06em;
		flex-shrink: 0;
	}

	.custom-input {
		flex: 1;
		background: @surface2;
		border: 1px solid @border;
		border-radius: 6px;
		color: @text;
		font-family: @mono;
		font-size: 0.85rem;
		padding: 7px 10px;
		outline: none;
		box-shadow: none;
		transition: border-color 0.15s;

		&:focus {
			border-color: @teal;
			outline: none;
			box-shadow: none;
		}

		&:focus-visible {
			outline: none;
			box-shadow: none;
		}

		&::placeholder {
			color: fade(@text-muted, 50%);
		}

		&::-webkit-outer-spin-button,
		&::-webkit-inner-spin-button {
			-webkit-appearance: none;
		}
	}

	.active-val {
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding-top: 8px;
		border-top: 1px solid @border;
	}

	.av-label {
		font-family: @mono;
		font-size: 0.85rem;
		color: @text;
		letter-spacing: 0.1em;
		font-weight: 600;
	}

	.av-num {
		font-family: @mono;
		font-size: 1.4rem;
		font-weight: 500;
		color: @teal;
		line-height: 1;
	}

	.av-unit {
		font-size: 0.95rem;
		color: @text;
		margin-left: 2px;
	}

	.av-mcg {
		font-family: @sans;
		font-size: 0.95rem;
		color: @text;
		margin-left: 4px;
	}
</style>
