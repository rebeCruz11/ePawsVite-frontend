<template>
  <div class="report-item">
    <div :class="['report-icon', iconBg]">
      <i :class="icon"></i>
    </div>
    <div class="report-details">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="report-title">{{ title }}</div>
          <div class="report-meta text-muted">{{ meta }}</div>
        </div>
        <div class="text-end">
          <div class="report-date text-muted">{{ date }}</div>
          <div class="report-status mt-2"><span :class="['status-badge', statusClass]">{{ status }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportItem',
  props: {
    title: String,
    meta: String,
    date: String,
    status: String,
    icon: { type: String, default: 'bi bi-clipboard-check' },
    iconBg: { type: String, default: 'bg-white' },
    statusClass: { type: String, default: 'bg-primary' }
  }
}
</script>

<style scoped>
.report-icon { width:52px; height:52px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.15rem; box-shadow: 0 6px 18px rgba(23,102,188,0.06); }
.report-details { flex:1; }
.report-title { font-weight:800; font-size:1.05rem; color:var(--epaws-title, #1a1a1a); }
.status-badge { padding:0.35rem 0.7rem; border-radius:14px; color:#fff; font-weight:800; }
</style>
