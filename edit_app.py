with open('app.js', 'r', encoding='latin-1') as f:
    content = f.read()

# 1. Update INCOME_CATEGORIES
# Let's decode the emojis to latin-1 to match them, or use a more robust substring check.
# Emojis in latin-1 can look like weird symbols. Let's just find the const INCOME_CATEGORIES block.
# We can search for 'const INCOME_CATEGORIES = [' and locate the end of it '];'

start_idx = content.find('const INCOME_CATEGORIES = [')
if start_idx != -1:
    end_idx = content.find('];', start_idx)
    if end_idx != -1:
        old_block = content[start_idx:end_idx+2]
        print("Found old block:")
        # We will replace it with the new definition
        # Since python uses unicode internally, writing with latin-1 will encode the new unicode emojis to latin-1.
        # Wait, if we write with latin-1, emojis like 📈 (which are outside latin-1) will fail to encode!
        # Ah! That's correct. Emojis cannot be encoded into Latin-1 if they are not Latin-1.
        # But wait! The file ALREADY contains emojis, which means the file is actually encoded in UTF-8 (or maybe UTF-8 with BOM), but has some invalid UTF-8 bytes somewhere else.
        # Let's read the file as bytes (rb), find the UTF-8 representations, and do byte replacement, OR we can read/write as UTF-8 but using errors='ignore' or errors='replace'.
        # Actually, let's read the file using bytes (rb), or read as utf-8 with errors='surrogateescape'.
        # surrogateescape allows decoding invalid bytes to surrogate unicode characters, and then writing them back as utf-8 converts them back to the exact same invalid bytes!
        # This is a Python standard feature designed precisely for this scenario!
        pass

# Let's write the surrogateescape implementation.
with open('app.js', 'r', encoding='utf-8', errors='surrogateescape') as f:
    content = f.read()

old_income = """const INCOME_CATEGORIES = [
  {id:'Investments',icon:'📈',color:'#4fd1c5'},
  {id:'Freelance',icon:'💻',color:'#b794f4'},
  {id:'Gifts',icon:'🎁',color:'#f687b3'},
  {id:'Refunds',icon:'🔄',color:'#76e4f7'},
  {id:'Other Income',icon:'📌',color:'#8896b3'},
];"""

new_income = """const INCOME_CATEGORIES = [
  {id:'Investments',icon:'📈',color:'#4fd1c5'},
  {id:'Freelance / Side Hustle',icon:'💻',color:'#b794f4'},
  {id:'Gifts / Grants',icon:'🎁',color:'#f687b3'},
  {id:'Refunds',icon:'🔄',color:'#76e4f7'},
  {id:'Other Income',icon:'📌',color:'#8896b3'},
];"""

if old_income in content:
    content = content.replace(old_income, new_income)
    print('INCOME_CATEGORIES replaced successfully.')
else:
    content_normalized = content.replace('\r\n', '\n')
    old_income_norm = old_income.replace('\r\n', '\n')
    new_income_norm = new_income.replace('\r\n', '\n')
    if old_income_norm in content_normalized:
        content = content_normalized.replace(old_income_norm, new_income_norm)
        print('INCOME_CATEGORIES replaced successfully (normalized).')
    else:
        print('Warning: old_income block not found.')

old_state = "let activeStatsTab= 'overview';"
new_state = "let activeStatsTab= 'overview';\nlet activeStatsCatTab = 'expense';"
if old_state in content:
    content = content.replace(old_state, new_state)
    print('activeStatsCatTab added successfully.')
else:
    content_normalized = content.replace('\r\n', '\n')
    if old_state in content_normalized:
        content = content_normalized.replace(old_state, new_state)
        print('activeStatsCatTab added successfully (normalized).')
    else:
        print('Warning: old_state block not found.')

old_tab_func = """function setStatsTab(el,tab){
  document.querySelectorAll('.stats-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active'); activeStatsTab=tab;
  ['overview','categories','merchants','daily','compare'].forEach(id=>document.getElementById('stats-'+id).style.display=id===tab?'block':'none');
  renderStats();
}"""

new_tab_func = """function setStatsTab(el,tab){
  document.querySelectorAll('.stats-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active'); activeStatsTab=tab;
  ['overview','categories','merchants','daily','compare'].forEach(id=>document.getElementById('stats-'+id).style.display=id===tab?'block':'none');
  renderStats();
}
function switchStatsCatTab(tab) {
  activeStatsCatTab = tab;
  const btnExpense = document.getElementById('stats-cat-toggle-expense');
  const btnIncome = document.getElementById('stats-cat-toggle-income');
  if (btnExpense && btnIncome) {
    if (tab === 'expense') {
      btnExpense.classList.add('active');
      btnExpense.style.background = 'var(--accent)';
      btnExpense.style.color = '#0a0f1e';
      btnIncome.classList.remove('active');
      btnIncome.style.background = 'none';
      btnIncome.style.color = 'var(--text3)';
    } else {
      btnIncome.classList.add('active');
      btnIncome.style.background = 'var(--accent)';
      btnIncome.style.color = '#0a0f1e';
      btnExpense.classList.remove('active');
      btnExpense.style.background = 'none';
      btnExpense.style.color = 'var(--text3)';
    }
  }
  renderStats();
}"""

if old_tab_func in content:
    content = content.replace(old_tab_func, new_tab_func)
    print('switchStatsCatTab added successfully.')
else:
    content_normalized = content.replace('\r\n', '\n')
    old_tab_func_norm = old_tab_func.replace('\r\n', '\n')
    new_tab_func_norm = new_tab_func.replace('\r\n', '\n')
    if old_tab_func_norm in content_normalized:
        content = content_normalized.replace(old_tab_func_norm, new_tab_func_norm)
        print('switchStatsCatTab added successfully (normalized).')
    else:
        print('Warning: old_tab_func not found.')

old_render = """  if(activeStatsTab==='categories'){
    const catTotals={};expenses.forEach(t=>{catTotals[t.category]=(catTotals[t.category]||0)+getTxMonthAmount(t, viewYear, viewMonth);});
    const sorted=Object.entries(catTotals).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
    const maxAmt=sorted[0]?.[1]||1, cb=appData.catBudgets||{};
    document.getElementById('cat-bars').innerHTML=sorted.map(([id,amt])=>{
      const cat=CATEGORIES.find(c=>c.id===id)||{icon:'📌',color:'#8896b3'};
      const pct=totalSpent>0?Math.round((amt/totalSpent)*100):0;
      const limit=cb[id];
      const limitStr=limit?`<span class="cat-budget-left">${amt<=limit?fmt(limit-amt)+' left':'over by '+fmt(amt-limit)}</span>`:'';
      return `<div class="cat-bar-row"><div class="cat-bar-header"><div class="cat-bar-name">${cat.icon} ${id}</div><div class="cat-bar-right">${limitStr}<div class="cat-bar-pct">${pct}%</div><div class="cat-bar-amt">${fmt(amt)}</div></div></div><div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(amt/maxAmt)*100}%;background:${limit&&amt>limit?'var(--red)':cat.color}"></div></div></div>`;
    }).join('')||'<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-title">No data</div></div>';
  }"""

new_render = """  if(activeStatsTab==='categories'){
    const isIncome = (typeof activeStatsCatTab !== 'undefined' ? activeStatsCatTab : 'expense') === 'income';
    const targetTxs = isIncome ? incomes : expenses;
    const catList = isIncome ? INCOME_CATEGORIES : CATEGORIES;
    const totalAmt = isIncome ? totalIncome : totalSpent;
    const catTotals={};
    targetTxs.forEach(t=>{catTotals[t.category]=(catTotals[t.category]||0)+getTxMonthAmount(t, viewYear, viewMonth);});
    const sorted=Object.entries(catTotals).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
    const maxAmt=sorted[0]?.[1]||1, cb=appData.catBudgets||{};
    document.getElementById('cat-bars').innerHTML=sorted.map(([id,amt])=>{
      const cat=catList.find(c=>c.id===id)||{icon:'📌',color:'#8896b3'};
      const pct=totalAmt>0?Math.round((amt/totalAmt)*100):0;
      const limit=!isIncome ? cb[id] : null;
      const limitStr=limit?`<span class="cat-budget-left">${amt<=limit?fmt(limit-amt)+' left':'over by '+fmt(amt-limit)}</span>`:'';
      return `<div class="cat-bar-row"><div class="cat-bar-header"><div class="cat-bar-name">${cat.icon} ${id}</div><div class="cat-bar-right">${limitStr}<div class="cat-bar-pct">${pct}%</div><div class="cat-bar-amt">${fmt(amt)}</div></div></div><div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(amt/maxAmt)*100}%;background:${limit&&amt>limit?'var(--red)':cat.color}"></div></div></div>`;
    }).join('')||'<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-title">No data</div></div>';
  }"""

if old_render in content:
    content = content.replace(old_render, new_render)
    print('renderStats categories section updated successfully.')
else:
    content_normalized = content.replace('\r\n', '\n')
    old_render_norm = old_render.replace('\r\n', '\n')
    new_render_norm = new_render.replace('\r\n', '\n')
    if old_render_norm in content_normalized:
        content = content_normalized.replace(old_render_norm, new_render_norm)
        print('renderStats categories section updated successfully (normalized).')
    else:
        print('Warning: old_render not found.')

with open('app.js', 'w', encoding='utf-8', errors='surrogateescape') as f:
    f.write(content)
