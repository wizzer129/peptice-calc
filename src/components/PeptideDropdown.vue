<template>
	<div class="dropdown">
		<label class="field-label">{{ label }}</label>
		<div class="select-wrapper">
			<select
				:value="modelValue"
				class="peptide-select"
				@change="onChange"
			>
				<option value="">— Custom / No Preset —</option>
				<optgroup
					v-for="group in groups"
					:key="group.label"
					:label="group.label"
				>
					<option
						v-for="p in group.peptides"
						:key="p.id"
						:value="p.id"
					>
						{{ p.name }}
					</option>
				</optgroup>
			</select>
			<span class="select-arrow">▾</span>
		</div>
	</div>
</template>

<script setup>
	const props = defineProps({
		modelValue: { type: String, default: '' },
		groups: { type: Array, required: true },
		label: { type: String, default: 'SELECT PEPTIDE' },
	});

	const emit = defineEmits(['update:modelValue', 'change']);

	function onChange(event) {
		emit('update:modelValue', event.target.value);
		emit('change', event);
	}
</script>

<style lang="less" scoped>
	@import '../assets/main.less';

	.dropdown {
		width: 100%;
	}

	.field-label {
		display: block;
		font-family: @mono;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		color: @text;
		margin-bottom: 8px;
	}

	.select-wrapper {
		position: relative;
		width: 100%;
		min-width: 0;

		@media (min-width: 768px) {
			max-width: 335px;
		}
	}

	.peptide-select {
		display: block;
		width: 100%;
		appearance: none;
		background: @surface;
		border: 2px solid @border;
		border-radius: @radius;
		color: @text;
		font-family: @sans;
		font-size: 1rem;
		padding: 12px 40px 12px 16px;
		cursor: pointer;
		outline: none;
		box-shadow: none;
		transition: border-color 0.15s;

		&:focus {
			border-color: @teal;
			outline: none;
			box-shadow: none;
		}

		&:focus-visible {
			border-color: @teal;
			outline: none;
			box-shadow: none;
		}

		&:hover {
			border-color: fade(@teal, 100%);
		}

		option,
		optgroup {
			background: @surface;
			color: @text;
		}

		@media (max-width: 767px) {
			appearance: auto;
			-webkit-appearance: menulist;
			padding-right: 12px;
		}
	}

	.select-arrow {
		position: absolute;
		right: 14px;
		top: 50%;
		transform: translateY(-50%);
		color: @teal;
		font-size: 0.9rem;
		pointer-events: none;

		@media (max-width: 767px) {
			display: none;
		}
	}
</style>
