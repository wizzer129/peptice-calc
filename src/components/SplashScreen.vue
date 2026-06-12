<template>
	<div class="splash" :class="{ 'is-fading': isFading }" aria-hidden="true">
		<div class="splash__center">
			<svg class="splash__hex" viewBox="0 0 120 120" role="presentation">
				<polygon
					points="60,8 105,34 105,86 60,112 15,86 15,34"
					class="splash__hex-stroke"
				/>
			</svg>
		</div>
	</div>
</template>

<script setup>
	import { onBeforeUnmount, onMounted, ref } from 'vue';

	const emit = defineEmits(['fade-start', 'complete']);

	const isFading = ref(false);
	let fadeTimer;
	let completeTimer;

	onMounted(() => {
		// Let the hex animation lead, then begin crossfade with app content.
		fadeTimer = window.setTimeout(() => {
			isFading.value = true;
			emit('fade-start');
		}, 1000);
		completeTimer = window.setTimeout(() => {
			emit('complete');
		}, 1250);
	});

	onBeforeUnmount(() => {
		window.clearTimeout(fadeTimer);
		window.clearTimeout(completeTimer);
	});
</script>

<style scoped>
	.splash {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 30% 20%, rgba(0, 212, 184, 0.09), transparent 50%),
			radial-gradient(circle at 75% 80%, rgba(0, 212, 184, 0.06), transparent 50%);
		backdrop-filter: blur(1.5px);
		-webkit-backdrop-filter: blur(1.5px);
		opacity: 1;
		transition: opacity 520ms ease;
		pointer-events: auto;
	}

	.splash.is-fading {
		opacity: 0;
		pointer-events: none;
	}

	.splash__center {
		position: relative;
		width: min(30vmin, 190px);
		aspect-ratio: 1;
		display: grid;
		place-items: center;
	}

	.splash__hex {
		width: 100%;
		height: 100%;
		overflow: visible;
		transform-origin: 50% 50%;
		animation: hex-spin-grow 1100ms linear forwards;
	}

	.splash__hex-stroke {
		fill: rgba(0, 212, 184, 0.4);
		stroke: #00d4b8;
		stroke-width: 3;
		stroke-linejoin: round;
		filter: drop-shadow(0 0 6px rgba(0, 212, 184, 0.72))
			drop-shadow(0 0 18px rgba(0, 212, 184, 0.4));
	}

	@keyframes hex-spin-grow {
		0% {
			transform: scale(0.45) rotate(180deg);
			opacity: 1;
		}
		30% {
			transform: scale(0.75) rotate(240deg);
		}
		60% {
			transform: scale(1.05) rotate(300deg);
			opacity: 0.5;
		}
		100% {
			transform: scale(1.35) rotate(360deg);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.splash {
			transition-duration: 120ms;
		}

		.splash__hex {
			animation: none;
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
