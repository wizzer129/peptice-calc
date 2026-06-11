<template>
	<div class="calc-app">
		<FluidHexBackground />

		<div class="calc-content">
			<AppHeader />

			<main class="calc-main">
				<!-- Peptide Selector -->
				<section class="peptide-select-section">
					<div class="peptide-select-main">
						<PeptideDropdown
							v-model="selectedPeptide"
							:groups="peptideGroups"
							@change="applyPreset"
						/>

						<p class="preset-help">
							Selecting a peptide will load and highlight an
							example of values, not recommendations.
						</p>
					</div>

					<!-- Preset badge -->
					<transition name="fade">
						<div v-if="currentPeptide" class="preset-badge">
							<span class="badge-dot" />
							<span class="badge-name">{{
								currentPeptide.name
							}}</span>
							<span class="badge-desc">{{
								currentPeptide.description
							}}</span>
						</div>
					</transition>
				</section>

				<!-- 3-column inputs -->
				<section class="inputs-grid">
					<InputCard
						num="01"
						title="Desired Dose"
						hint="per injection"
						:options="doseOptions"
						unit="mg"
						:chip="dose"
						:custom="customDose"
						custom-placeholder="e.g. 0.3"
						:custom-min="0.001"
						:custom-step="0.001"
						:preset-value="currentPeptide?.defaults.dose ?? null"
						av-label="DOSE"
						:display-value="displayDose"
						:mcg="
							effectiveDose
								? `${(effectiveDose * 1000).toFixed(0)} mcg`
								: null
						"
						@update:chip="
							dose = $event;
							customDose = '';
						"
						@update:custom="
							customDose = $event;
							dose = null;
						"
					/>

					<InputCard
						num="02"
						title="Vial Strength"
						hint="total peptide in vial"
						:options="strengthOptions"
						unit="mg"
						:chip="strength"
						:custom="customStrength"
						custom-placeholder="e.g. 20"
						:custom-min="0.1"
						:custom-step="0.1"
						:preset-value="
							currentPeptide?.defaults.strength ?? null
						"
						av-label="VIAL"
						:display-value="displayStrength"
						@update:chip="
							strength = $event;
							customStrength = '';
						"
						@update:custom="
							customStrength = $event;
							strength = null;
						"
					/>

					<InputCard
						num="03"
						title="Bac Water"
						hint="bacteriostatic water added"
						:options="waterOptions"
						unit="mL"
						:chip="water"
						:custom="customWater"
						custom-placeholder="e.g. 2.5"
						:custom-min="0.1"
						:custom-step="0.1"
						:preset-value="currentPeptide?.defaults.water ?? null"
						av-label="WATER"
						:display-value="displayWater"
						@update:chip="
							water = $event;
							customWater = '';
						"
						@update:custom="
							customWater = $event;
							water = null;
						"
					/>
				</section>

				<!-- Results -->
				<transition name="slide-up">
					<section v-if="hasAllValues" class="results-section">
						<div class="results-grid">
							<!-- Syringe visual -->
							<div class="syringe-panel">
								<h3 class="syringe-title">
									DRAW VISUALIZATION
								</h3>
								<SyringeVisual
									:units="syringeUnits"
									:max-units="100"
								/>
								<p class="syringe-caption">
									Draw to
									<strong
										>{{
											syringeUnits.toFixed(1)
										}}
										units</strong
									>
									on a 100-unit syringe
								</p>
								<p class="syringe-ml">
									= {{ drawVolume.toFixed(3) }} mL
								</p>
							</div>

							<!-- Stat cards -->
							<div class="stat-cards">
								<StatCard
									label="PEPTIDE DOSE"
									:value="effectiveDose"
									unit="mg"
									:sub="`${(effectiveDose * 1000).toFixed(0)} mcg`"
									:status-msg="statusMsg"
									:status-class="statusClass"
								/>
								<StatCard
									label="DRAW SYRINGE TO"
									:value="syringeUnits.toFixed(1)"
									unit="units"
									:sub="`${drawVolume.toFixed(3)} mL`"
								/>
								<StatCard
									label="DOSES PER VIAL"
									:value="dosesPerVial.toFixed(1)"
									unit="doses"
									sub="full doses"
								/>
								<StatCard
									label="CONCENTRATION"
									:value="concentration.toFixed(3)"
									unit="mg/mL"
									:sub="`${(concentration * 1000).toFixed(0)} mcg/mL`"
									:highlight="true"
								/>
							</div>
						</div>
					</section>
				</transition>

				<!-- Placeholder when not enough inputs -->
				<div v-if="!hasAllValues" class="empty-state">
					<div class="empty-icon">⬡</div>
					<p>Enter all three values above to see results</p>
				</div>

				<!-- Disclaimer -->
				<footer class="disclaimer">
					<strong>Research Use Only</strong> This calculator is for
					informational and research purposes only. Not intended for
					human use, medical advice, or clinical application. Always
					consult with a qualified professional.
				</footer>
			</main>
		</div>
	</div>
</template>

<script setup>
	import { ref, computed } from 'vue';
	import SyringeVisual from './SyringeVisual.vue';
	import InputCard from './InputCard.vue';
	import StatCard from './StatCard.vue';
	import PeptideDropdown from './PeptideDropdown.vue';
	import AppHeader from './AppHeader.vue';
	import FluidHexBackground from './FluidHexBackground.vue';

	// ─── Peptide database ─────────────────────────────────────────────────────────
	const peptideGroups = [
		{
			label: 'GLP-1 / Weight Management',
			peptides: [
				{
					id: 'semaglutide',
					name: 'Semaglutide',
					description: 'GLP-1 receptor agonist',
					defaults: { dose: 0.25, strength: 5, water: 2 },
				},
				{
					id: 'tirzepatide',
					name: 'Tirzepatide',
					description: 'GLP-1 / GIP dual agonist',
					defaults: { dose: 2.5, strength: 10, water: 2 },
				},
				{
					id: 'retatrutide',
					name: 'Retatrutide',
					description: 'Triple agonist GLP-1/GIP/Glucagon',
					defaults: { dose: 2, strength: 10, water: 2 },
				},
				{
					id: 'glp2',
					name: 'GLP-2',
					description: 'Intestinal trophic peptide',
					defaults: { dose: 0.5, strength: 5, water: 2 },
				},
			],
		},
		{
			label: 'Recovery & Repair',
			peptides: [
				{
					id: 'bpc157',
					name: 'BPC-157',
					description: 'Body Protection Compound',
					defaults: { dose: 0.25, strength: 10, water: 3 },
				},
				{
					id: 'tb500',
					name: 'TB-500 (Thymosin β4)',
					description: 'Tissue healing & regeneration',
					defaults: { dose: 2.5, strength: 10, water: 2 },
				},
				{
					id: 'bpc157tb500',
					name: 'BPC-157 + TB-500 Blend',
					description: 'Synergistic repair blend',
					defaults: { dose: 0.5, strength: 10, water: 3 },
				},
			],
		},
		{
			label: 'Growth Hormone Peptides',
			peptides: [
				{
					id: 'ipamorelin',
					name: 'Ipamorelin',
					description: 'Selective GH secretagogue',
					defaults: { dose: 0.1, strength: 5, water: 3 },
				},
				{
					id: 'cjc1295',
					name: 'CJC-1295',
					description: 'GHRH analogue (with DAC)',
					defaults: { dose: 1, strength: 5, water: 3 },
				},
				{
					id: 'ghrp2',
					name: 'GHRP-2',
					description: 'GH releasing peptide-2',
					defaults: { dose: 0.1, strength: 5, water: 3 },
				},
				{
					id: 'tesamorelin',
					name: 'Tesamorelin',
					description: 'GHRH analogue',
					defaults: { dose: 1, strength: 10, water: 2 },
				},
				{
					id: 'sermorelin',
					name: 'Sermorelin',
					description: 'GHRH(1-29) fragment',
					defaults: { dose: 0.2, strength: 15, water: 3 },
				},
				{
					id: 'hexarelin',
					name: 'Hexarelin',
					description: 'Potent GH secretagogue',
					defaults: { dose: 0.1, strength: 5, water: 3 },
				},
			],
		},
		{
			label: 'Cognitive & Other',
			peptides: [
				{
					id: 'nad',
					name: 'NAD+',
					description: 'Nicotinamide adenine dinucleotide',
					defaults: { dose: 50, strength: 1000, water: 5 },
				},
				{
					id: 'selank',
					name: 'Selank',
					description: 'Anxiolytic / cognitive peptide',
					defaults: { dose: 0.25, strength: 5, water: 3 },
				},
				{
					id: 'semax',
					name: 'Semax',
					description: 'Cognitive enhancer (ACTH analogue)',
					defaults: { dose: 0.3, strength: 30, water: 3 },
				},
				{
					id: 'motsc',
					name: 'MOTS-c',
					description: 'Mitochondrial peptide',
					defaults: { dose: 5, strength: 10, water: 1 },
				},
				{
					id: 'pt141',
					name: 'PT-141 (Bremelanotide)',
					description: 'Sexual function peptide',
					defaults: { dose: 1, strength: 10, water: 3 },
				},
				{
					id: 'dsip',
					name: 'DSIP',
					description: 'Delta sleep-inducing peptide',
					defaults: { dose: 0.25, strength: 5, water: 3 },
				},
			],
		},
	];

	// Flatten for lookup
	const peptideMap = Object.fromEntries(
		peptideGroups.flatMap((g) => g.peptides).map((p) => [p.id, p])
	);

	// ─── State ────────────────────────────────────────────────────────────────────
	const selectedPeptide = ref('');
	const dose = ref(null);
	const strength = ref(null);
	const water = ref(null);
	const customDose = ref('');
	const customStrength = ref('');
	const customWater = ref('');

	function buildOptions(defaultValues, extraValues = []) {
		return [...new Set([...defaultValues, ...extraValues])].sort(
			(a, b) => a - b
		);
	}

	const doseOptions = buildOptions(
		peptideGroups
			.map((group) =>
				group.peptides.map((peptide) => peptide.defaults.dose)
			)
			.flat(),
		[7.5, 10, 12.5, 15]
	);
	const strengthOptions = buildOptions(
		peptideGroups
			.map((group) =>
				group.peptides.map((peptide) => peptide.defaults.strength)
			)
			.flat(),
		[50, 60, 100]
	);
	const waterOptions = buildOptions(
		peptideGroups
			.map((group) =>
				group.peptides.map((peptide) => peptide.defaults.water)
			)
			.flat(),
		[0.5, 1, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0]
	);

	// ─── Computed ─────────────────────────────────────────────────────────────────
	const currentPeptide = computed(
		() => peptideMap[selectedPeptide.value] ?? null
	);

	const effectiveDose = computed(() => {
		const v = parseFloat(customDose.value);
		return dose.value !== null ? dose.value : v || null;
	});
	const effectiveStrength = computed(() => {
		const v = parseFloat(customStrength.value);
		return strength.value !== null ? strength.value : v || null;
	});
	const effectiveWater = computed(() => {
		const v = parseFloat(customWater.value);
		return water.value !== null ? water.value : v || null;
	});

	const hasAllValues = computed(
		() =>
			effectiveDose.value &&
			effectiveStrength.value &&
			effectiveWater.value
	);

	const concentration = computed(() => {
		if (!hasAllValues.value) return 0;
		return effectiveStrength.value / effectiveWater.value;
	});

	const drawVolume = computed(() => {
		if (!hasAllValues.value) return 0;
		return effectiveDose.value / concentration.value;
	});

	const syringeUnits = computed(() => drawVolume.value * 100);

	const dosesPerVial = computed(() => {
		if (!hasAllValues.value) return 0;
		return effectiveStrength.value / effectiveDose.value;
	});

	const displayDose = computed(() => effectiveDose.value ?? '–');
	const displayStrength = computed(() => effectiveStrength.value ?? '–');
	const displayWater = computed(() => effectiveWater.value ?? '–');

	const statusMsg = computed(() => {
		if (!hasAllValues.value) return null;
		if (syringeUnits.value > 100) return 'Decrease water — over 100 units';
		if (syringeUnits.value < 1) return 'Increase water — very low draw';
		if (effectiveDose.value > effectiveStrength.value)
			return 'Not enough peptide in vial';
		return null;
	});

	const statusClass = computed(() => {
		if (!statusMsg.value) return 'ok';
		if (statusMsg.value.startsWith('Not')) return 'error';
		return 'warn';
	});

	// ─── Methods ──────────────────────────────────────────────────────────────────
	function applyPreset() {
		const p = currentPeptide.value;
		if (!p) return;
		const d = p.defaults;
		dose.value = d.dose;
		strength.value = d.strength;
		water.value = d.water;
		customDose.value = '';
		customStrength.value = '';
		customWater.value = '';
	}
</script>

<style lang="less" scoped>
	@import '../assets/main.less';
	@margin-bottom-sections: 20px;

	.calc-app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.calc-content {
		position: relative;
		z-index: 1;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	// ── Main ─────────────────────────────────────────────────────────────────────
	.calc-main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 40px 24px 80px;
		flex: 1;
		width: 100%;

		@media (min-width: 1600px) {
			max-width: 1320px;
			padding: 52px 28px 96px;
		}

		@media (min-width: 2560px) {
			max-width: 1480px;
			padding: 64px 32px 112px;
		}
	}

	// ── Peptide Select ────────────────────────────────────────────────────────────
	.peptide-select-section {
		display: flex;
		flex-direction: row;
		margin-bottom: @margin-bottom-sections;
		justify-content: space-between;
		align-items: flex-end;
		gap: 20px;

		@media (max-width: 900px) {
			flex-direction: column;
			align-items: stretch;
		}
	}

	.peptide-select-main {
		display: flex;
		align-items: flex-end;
		gap: 16px;
		flex-wrap: wrap;
		width: 100%;

		@media (min-width: 768px) {
			width: auto;
		}
	}

	.preset-help {
		max-width: 360px;
		font-size: 0.78rem;
		line-height: 1.5;
		color: @text;
		margin-bottom: 3px;
	}

	.preset-badge {
		display: flex;
		align-items: center;
		align-self: flex-end;
		gap: 10px;
		min-height: 50px;
		border: 1px solid;
		border-color: fade(@teal, 100%);
		background: fade(@teal, 35%);
		border-radius: @radius;
		padding: 10px 14px;

		@media (max-width: 900px) {
			height: 65px;
			align-self: flex-start;
			padding: 20px 10px;
		}
	}

	.badge-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: @teal;
		flex-shrink: 0;
		box-shadow: 0 0 6px @teal;
		animation: badge-pulse 3s ease-in-out infinite;
	}

	.badge-name {
		font-weight: 600;
		font-size: 0.9rem;
		color: @teal;
	}

	.badge-desc {
		color: @text;
		font-size: 0.82rem;
	}

	// ── Input Cards ───────────────────────────────────────────────────────────────
	.inputs-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
		margin-bottom: @margin-bottom-sections;

		@media (min-width: 1600px) {
			gap: 24px;
		}

		@media (max-width: 800px) {
			grid-template-columns: 1fr;
			gap: 16px;
		}
	}

	// ── Results ───────────────────────────────────────────────────────────────────
	.results-section {
		margin-bottom: @margin-bottom-sections;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
		align-items: stretch;
		justify-items: stretch;

		@media (min-width: 1600px) {
			gap: 24px;
		}

		@media (max-width: 800px) {
			grid-template-columns: 1fr;
		}
	}

	.syringe-panel {
		background: @surface;
		border: 2px solid @border;
		border-radius: @radius-lg;
		padding: 24px;
		text-align: center;

		&:hover {
			border-color: fade(@teal, 90%);
		}
	}

	.syringe-title {
		font-family: @mono;
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		color: @text-muted;
		margin-bottom: 20px;
	}

	.syringe-caption {
		margin-top: 16px;
		font-size: 0.88rem;
		color: @text;
	}

	.syringe-ml {
		font-family: @mono;
		font-size: 1.5rem;
		color: @teal;
		margin-top: 4px;
	}

	.stat-cards {
		display: grid;
		grid-column: span 2;
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 1fr;
		gap: 14px;
		height: 100%;

		@media (max-width: 560px) {
			grid-column: span 1;
			grid-template-columns: 1fr;
			height: auto;
		}
	}

	// ── Empty State ───────────────────────────────────────────────────────────────
	.empty-state {
		border: 2px dashed @border;
		border-radius: @radius;
		background: fade(@surface, 70%);
		text-align: center;
		padding: 50px 0;
		color: @text-muted;
		margin-bottom: @margin-bottom-sections;

		.empty-icon {
			font-family: @sans;
			font-size: 5rem;
			color: @border;
		}

		p {
			font-size: 0.9rem;
			letter-spacing: 0.04em;
		}
	}

	// ── Disclaimer ────────────────────────────────────────────────────────────────
	.disclaimer {
		padding: 16px 20px;
		background: @surface;
		border: 2px solid @border;
		border-radius: @radius;
		font-size: 1rem;
		color: @text-muted;
		line-height: 1.6;

		strong {
			color: @text;
			display: block;
			font-size: 0.95rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			margin-bottom: 4px;
		}

		&:hover {
			border-color: fade(@teal, 90%);
		}
	}

	// ── Transitions ───────────────────────────────────────────────────────────────
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.2s;
	}
	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}

	.slide-up-enter-active {
		transition: all 0.3s ease;
	}
	.slide-up-enter-from {
		opacity: 0;
		transform: translateY(12px);
	}

	@keyframes badge-pulse {
		0%,
		100% {
			box-shadow:
				0 0 4px fade(@teal, 70%),
				0 0 0 0 fade(@teal, 0%);
			transform: scale(1);
		}

		50% {
			box-shadow:
				0 0 10px fade(@teal, 100%),
				0 0 16px 2px fade(@teal, 24%);
			transform: scale(1.1);
		}
	}
</style>
