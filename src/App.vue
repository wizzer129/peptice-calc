<template>
	<SplashScreen
		v-if="showSplash"
		@fade-start="handleSplashFadeStart"
		@complete="handleSplashComplete"
	/>
	<div :class="{ 'app-content': true, 'is-visible': isContentVisible }">
		<PeptideCalculator :is-content-visible="isContentVisible" />
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import SplashScreen from './components/SplashScreen.vue';
	import PeptideCalculator from './components/PeptideCalculator.vue';

	const showSplash = ref(true);
	const isContentVisible = ref(false);

	function handleSplashFadeStart() {
		isContentVisible.value = true;
	}

	function handleSplashComplete() {
		showSplash.value = false;
	}
</script>

<style scoped>
	.app-content {
		opacity: 0.7;
		transition: opacity 560ms ease;
	}

	.app-content.is-visible {
		opacity: 1;
	}
</style>
