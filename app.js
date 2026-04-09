// ── Helpers ──────────────────────────────────────────────
const fmt = n => '$' + n.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2});
const fmtK = n => n >= 1000 ? '$' + (n/1000).toFixed(1) + 'K' : fmt(n);

function getFilteredData() {
  const year = document.getElementById('yearFilter').value;
  if (year === 'all') return RAW_DATA;
  return RAW_DATA.filter(r => r.date.startsWith(year));
}

// ── Charts ────────────────────────────────────────────────
let lineChart, donutChart, regionChart;

function initCharts(data) {
  const gridC = 'rgba(0,0,0,0.05)';
  const tickC = '#9ca3af';

  // Monthly Revenue
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const year = document.getElementById('yearFilter').value;

  let datasets = [];
  if (year === 'all' || year === '2025') {
    const m25 = Array(12).fill(0);
    data.filter(r=>r.date.startsWith('2025')).forEach(r => {
      m25[parseInt(r.date.split('-')[1])-1] += r.total;
    });
    datasets.push({ label:'2025', data: m25.map(v=>Math.round(v*100)/100),
      backgroundColor: (ctx) => ctx.raw > 1800 ? '#4f8ef7' : ctx.raw < 900 ? '#fca5a5' : 'rgba(79,142,247,0.38)',
      borderRadius:5, borderSkipped:false });
  }
  if (year === 'all' || year === '2024') {
    const m24 = Array(12).fill(0);
    data.filter(r=>r.date.startsWith('2024')).forEach(r => {
      m24[parseInt(r.date.split('-')[1])-1] += r.total;
    });
    datasets.push({ label:'2024', data: m24.map(v=>Math.round(v*100)/100),
      backgroundColor: 'rgba(199,216,255,0.7)', borderRadius:5, borderSkipped:false });
  }

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById('lineChart'), {
    type: 'bar',
    data: { labels: months, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{display:false}, tooltip:{callbacks:{label: v => v.dataset.label + ': $' + v.raw.toFixed(2)}} },
      scales: {
        x: { grid:{display:false}, ticks:{color:tickC,font:{size:11}} },
        y: { grid:{color:gridC}, ticks:{color:tickC,font:{size:11},callback:v=>'$'+v}}
      }
    }
  });

  // Donut
  const catTotals = {};
  data.forEach(r => { catTotals[r.category] = (catTotals[r.category]||0) + r.total; });
  if (donutChart) donutChart.destroy();
  donutChart = new Chart(document.getElementById('donutChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(catTotals),
      datasets:[{ data: Object.values(catTotals).map(v=>Math.round(v*100)/100),
        backgroundColor:['#4f8ef7','#34c989','#f5a623','#a0aec0'], borderWidth:0, hoverOffset:5 }]
    },
    options: {
      responsive:true, maintainAspectRatio:false, cutout:'65%',
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label: v => v.label+': $'+v.raw.toFixed(2)}} }
    }
  });

  // Region
  const east = data.filter(r=>r.region==='East').reduce((s,r)=>s+r.total,0);
  const west = data.filter(r=>r.region==='West').reduce((s,r)=>s+r.total,0);
  if (regionChart) regionChart.destroy();
  regionChart = new Chart(document.getElementById('regionChart'), {
    type:'bar',
    data:{ labels:['East','West'], datasets:[{
      data:[Math.round(east*100)/100, Math.round(west*100)/100],
      backgroundColor:['#4f8ef7','#34c989'], borderRadius:5, borderSkipped:false, barThickness:28
    }]},
    options:{
      responsive:true, maintainAspectRatio:false, indexAxis:'y',
      plugins:{legend:{display:false}, tooltip:{callbacks:{label:v=>'$'+v.raw.toFixed(2)}}},
      scales:{
        x:{grid:{color:gridC},ticks:{color:tickC,font:{size:11},callback:v=>'$'+(v/1000).toFixed(0)+'K'}},
        y:{grid:{display:false},ticks:{color:tickC,font:{size:12}}}
      }
    }
  });
}

// ── Metric Cards ──────────────────────────────────────────
function updateMetrics(data) {
  const total = data.reduce((s,r)=>s+r.total,0);
  const qty = data.reduce((s,r)=>s+r.qty,0);
  const aov = data.length ? total/data.length : 0;
  document.getElementById('m-revenue').textContent = fmtK(Math.round(total));
  document.getElementById('m-orders').textContent = data.length.toLocaleString();
  document.getElementById('m-units').textContent = qty.toLocaleString();
  document.getElementById('m-aov').textContent = fmt(Math.round(aov*100)/100);
}

// ── Product Bars ──────────────────────────────────────────
function updateProductBars(data) {
  const prod = {};
  data.forEach(r => { prod[r.product] = (prod[r.product]||0) + r.total; });
  const sorted = Object.entries(prod).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const max = sorted[0][1];
  const container = document.getElementById('productBars');
  container.innerHTML = sorted.map(([name,val]) => `
    <div class="bar-row-item">
      <span class="bar-name">${name}</span>
      <div class="bar-track">
        <div class="bar-fill-inner" style="width:${(val/max*100).toFixed(1)}%;background:#4f8ef7"></div>
      </div>
      <span class="bar-amount">${fmtK(Math.round(val))}</span>
    </div>
  `).join('');
}

// ── Table ─────────────────────────────────────────────────
let tableData = [];

function updateTable(data) {
  tableData = [...data].reverse();
  renderTable(tableData);
}

function renderTable(rows) {
  const catClass = { Cookies:'badge-cookies', Bars:'badge-bars', Crackers:'badge-crackers', Snacks:'badge-snacks' };
  document.getElementById('tableBody').innerHTML = rows.slice(0,50).map(r => `
    <tr>
      <td class="mono" style="color:#6b7280;font-size:12px">${r.id}</td>
      <td>${r.date}</td>
      <td>${r.region}</td>
      <td>${r.city}</td>
      <td><span class="badge ${catClass[r.category]||''}">${r.category}</span></td>
      <td>${r.product}</td>
      <td class="mono">${r.qty}</td>
      <td class="mono">$${r.unitPrice.toFixed(2)}</td>
      <td class="mono" style="font-weight:500">${fmt(r.total)}</td>
    </tr>
  `).join('');
}

function filterTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = tableData.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.city.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q) ||
    r.product.toLowerCase().includes(q) ||
    r.region.toLowerCase().includes(q)
  );
  renderTable(filtered);
}

// ── Export CSV ────────────────────────────────────────────
function exportCSV() {
  const data = getFilteredData();
  const header = 'ID,Date,Region,City,Category,Product,Qty,UnitPrice,Total\n';
  const rows = data.map(r =>
    `${r.id},${r.date},${r.region},${r.city},${r.category},${r.product},${r.qty},${r.unitPrice},${r.total}`
  ).join('\n');
  const blob = new Blob([header + rows], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'food-sales.csv';
  a.click();
}

// ── Year Filter ───────────────────────────────────────────
document.getElementById('yearFilter').addEventListener('change', () => {
  const data = getFilteredData();
  updateMetrics(data);
  initCharts(data);
  updateProductBars(data);
  updateTable(data);
});

// ── Init ──────────────────────────────────────────────────
(function init() {
  const data = getFilteredData();
  updateMetrics(data);
  initCharts(data);
  updateProductBars(data);
  updateTable(data);
})();
