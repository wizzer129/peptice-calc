<template>
	<header class="app-header">
		<div class="header-inner">
			<div class="logo">
				<span class="logo-icon">⬡</span>
				<span class="logo-text">{{ title }}</span>
			</div>
			<p class="header-sub">
				{{ subtitle }}
			</p>
		</div>
	</header>
</template>

<script setup>
	defineProps({
		title: { type: String, default: 'PeptideCalc' },
		subtitle: {
			type: String,
			default: 'Reconstitution & Dosage Calculator',
		},
	});
</script>

<style lang="less" scoped>
	@import '../assets/main.less';

	.app-header {
		position: relative;
		background: @surface;
		padding: 20px 0;

		&::before {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 2px;
			background: linear-gradient(
				90deg,
				transparent 0%,
				transparent 40%,
				@teal 50%,
				@teal 70%,
				transparent 80%,
				transparent 100%
			);
			background-size: 200% 100%;
			animation: sweep-border 2s linear 1 forwards;
		}

		// &::after {
		// 	content: '';
		// 	position: absolute;
		// 	bottom: 0;
		// 	left: 0;
		// 	right: 0;
		// 	height: 2px;
		// 	background: @border;
		// 	z-index: -1;
		// }
	}

	@keyframes sweep-border {
		0% {
			background-position: 175% 0;
		}
		100% {
			background-position: -105% 0;
		}
	}

	.header-inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.logo-icon {
		font-size: 28px;
		color: @teal;
		line-height: 1;
	}

	.logo-text {
		font-family: @sans;
		font-size: 1.25rem;
		font-weight: 600;
		color: @text;
		letter-spacing: -0.02em;
	}

	.header-sub {
		color: @text-muted;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		border-left: 1px solid @border;
		padding-left: 20px;
	}

	@media (min-width: 1600px) {
		.app-header {
			padding: 24px 0;
		}

		.header-inner {
			max-width: 1320px;
			padding: 0 28px;
			gap: 24px;
		}

		.logo-icon {
			font-size: 32px;
		}

		.logo-text {
			font-size: 1.4rem;
		}

		.header-sub {
			font-size: 0.88rem;
		}
	}

	@media (min-width: 2560px) {
		.header-inner {
			max-width: 1480px;
			padding: 0 32px;
		}
	}

	@media (max-width: 640px) {
		.header-inner {
			flex-wrap: wrap;
			gap: 10px;
		}

		.header-sub {
			border-left: 0;
			padding-left: 0;
			width: 100%;
		}
	}
</style>
