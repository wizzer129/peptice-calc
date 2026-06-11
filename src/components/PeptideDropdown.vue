<template>
	<div class="dropdown">
		<label class="field-label">{{ label }}</label>
		<div class="select-wrapper">
			<button type="button" class="mobile-trigger" @click="toggleMenu">
				<span class="trigger-label">{{ selectedLabel }}</span>
				<span class="trigger-arrow" :class="{ open: isOpen }">▾</span>
			</button>

			<div v-if="isOpen" class="mobile-menu">
				<button
					type="button"
					class="menu-option"
					@click="pickOption('')"
				>
					Custom / No Preset
				</button>
				<div
					v-for="group in groups"
					:key="group.label"
					class="menu-group"
				>
					<div class="menu-group-label">{{ group.label }}</div>
					<button
						v-for="p in group.peptides"
						:key="p.id"
						type="button"
						class="menu-option"
						:class="{ active: modelValue === p.id }"
						@click="pickOption(p.id)"
					>
						{{ p.name }}
					</button>
				</div>
			</div>

			<span v-else class="select-arrow">▾</span>
		</div>
	</div>
</template>

<script setup>
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

	const props = defineProps({
		modelValue: { type: String, default: '' },
		groups: { type: Array, required: true },
		label: { type: String, default: 'SELECT PEPTIDE' },
	});

	const emit = defineEmits(['update:modelValue', 'change']);

	const isOpen = ref(false);

	const selectedLabel = computed(() => {
		if (!props.modelValue) return '— Custom / No Preset —';
		for (const group of props.groups) {
			const match = group.peptides.find((p) => p.id === props.modelValue);
			if (match) return match.name;
		}
		return '— Custom / No Preset —';
	});

	function pickOption(value) {
		emit('update:modelValue', value);
		emit('change', { target: { value } });
		isOpen.value = false;
	}

	function toggleMenu() {
		isOpen.value = !isOpen.value;
	}

	function handleOutsideClick(event) {
		if (!isOpen.value) return;
		if (!event.target.closest('.select-wrapper')) {
			isOpen.value = false;
		}
	}

	onMounted(() => {
		document.addEventListener('click', handleOutsideClick);
	});

	onBeforeUnmount(() => {
		document.removeEventListener('click', handleOutsideClick);
	});
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
		max-width: 100%;

		@media (min-width: 768px) {
			max-width: 335px;
		}
	}

	.mobile-trigger {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		background: @surface;
		border: 2px solid @border;
		border-radius: @radius;
		color: @text;
		font-family: @sans;
		font-size: 1rem;
		padding: 12px 16px;
		text-align: left;
	}

	.trigger-label {
		min-width: 0;
		flex: 1;
	}

	.trigger-arrow {
		color: @teal;
		transition: transform 0.15s ease;

		&.open {
			transform: rotate(180deg);
		}
	}

	.mobile-menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		right: 0;
		z-index: 20;
		max-height: min(60vh, 420px);
		overflow-x: hidden;
		overflow-y: auto;
		background: @surface;
		border: 1px solid @border;
		border-radius: @radius-lg;
		box-shadow: 0 18px 36px rgba(0, 0, 0, 0.45);
		padding: 8px;
		scrollbar-width: thin;
		scrollbar-color: @teal @surface;

		&::-webkit-scrollbar {
			width: 10px;
		}

		&::-webkit-scrollbar-track {
			background: fade(@bg, 40%);
			border-radius: @radius-lg;
		}

		&::-webkit-scrollbar-thumb {
			background: linear-gradient(
				180deg,
				fade(@teal, 95%),
				fade(@teal, 65%)
			);
			border-radius: 999px;
			border: 2px solid @surface;
		}

		&::-webkit-scrollbar-thumb:hover {
			background: linear-gradient(180deg, @teal, fade(@teal, 80%));
		}
	}

	.menu-group + .menu-group {
		margin-top: 8px;
	}

	.menu-group-label {
		font-family: @mono;
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: @text-muted;
		padding: 8px 10px 6px;
	}

	.menu-option {
		display: block;
		width: 100%;
		border: 0;
		background: transparent;
		color: @text;
		font-family: @sans;
		font-size: 0.95rem;
		padding: 10px 10px;
		text-align: left;
		border-radius: 6px;

		&:hover,
		&.active {
			background: fade(@teal, 14%);
			color: @teal;
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
	}
</style>
