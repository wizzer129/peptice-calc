<template>
	<div class="calc-app">
		<!-- Header -->
		<header class="app-header">
			<div class="header-inner">
				<div class="logo">
					<span class="logo-icon">⬡</span>
					<span class="logo-text">PeptideCalc</span>
				</div>
				<p class="header-sub">Reconstitution &amp; Dosage Calculator</p>
			</div>
		</header>

		<main class="calc-main">
			<!-- Peptide Selector -->
			<section class="peptide-select-section">
				<div>
					<label class="field-label">SELECT PEPTIDE</label>
					<div class="select-wrapper">
						<select
							v-model="selectedPeptide"
							class="peptide-select"
							@change="applyPreset"
						>
							<option value="">— Custom / No Preset —</option>
							<optgroup
								v-for="group in peptideGroups"
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
					<p class="preset-help">
						Selecting a peptide loads example preset values, not
						recommendations.
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

			<!-- Advice banner from preset -->
			<section
				class="notes-section"
				v-if="currentPeptide && currentPeptide.notes"
			>
				<transition name="fade">
					<div class="notes-banner">
						<span class="notes-icon">ℹ</span>
						<div>
							<strong
								>{{ currentPeptide.name }} Preset Notes</strong
							>
							<p>{{ currentPeptide.notes }}</p>
						</div>
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
					:preset-value="currentPeptide?.defaults.strength ?? null"
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
							<h3 class="syringe-title">DRAW VISUALIZATION</h3>
							<SyringeVisual
								:units="syringeUnits"
								:max-units="100"
							/>
							<p class="syringe-caption">
								Draw to
								<strong
									>{{ syringeUnits.toFixed(1) }} units</strong
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
				<div class="empty-icon">⟩_</div>
				<p>Enter all three values above to see results</p>
			</div>

			<!-- Disclaimer -->
			<footer class="disclaimer">
				<strong>Research Use Only.</strong> This calculator is for
				informational and research purposes only. Not intended for human
				use, medical advice, or clinical application. Always consult a
				qualified professional.
			</footer>
		</main>
	</div>
</template>

<script setup>
	import { ref, computed } from 'vue';
	import SyringeVisual from './SyringeVisual.vue';
	import InputCard from './InputCard.vue';
	import StatCard from './StatCard.vue';

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
					notes: 'Start at 0.25mg/week; titrate slowly. Common reconstitution: 5mg in 2mL bac water.',
				},
				{
					id: 'tirzepatide',
					name: 'Tirzepatide',
					description: 'GLP-1 / GIP dual agonist',
					defaults: { dose: 2.5, strength: 10, water: 2 },
					notes: 'Begin at 2.5mg weekly. Titrate by 2.5mg every 4 weeks as tolerated.',
				},
				{
					id: 'retatrutide',
					name: 'Retatrutide',
					description: 'Triple agonist GLP-1/GIP/Glucagon',
					defaults: { dose: 2, strength: 10, water: 2 },
					notes: 'Start at 2mg per week. Titrate carefully — more potent than semaglutide.',
				},
				{
					id: 'glp2',
					name: 'GLP-2',
					description: 'Intestinal trophic peptide',
					defaults: { dose: 0.5, strength: 5, water: 2 },
					notes: 'Typical dose range: 0.5–2mg. Often used 2mL reconstitution.',
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
					notes: 'Common dose: 250–500mcg per injection. Reconstitute 10mg in 3mL for convenient dosing.',
				},
				{
					id: 'tb500',
					name: 'TB-500 (Thymosin β4)',
					description: 'Tissue healing & regeneration',
					defaults: { dose: 2.5, strength: 10, water: 2 },
					notes: 'Loading phase: 4–8mg/week for 4–6 weeks. Maintenance: 2–2.5mg biweekly.',
				},
				{
					id: 'bpc157tb500',
					name: 'BPC-157 + TB-500 Blend',
					description: 'Synergistic repair blend',
					defaults: { dose: 0.5, strength: 10, water: 3 },
					notes: 'Blend usually 50/50. Dose each component accordingly.',
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
					notes: 'Typical dose: 100–300mcg per injection, 1–3× daily.',
				},
				{
					id: 'cjc1295',
					name: 'CJC-1295',
					description: 'GHRH analogue (with DAC)',
					defaults: { dose: 1, strength: 5, water: 3 },
					notes: 'DAC form: 1mg twice weekly. No-DAC form: dose more frequently like GHRH.',
				},
				{
					id: 'ghrp2',
					name: 'GHRP-2',
					description: 'GH releasing peptide-2',
					defaults: { dose: 0.1, strength: 5, water: 3 },
					notes: '100mcg typical dose, 2–3× daily. Stack with GHRH for synergy.',
				},
				{
					id: 'tesamorelin',
					name: 'Tesamorelin',
					description: 'GHRH analogue',
					defaults: { dose: 1, strength: 10, water: 2 },
					notes: 'Standard dose: 1mg subcutaneous daily. Often reconstituted in 2mL.',
				},
				{
					id: 'sermorelin',
					name: 'Sermorelin',
					description: 'GHRH(1-29) fragment',
					defaults: { dose: 0.2, strength: 15, water: 3 },
					notes: 'Dose range: 200–500mcg before bed. Longer acting at lower doses.',
				},
				{
					id: 'hexarelin',
					name: 'Hexarelin',
					description: 'Potent GH secretagogue',
					defaults: { dose: 0.1, strength: 5, water: 3 },
					notes: '100mcg typical. Down-regulates with chronic use — cycle off regularly.',
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
					notes: 'IV: 500–1000mg over several hours. Sub-Q: 50–100mg per injection. Reconstitute 1000mg in 5mL.',
				},
				{
					id: 'selank',
					name: 'Selank',
					description: 'Anxiolytic / cognitive peptide',
					defaults: { dose: 0.25, strength: 5, water: 3 },
					notes: 'Typical dose: 250mcg intranasally or sub-Q, 1–2× daily.',
				},
				{
					id: 'semax',
					name: 'Semax',
					description: 'Cognitive enhancer (ACTH analogue)',
					defaults: { dose: 0.3, strength: 30, water: 3 },
					notes: 'Dose range: 300–600mcg. Commonly used intranasally.',
				},
				{
					id: 'motsc',
					name: 'MOTS-c',
					description: 'Mitochondrial peptide',
					defaults: { dose: 5, strength: 10, water: 1 },
					notes: 'Dose range: 5–15mg, 1–3× weekly. Start at lower end.',
				},
				{
					id: 'pt141',
					name: 'PT-141 (Bremelanotide)',
					description: 'Sexual function peptide',
					defaults: { dose: 1, strength: 10, water: 3 },
					notes: 'Typical dose: 1–2mg sub-Q, 1 hour before activity.',
				},
				{
					id: 'dsip',
					name: 'DSIP',
					description: 'Delta sleep-inducing peptide',
					defaults: { dose: 0.25, strength: 5, water: 3 },
					notes: 'Common dose: 100–500mcg. Administer in the evening.',
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

	.calc-app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	// ── Header ──────────────────────────────────────────────────────────────────
	.app-header {
		border-bottom: 1px solid @border;
		background: @surface;
		padding: 20px 0;
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
		font-family: @mono;
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

	// ── Main ─────────────────────────────────────────────────────────────────────
	.calc-main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 40px 24px 80px;
		flex: 1;
		width: 100%;
	}

	// ── Peptide Select ────────────────────────────────────────────────────────────
	.peptide-select-section {
		display: flex;
		flex-direction: row;
		margin-bottom: 40px;
		justify-content: space-between;
	}

	.field-label {
		display: block;
		font-family: @mono;
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		color: @text-muted;
		margin-bottom: 8px;
	}

	.select-wrapper {
		position: relative;
		max-width: 420px;
	}

	.preset-help {
		max-width: 420px;
		margin-top: 10px;
		font-size: 0.78rem;
		line-height: 1.5;
		color: @text-muted;
	}

	.peptide-select {
		width: 100%;
		appearance: none;
		background: @surface;
		border: 1px solid @border;
		border-radius: @radius;
		color: @text;
		font-family: @sans;
		font-size: 1rem;
		padding: 12px 40px 12px 16px;
		cursor: pointer;
		outline: none;
		transition: border-color 0.15s;

		&:focus {
			border-color: @teal;
		}

		option,
		optgroup {
			background: @surface;
			color: @text;
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

	.preset-badge {
		display: flex;
		align-items: center;
		align-self: flex-end;
		gap: 10px;
		max-width: 420px;
		height: 46px;
		background: fade(@teal, 8%);
		border: 1px solid fade(@teal, 25%);
		border-radius: @radius;
		padding: 10px 14px;
	}

	.badge-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: @teal;
		flex-shrink: 0;
		box-shadow: 0 0 6px @teal;
	}

	.badge-name {
		font-weight: 600;
		font-size: 0.9rem;
		color: @teal;
	}

	.badge-desc {
		color: @text-muted;
		font-size: 0.82rem;
	}

	// ── Input Cards ───────────────────────────────────────────────────────────────
	.inputs-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
		margin-bottom: 24px;

		@media (max-width: 800px) {
			grid-template-columns: 1fr;
		}
	}

	.notes-section {
		margin-bottom: 24px;
	}

	// ── Results ───────────────────────────────────────────────────────────────────
	.results-section {
		margin-bottom: 24px;
	}

	.results-grid {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 20px;
		align-items: stretch;

		@media (max-width: 800px) {
			grid-template-columns: 1fr;
		}
	}

	.syringe-panel {
		background: @surface;
		border: 1px solid @border;
		border-radius: @radius-lg;
		padding: 24px;
		text-align: center;
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
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 1fr;
		gap: 14px;
		height: 100%;

		@media (max-width: 560px) {
			grid-template-columns: 1fr;
			height: auto;
		}
	}

	// ── Notes Banner ──────────────────────────────────────────────────────────────
	.notes-banner {
		display: flex;
		gap: 16px;
		align-items: flex-start;
		background: @surface;
		border: 1px solid fade(@teal, 20%);
		border-left: 3px solid @teal;
		border-radius: @radius;
		padding: 16px 20px;
		margin-top: 16px;

		.notes-icon {
			font-size: 1.1rem;
			color: @teal;
			flex-shrink: 0;
			margin-top: 1px;
		}

		strong {
			display: block;
			font-size: 0.85rem;
			color: @teal;
			margin-bottom: 4px;
		}

		p {
			font-size: 0.85rem;
			color: @text-muted;
			line-height: 1.55;
		}
	}

	// ── Empty State ───────────────────────────────────────────────────────────────
	.empty-state {
		text-align: center;
		padding: 60px 0;
		color: @text-muted;

		.empty-icon {
			font-family: @mono;
			font-size: 2.5rem;
			color: @border;
			margin-bottom: 16px;
		}

		p {
			font-size: 0.9rem;
			letter-spacing: 0.04em;
		}
	}

	// ── Disclaimer ────────────────────────────────────────────────────────────────
	.disclaimer {
		margin-top: 40px;
		padding: 16px 20px;
		background: @surface;
		border: 1px solid @border;
		border-radius: @radius;
		font-size: 1rem;
		color: @text-muted;
		line-height: 1.6;

		strong {
			color: @text;
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
</style>
