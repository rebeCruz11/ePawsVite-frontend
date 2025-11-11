<template>
  <div :class="['stat-card-modern', variant]">
    <div class="stat-icon"><i :class="icon"></i></div>
    <div class="stat-content">
      <span class="stat-label">{{ label }}</span>
      <h3 class="stat-value">{{ value }}</h3>
      <div class="stat-trend" v-if="trend">
        <i :class="trendIcon"></i>
        <span>{{ trend }}</span>
      </div>
    </div>
    <div class="stat-decoration"></div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    icon: { type: String, default: 'bi bi-clipboard-check' },
    label: { type: String, default: '' },
    value: { type: [String, Number], default: '' },
    trend: { type: String, default: '' },
    trendIcon: { type: String, default: 'bi bi-arrow-up' },
    variant: { type: String, default: 'primary' }
  }
}
</script>

<style scoped>
.stat-card-modern {
  display:flex; gap:1rem; align-items:center; padding:1rem 1.15rem; position:relative; overflow:hidden;
}
.stat-icon { width:58px; height:58px; border-radius:12px; display:flex; align-items:center; justify-content:center; background: #fff; color:var(--epaws-primary); font-size:1.5rem; box-shadow: 0 6px 18px rgba(23,102,188,0.06); }
.stat-label { font-size:0.9rem; color:var(--epaws-muted); font-weight:700; }
.stat-value { margin:0; font-size:1.4rem; font-weight:800; color:var(--epaws-primary); }
.stat-trend { display:flex; gap:0.4rem; align-items:center; color:var(--epaws-muted); font-size:0.9rem; }
.stat-decoration { position:absolute; right:-40px; top:-40px; width:160px; height:160px; background: radial-gradient(circle at 30% 30%, rgba(102,126,234,0.06), transparent 40%); transform: rotate(12deg); }

/* variants (small visual hints) */
.stat-card-modern.warning .stat-icon { background:#fff3e0; color:var(--epaws-warning); }
.stat-card-modern.info .stat-icon { background:#eef6ff; color:var(--epaws-accent); }
.stat-card-modern.primary .stat-icon { background:#eaf4fc; color:var(--epaws-primary); }

</style>
