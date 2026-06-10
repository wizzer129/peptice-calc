<template>
  <div class="calc-app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">⬡</span>
          <span class="logo-text">PeptideCalc</span>
        </div>
        <p class="header-sub">
          Reconstitution &amp; Dosage Calculator
        </p>
      </div>
    </header>

    <main class="calc-main">
      <!-- Peptide Selector -->
      <section class="peptide-select-section">
        <label class="field-label">SELECT PEPTIDE</label>
        <div class="select-wrapper">
          <select
            v-model="selectedPeptide"
            class="peptide-select"
            @change="applyPreset"
          >
            <option value="">
              — Custom / No Preset —
            </option>
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

        <!-- Preset badge -->
        <transition name="fade">
          <div
            v-if="currentPeptide"
            class="preset-badge"
          >
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
        <!-- Dose -->
        <div class="input-card">
          <div class="card-header">
            <span class="card-num">01</span>
            <div>
              <h3 class="card-title">
                Desired Dose
              </h3>
              <p class="card-hint">
                per injection
              </p>
            </div>
          </div>

          <div class="chip-group">
            <button
              v-for="v in doseOptions"
              :key="v"
              class="chip"
              :class="{
                active: dose === v,
                recommended:
                  currentPeptide &&
                  currentPeptide.defaults.dose === v,
              }"
              @click="
                dose = v;
                customDose = '';
              "
            >
              {{ v }}mg<span
                v-if="
                  currentPeptide &&
                    currentPeptide.defaults.dose === v
                "
                class="rec-dot"
                title="Recommended"
              >★</span>
            </button>
          </div>

          <div class="custom-row">
            <label class="custom-label">Custom (mg)</label>
            <input
              v-model="customDose"
              type="number"
              class="custom-input"
              placeholder="e.g. 0.3"
              min="0.001"
              step="0.001"
              @input="dose = null"
            >
          </div>

          <div class="active-val">
            <span class="av-label">DOSE</span>
            <span class="av-num">{{ displayDose
            }}<span class="av-unit">mg</span></span>
            <span
              v-if="effectiveDose"
              class="av-mcg"
            >= {{ (effectiveDose * 1000).toFixed(0) }} mcg</span>
          </div>
        </div>

        <!-- Vial Strength -->
        <div class="input-card">
          <div class="card-header">
            <span class="card-num">02</span>
            <div>
              <h3 class="card-title">
                Vial Strength
              </h3>
              <p class="card-hint">
                total peptide in vial
              </p>
            </div>
          </div>

          <div class="chip-group">
            <button
              v-for="v in strengthOptions"
              :key="v"
              class="chip"
              :class="{
                active: strength === v,
                recommended:
                  currentPeptide &&
                  currentPeptide.defaults.strength === v,
              }"
              @click="
                strength = v;
                customStrength = '';
              "
            >
              {{ v }}mg<span
                v-if="
                  currentPeptide &&
                    currentPeptide.defaults.strength === v
                "
                class="rec-dot"
                title="Recommended"
              >★</span>
            </button>
          </div>

          <div class="custom-row">
            <label class="custom-label">Custom (mg)</label>
            <input
              v-model="customStrength"
              type="number"
              class="custom-input"
              placeholder="e.g. 20"
              min="0.1"
              step="0.1"
              @input="strength = null"
            >
          </div>

          <div class="active-val">
            <span class="av-label">VIAL</span>
            <span class="av-num">{{ displayStrength
            }}<span class="av-unit">mg</span></span>
          </div>
        </div>

        <!-- Bac Water -->
        <div class="input-card">
          <div class="card-header">
            <span class="card-num">03</span>
            <div>
              <h3 class="card-title">
                Bac Water
              </h3>
              <p class="card-hint">
                bacteriostatic water added
              </p>
            </div>
          </div>

          <div class="chip-group">
            <button
              v-for="v in waterOptions"
              :key="v"
              class="chip"
              :class="{
                active: water === v,
                recommended:
                  currentPeptide &&
                  currentPeptide.defaults.water === v,
              }"
              @click="
                water = v;
                customWater = '';
              "
            >
              {{ v }}mL<span
                v-if="
                  currentPeptide &&
                    currentPeptide.defaults.water === v
                "
                class="rec-dot"
                title="Recommended"
              >★</span>
            </button>
          </div>

          <div class="custom-row">
            <label class="custom-label">Custom (mL)</label>
            <input
              v-model="customWater"
              type="number"
              class="custom-input"
              placeholder="e.g. 2.5"
              min="0.1"
              step="0.1"
              @input="water = null"
            >
          </div>

          <div class="active-val">
            <span class="av-label">WATER</span>
            <span class="av-num">{{ displayWater
            }}<span class="av-unit">mL</span></span>
          </div>
        </div>
      </section>

      <!-- Results -->
      <transition name="slide-up">
        <section
          v-if="hasAllValues"
          class="results-section"
        >
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
                <strong>{{ syringeUnits.toFixed(1) }} units</strong>
                on a 100-unit syringe
              </p>
              <p class="syringe-ml">
                = {{ drawVolume.toFixed(3) }} mL
              </p>
            </div>

            <!-- Stat cards -->
            <div class="stat-cards">
              <div
                class="stat-card"
                :class="statusClass"
              >
                <span class="stat-label">PEPTIDE DOSE</span>
                <span class="stat-value">{{ effectiveDose }}
                  <span class="stat-unit">mg</span>
                </span>
                <span class="stat-mcg">{{
                  (effectiveDose * 1000).toFixed(0)
                }}
                  mcg</span>
                <div
                  v-if="statusMsg"
                  class="status-badge"
                  :class="statusClass"
                >
                  {{ statusMsg }}
                </div>
              </div>

              <div class="stat-card">
                <span class="stat-label">DRAW SYRINGE TO</span>
                <span class="stat-value">{{ syringeUnits.toFixed(1) }}
                  <span class="stat-unit">units</span>
                </span>
                <span class="stat-mcg">{{ drawVolume.toFixed(3) }} mL</span>
              </div>

              <div class="stat-card">
                <span class="stat-label">DOSES PER VIAL</span>
                <span class="stat-value">{{ dosesPerVial.toFixed(1) }}
                  <span class="stat-unit">doses</span>
                </span>
                <span class="stat-mcg">full doses</span>
              </div>

              <div class="stat-card highlight">
                <span class="stat-label">CONCENTRATION</span>
                <span class="stat-value">{{ concentration.toFixed(3) }}
                  <span class="stat-unit">mg/mL</span>
                </span>
                <span class="stat-mcg">{{
                  (concentration * 1000).toFixed(0)
                }}
                  mcg/mL</span>
              </div>
            </div>
          </div>

          <!-- Advice banner from preset -->
          <transition name="fade">
            <div
              v-if="currentPeptide && currentPeptide.notes"
              class="notes-banner"
            >
              <span class="notes-icon">ℹ</span>
              <div>
                <strong>{{ currentPeptide.name }} Notes</strong>
                <p>{{ currentPeptide.notes }}</p>
              </div>
            </div>
          </transition>
        </section>
      </transition>

      <!-- Placeholder when not enough inputs -->
      <div
        v-if="!hasAllValues"
        class="empty-state"
      >
        <div class="empty-icon">
          ⟩_
        </div>
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
                defaults: { dose: 5, strength: 10, water: 2 },
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

const doseOptions = [0.1, 0.25, 0.5, 1, 2.5, 5, 7.5, 10, 12.5, 15, 50];
const strengthOptions = [5, 10, 15, 30, 50, 100, 1000];
const waterOptions = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0];

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
    () => effectiveDose.value && effectiveStrength.value && effectiveWater.value
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
	margin-bottom: 40px;
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
	gap: 10px;
	margin-top: 12px;
	max-width: 420px;
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
	margin-bottom: 32px;

	@media (max-width: 800px) {
		grid-template-columns: 1fr;
	}
}

.input-card {
	background: @surface;
	border: 1px solid @border;
	border-radius: @radius-lg;
	padding: 24px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	transition: border-color 0.2s;

	&:hover {
		border-color: fade(@teal, 30%);
	}
}

.card-header {
	display: flex;
	align-items: flex-start;
	gap: 12px;
}

.card-num {
	font-family: @mono;
	font-size: 0.7rem;
	color: @teal;
	opacity: 0.7;
	padding-top: 3px;
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
	margin-top: 2px;
}

.chip-group {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.chip {
	background: @surface2;
	border: 1px solid @border;
	color: @text-muted;
	border-radius: 6px;
	padding: 5px 10px;
	font-family: @mono;
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

	&.recommended:not(.active) {
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
	gap: 10px;
}

.custom-label {
	font-size: 0.72rem;
	color: @text-muted;
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
	transition: border-color 0.15s;

	&:focus {
		border-color: @teal;
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
	font-size: 0.65rem;
	color: @text-muted;
	letter-spacing: 0.1em;
}

.av-num {
	font-family: @mono;
	font-size: 1.4rem;
	font-weight: 600;
	color: @teal;
	line-height: 1;
}

.av-unit {
	font-size: 0.75rem;
	color: @text-muted;
	margin-left: 2px;
}

.av-mcg {
	font-family: @mono;
	font-size: 0.72rem;
	color: @text-muted;
	margin-left: 4px;
}

// ── Results ───────────────────────────────────────────────────────────────────
.results-section {
	margin-bottom: 32px;
}

.results-grid {
	display: grid;
	grid-template-columns: 280px 1fr;
	gap: 20px;
	align-items: start;

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
	font-size: 0.8rem;
	color: @teal;
	margin-top: 4px;
}

.stat-cards {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 14px;

	@media (max-width: 560px) {
		grid-template-columns: 1fr;
	}
}

.stat-card {
	background: @surface;
	border: 1px solid @border;
	border-radius: @radius-lg;
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 4px;

	&.highlight {
		border-color: fade(@teal, 35%);
		background: fade(@teal, 5%);
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
	font-size: 0.65rem;
	letter-spacing: 0.1em;
	color: @text-muted;
}

.stat-value {
	font-family: @mono;
	font-size: 2rem;
	font-weight: 600;
	color: @text;
	line-height: 1.1;
}

.stat-unit {
	font-size: 0.85rem;
	color: @text-muted;
	font-weight: 400;
}

.stat-mcg {
	font-family: @mono;
	font-size: 0.75rem;
	color: @text-muted;
}

.status-badge {
	margin-top: 8px;
	display: inline-block;
	padding: 3px 8px;
	border-radius: 4px;
	font-size: 0.72rem;
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
	font-size: 0.75rem;
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
