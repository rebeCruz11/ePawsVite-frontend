<template>
  <div class="client-hero fade-in">
    <div class="hero-inner">
      <div class="hero-left d-flex align-items-center">
        <div class="hero-avatar">
          <i class="bi bi-person-circle"></i>
        </div>
        <div class="hero-text ms-3">
          <h2 class="hero-title">{{ title }}</h2>
          <p class="hero-subtitle text-muted mb-0">{{ subtitle }}</p>
        </div>
      </div>

      <div class="hero-actions d-flex align-items-center gap-2">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientHero',
  props: {
    title: { type: String, default: 'Mi Cuenta' },
    subtitle: { type: String, default: '' }
  }
}
</script>

<style scoped>
.client-hero {
  background: linear-gradient(135deg, var(--epaws-hero-start, #667eea) 0%, var(--epaws-hero-end, #764ba2) 100%);
  border-radius: 24px;
  padding: 20px 22px;
  margin-bottom: 18px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.18);
  position: relative;
  overflow: hidden;
}
.hero-inner { display:flex; justify-content:space-between; align-items:center; }
.hero-avatar {
  width:80px; height:80px; border-radius:20px; display:flex; align-items:center; justify-content:center;
  background: rgba(255,255,255,0.18); color: var(--epaws-hero-text, #fff); font-size:2.4rem; box-shadow: 0 8px 24px rgba(102,126,234,0.12);
}
.hero-title { margin:0; font-size:1.5rem; font-weight:800; color:var(--epaws-hero-text, #fff); }
.hero-subtitle { margin:0; font-size:0.98rem; color: rgba(255,255,255,0.9); }
.hero-actions ::v-deep > * { min-width: 140px; }
</style>
