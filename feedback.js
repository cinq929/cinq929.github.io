// Interview themes are paraphrased; all seed processing and replies are fictional demos.
const feedbackKey = 'sjtu-campus-feedback-v1';
const feedbackStatuses = ['全部', '待处理', '处理中', '已解决'];
const feedbackCategories = ['公共空间', '外卖快递', '卫浴洗衣', '环境卫生', '设施维修', '其他建议'];
const feedbackState = { status: '全部', search: '', page: 1, selected: 'fb-space', rating: 0 };
const feedbackSeeds = [
  { id: 'fb-space', title: '活动室占用状态不透明，容易撞时间', category: '公共空间', location: '演示 · 宿舍公共活动室', date: '2026-11-12 14:30', status: '处理中', description: '活动室目前依靠纸质登记，占用状态不容易提前了解。有时想开展小组或集体活动，到场才发现已有人自习或放置个人物品。希望能看清使用时段，也让不同用途的同学有机会协商。', impact: '集体活动难以安排，临时寻找场地增加往返时间。', tried: '尝试到现场查看纸质登记。', reply: '已记录这一使用冲突。可以先一起梳理实际使用时段与集体活动需求，再请相关管理人员核实可行的登记方式。线上预约和使用规则仍需确认。', updated: '11-12 16:20', notes: [], photos: [] },
  { id: 'fb-takeout', title: '饭点外卖架放不下，取餐不好找', category: '外卖快递', location: '演示 · 宿舍楼下取餐区', date: '2026-11-11 12:40', status: '待处理', description: '饭点外卖架容量不足，部分餐食放到地面；长时间无人领取的外卖占用位置，洒漏后也增加清理负担。希望一起确认高峰时段和滞留情况，再讨论分区指引。', impact: '取餐难找，地面餐食存在卫生隐患，保洁清理工作增加。', tried: '向同学询问各自取餐的高峰时间。', notes: [], photos: [] },
  { id: 'fb-clean', title: '聚餐后垃圾清运责任不明确', category: '环境卫生', location: '演示 · 宿舍中厅', date: '2026-11-10 19:20', status: '已解决', description: '中厅聚餐后，垃圾虽然做了收拢，但堆放位置与谁负责带走并不清楚。希望活动参与者提前约定收尾分工，避免把额外清理工作留给保洁。', impact: '公共空间使用受影响，保洁返岗后工作集中。', tried: '讨论活动结束时由参与者共同检查现场。', reply: '【处理结果演示】本条仅用于展示已解决后的评价流程，假设活动参与者已共同完成一次收尾检查。访谈并未提供已改善成果，真实清运方式与分工仍需向相关人员核实。', updated: '11-11 09:00', completed: '11-12 10:00', notes: [], photos: [] },
  { id: 'fb-shower', title: '浴室高峰拥挤，排队缺少指引', category: '卫浴洗衣', location: '演示 · 公共浴室', date: '2026-11-09 21:10', status: '处理中', description: '浴室高峰时段比较拥挤，缺少明确排队秩序。部分同学选择深夜使用，又可能影响周边休息。希望了解实际高峰与等待情况，找到兼顾使用和安静的办法。', impact: '同学等待时间不确定，深夜使用可能产生噪声。', tried: '向同学了解常用的洗浴时间。', reply: '建议先由自愿参与的同学记录高峰等待情况，不采集个人身份或浴室内影像。排队提示是否设置、如何维护，需要与使用者和管理人员共同确认。', updated: '11-10 10:00', notes: [], photos: [] },
  { id: 'fb-sort', title: '外卖汤水混入回收桶，清理负担大', category: '环境卫生', location: '演示 · 公共垃圾投放点', date: '2026-11-08 16:50', status: '待处理', description: '保洁访谈提到，带汤水的生活垃圾混入可回收桶，需要额外手动分拣、擦拭。多次提醒的效果有限，希望一起讨论更清楚的投放提示，以及同学之间的互相提醒。', impact: '增加保洁工作，也影响公共区域卫生。', tried: '已有通知提醒，但仍需要了解实际投放困难。', notes: [], photos: [] },
];
let feedbackItems = structuredClone(feedbackSeeds);
let feedbackLoadWarning = '';
try {
  const saved = JSON.parse(localStorage.getItem(feedbackKey) || 'null');
  if (saved?.version === 1 && Array.isArray(saved.items) && saved.items.every(f => typeof f.id === 'string' && typeof f.title === 'string' && typeof f.description === 'string' && feedbackStatuses.slice(1).includes(f.status) && Array.isArray(f.notes) && Array.isArray(f.photos))) feedbackItems = saved.items;
  else if (saved !== null) feedbackLoadWarning = '本地反馈格式无法读取，当前展示初始演示案例。';
} catch { feedbackLoadWarning = '本地反馈无法读取，当前展示初始演示案例。'; }
function feedbackSave(next) {
  try { localStorage.setItem(feedbackKey, JSON.stringify({ version: 1, items: next })); feedbackItems = next; return true; }
  catch { toast('保存失败：浏览器存储不可用或空间不足，请减少图片后重试。'); return false; }
}
function feedbackDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function feedbackBadge(f) { return `<span class="f-status f-status-${feedbackStatuses.indexOf(f.status)}">${esc(f.status)}</span>`; }
function feedbackMatches() { const q = feedbackState.search.trim().toLowerCase(); return feedbackItems.filter(f => (feedbackState.status === '全部' || f.status === feedbackState.status) && `${f.title} ${f.description} ${f.location} ${f.category}`.toLowerCase().includes(q)); }
function feedbackPage(id) {
  const matches = feedbackMatches();
  feedbackState.page = Math.max(1, Math.min(feedbackState.page, Math.ceil(matches.length / 5)));
  const requested = id && feedbackItems.find(f => f.id === id);
  if (requested && matches.includes(requested)) { feedbackState.selected = id; feedbackState.page = Math.floor(matches.indexOf(requested) / 5) + 1; }
  const pageItems = matches.slice((feedbackState.page - 1) * 5, feedbackState.page * 5);
  if (!pageItems.some(f => f.id === feedbackState.selected)) feedbackState.selected = pageItems[0]?.id || '';
  const selected = pageItems.find(f => f.id === feedbackState.selected);
  return portalShell(`${portalHeader()}<div class="f-workspace"><section class="f-left" aria-label="反馈列表"><div class="f-banner"><div class="f-banner-icon">${pIcon('list')}${pIcon('arrow')}</div><div><h2>问题反馈</h2><p>你的反馈，是我们改进的动力</p></div><span class="f-banner-orbit" aria-hidden="true"></span></div><div class="f-list-panel"><div class="f-filters" aria-label="按处理状态筛选">${feedbackStatuses.map(s => `<button data-feedback="filter" data-value="${s}" aria-pressed="${feedbackState.status === s}" class="${feedbackState.status === s ? 'is-active' : ''}">${s}</button>`).join('')}</div><label class="f-list-search">${pIcon('search')}<input id="feedback-search" type="search" placeholder="搜索反馈标题、地点或分类" aria-label="搜索反馈" maxlength="80" value="${esc(feedbackState.search)}"><span>${matches.length} 条</span></label><div class="f-items">${pageItems.map(f => `<button class="f-item ${f.id === selected?.id ? 'is-selected' : ''}" data-feedback="select" data-id="${esc(f.id)}" aria-pressed="${f.id === selected?.id}"><i></i><span class="f-item-copy"><strong>${esc(f.title)}</strong><span><b>${esc(f.category)}</b><time>${esc(f.date.slice(5))}</time></span></span>${feedbackBadge(f)}${pIcon('chevron')}</button>`).join('') || `<div class="f-empty">${pIcon('search')}<h3>没有找到相关反馈</h3><p>试试其他关键词或处理状态。</p><button data-feedback="reset">重置筛选</button></div>`}</div><div class="f-list-bottom"><div class="f-pages" aria-label="反馈分页"><button data-feedback="page" data-page="${feedbackState.page-1}" aria-label="上一页" ${feedbackState.page === 1 ? 'disabled' : ''}>‹</button>${Array.from({length: Math.ceil(matches.length/5)}, (_, i) => `<button class="${feedbackState.page === i+1 ? 'is-active' : ''}" data-feedback="page" data-page="${i+1}" aria-label="第 ${i+1} 页" ${feedbackState.page === i+1 ? 'aria-current="page"' : ''}>${i+1}</button>`).join('')}<button data-feedback="page" data-page="${feedbackState.page+1}" aria-label="下一页" ${feedbackState.page >= Math.ceil(matches.length/5) ? 'disabled' : ''}>›</button></div><button class="p-button" data-feedback="new">${pIcon('plus')}提交新反馈</button></div><p class="f-source">访谈问题匿名改写 · 处理状态与回复均为演示</p>${feedbackLoadWarning ? `<p role="alert" class="f-warning">${esc(feedbackLoadWarning)}</p>` : ''}</div></section><section class="f-detail" aria-label="反馈详情">${selected ? feedbackDetail(selected) : '<div class="f-detail-empty">'+pIcon('chat')+'<h2>每一件小事，都值得被听见</h2><p>选择一条反馈，或提出你遇到的问题。</p><button class="p-button" data-feedback="new">提交新反馈</button></div>'}</section></div>`);
}
function feedbackDetail(f) {
  const stage = feedbackStatuses.indexOf(f.status) - 1;
  return `<div class="f-detail-top"><button data-feedback="back">← <span>反馈列表</span></button>${feedbackBadge(f)}</div><div class="f-detail-title">${pIcon(f.category === '卫浴洗衣' ? 'shower' : 'home')}<h2>${esc(f.title)}</h2></div><div class="f-meta"><span>${pIcon('clock')}提交时间：${esc(f.date)}</span><span>${pIcon('pin')}${esc(f.location)}</span><span class="f-demo-tag">${f.local ? '本地记录' : '案例演示'}</span></div><ol class="f-timeline">${['提交反馈','处理中','待评价'].map((label, i) => `<li class="${i <= stage ? 'is-reached' : ''} ${i === stage ? 'is-current' : ''}"><span>${i < stage || stage === 2 ? '✓' : ''}</span><strong>${label}</strong><small>${i === 0 ? esc(f.date.slice(5)) : i === 1 ? esc(f.updated || '等待核实') : esc(f.completed || '处理完成后')}</small></li>`).join('')}</ol><section class="f-section"><h3>${pIcon('chat')}问题描述</h3><p>${esc(f.description)}</p>${f.impact ? `<p class="f-description-extra"><span>造成的影响</span>${esc(f.impact)}</p>` : ''}<div class="f-photos">${f.photos.length ? f.photos.map((photo, i) => `<button data-feedback="photo" data-id="${esc(f.id)}" data-index="${i}" aria-label="查看现场图片 ${i+1}"><img src="${feedbackSafePhoto(photo)}" alt="用户本地上传的现场图片 ${i+1}"></button>`).join('') : `<div class="f-photo-placeholder">${pIcon('building')}<span>暂无现场照片</span></div><div class="f-photo-note">可上传现场照片，帮助说明情况<br>在“补充情况”中添加即可</div>`}</div></section><section class="f-section f-reply"><h3>${pIcon('chat')}宿管回复 <small>演示</small></h3>${f.reply ? `<div class="f-reply-row"><img src="${portalArtwork}avatar.png" alt="演示宿管头像"><div><div class="f-reply-name">宿管老师 <span>· ${esc(f.updated)} · 预设回复</span></div><p>${esc(f.reply)}</p></div></div>` : `<div class="f-awaiting">${pIcon('clock')}等待相关人员确认。该记录仅在当前浏览器，尚未发送给宿管。</div>`}</section>${f.notes.length ? `<section class="f-section f-notes"><h3>${pIcon('people')}补充情况 <small>${f.notes.length} 条</small></h3>${f.notes.map(n => `<article><strong>${esc(n.name)}<time>${esc(n.date)}</time></strong><p>${esc(n.text)}</p></article>`).join('')}</section>` : ''}<div class="f-detail-tools"><span>${f.tried ? '已尝试：'+esc(f.tried) : '把时间、场景和影响说清楚，有助于共同核实。'}</span><button data-feedback="supplement" data-id="${esc(f.id)}">${pIcon('plus')}补充情况</button></div><section class="f-evaluation"><div><strong>${f.rating ? '感谢你的评价' : '请对本次处理结果进行评价'}</strong><small>${f.rating ? `已保存 ${f.rating} 星评价 · 当前浏览器` : f.status === '已解决' ? '处理结果为演示，可体验评价流程' : '处理完成后开放评价'}</small></div><div class="f-stars" role="group" aria-label="满意度评分">${[1,2,3,4,5].map(n => `<button data-feedback="rate" data-value="${n}" aria-label="${n} 星" aria-pressed="${(f.rating || feedbackState.rating) === n}" ${f.status !== '已解决' || f.rating ? 'disabled' : ''} class="${n <= (f.rating || feedbackState.rating) ? 'is-rated' : ''}">${pIcon('star')}</button>`).join('')}</div><button class="f-evaluate-submit" data-feedback="evaluate" data-id="${esc(f.id)}" ${f.status !== '已解决' || f.rating || !feedbackState.rating ? 'disabled' : ''}>${f.rating ? '已评价' : '提交评价'}</button></section>`;
}
function feedbackSafePhoto(photo) { return typeof photo === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) ? photo : ''; }
function feedbackForm(supplementId) {
  const f = feedbackItems.find(x => x.id === supplementId);
  portalDialog(f ? '补充情况' : '提交新反馈', f ? f.title : '把身边的小问题说清楚，一起寻找改善办法。', `<form id="feedback-form" data-feedback-id="${esc(f?.id || '')}" novalidate>${f ? '' : `<label class="field"><span>反馈标题 *</span><input name="title" required maxlength="60" placeholder="用一句话说明发生了什么"></label><div class="f-form-row"><label class="field"><span>问题分类 *</span><select name="category">${feedbackCategories.map(c => `<option>${c}</option>`).join('')}</select></label><label class="field"><span>发生地点 *</span><input name="location" required maxlength="60" value="${esc(portalProfile?.building || '')}" placeholder="例如：楼下取餐区"></label></div>`}<label class="field"><span>${f ? '补充内容' : '问题描述'} *</span><textarea name="description" required minlength="10" maxlength="1500" rows="4" placeholder="请说明时间、场景和发生的情况，至少 10 个字。"></textarea></label>${f ? '' : `<label class="field"><span>造成的影响 <small>选填</small></span><input name="impact" maxlength="300" placeholder="对你或其他人带来了哪些不便？"></label><label class="field"><span>已经尝试的办法 <small>选填</small></span><input name="tried" maxlength="300" placeholder="例如：到现场查看、与同学沟通"></label>`}<label class="field"><span>现场图片 <small>选填，最多 3 张，每张不超过 5 MB</small></span><input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple><small>请避开人脸、学号等个人信息。图片压缩后仅保存在当前浏览器。</small></label><p class="f-form-error" role="alert"></p><p class="f-local-note">演示模式 · 不会发送给学校或宿管，不等同于正式报修。</p><button class="p-button f-form-submit" type="submit">${f ? '保存补充' : '提交反馈'}${pIcon('arrow')}</button></form>`);
}
async function feedbackReadPhotos(files) {
  if (files.length > 3) throw new Error('一次最多添加 3 张图片。');
  return Promise.all(files.map(async file => {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) throw new Error('请使用不超过 5 MB 的 JPG、PNG 或 WebP 图片。');
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas'); const scale = Math.min(1, 1000/Math.max(bitmap.width,bitmap.height));
    canvas.width = Math.max(1,Math.round(bitmap.width*scale)); canvas.height = Math.max(1,Math.round(bitmap.height*scale));
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close();
    return canvas.toDataURL('image/jpeg',.7);
  }));
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-feedback]'); if (!b || b.disabled) return;
  const action = b.dataset.feedback;
  if (action === 'new' || action === 'supplement') { feedbackForm(action === 'supplement' ? b.dataset.id : ''); return; }
  if (action === 'filter') { feedbackState.status = b.dataset.value; feedbackState.page = 1; feedbackState.rating = 0; history.replaceState(null,'','#/feedback'); render(); }
  if (action === 'reset') { Object.assign(feedbackState,{status:'全部',search:'',page:1,rating:0}); history.replaceState(null,'','#/feedback'); render(); }
  if (action === 'select') { feedbackState.selected = b.dataset.id; feedbackState.rating = 0; history.replaceState(null,'',`#/feedback/${encodeURIComponent(b.dataset.id)}`); render(); }
  if (action === 'page') { feedbackState.page = Number(b.dataset.page); feedbackState.selected = ''; feedbackState.rating = 0; history.replaceState(null,'','#/feedback'); render(); }
  if (action === 'back') { document.querySelector('#feedback-search')?.focus(); }
  if (action === 'rate') { feedbackState.rating = Number(b.dataset.value); render(); document.querySelector(`.f-stars [data-value="${feedbackState.rating}"]`)?.focus(); }
  if (action === 'evaluate') {
    const next = structuredClone(feedbackItems); const f = next.find(x => x.id === b.dataset.id);
    if (!f || f.status !== '已解决' || f.rating || !feedbackState.rating) return;
    f.rating = feedbackState.rating; if (!feedbackSave(next)) return;
    feedbackState.rating = 0; render(); toast('评价已保存在当前浏览器。');
  }
  if (action === 'photo') { const f = feedbackItems.find(x => x.id === b.dataset.id); const src = feedbackSafePhoto(f?.photos[Number(b.dataset.index)]); if (src) portalDialog('现场图片','由用户上传，仅保存在当前浏览器。',`<img class="f-photo-large" src="${src}" alt="用户上传的现场图片">`); }
});
document.addEventListener('input', e => {
  if (e.target.id !== 'feedback-search' || e.isComposing) return;
  feedbackState.search = e.target.value; feedbackState.page = 1; feedbackState.rating = 0;
  const pos = e.target.selectionStart;
  history.replaceState(null,'','#/feedback'); render();
  const input = document.querySelector('#feedback-search'); input.focus(); if (pos !== null && input.type !== 'search') input.setSelectionRange(pos,pos);
});
document.addEventListener('compositionend', e => {
  if (e.target.id === 'feedback-search') e.target.dispatchEvent(new Event('input', { bubbles: true }));
});
document.addEventListener('submit', async e => {
  if (e.target.id !== 'feedback-form') return; e.preventDefault();
  const form = e.target; const submit = form.querySelector('[type="submit"]'); if (submit.disabled) return;
  const error = form.querySelector('.f-form-error'); const values = Object.fromEntries(new FormData(form));
  const description = String(values.description || '').trim(); const id = form.dataset.feedbackId;
  form.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
  const invalid = [...form.querySelectorAll('[required]')].find(x => !x.value.trim() || (x.name === 'description' && description.length < 10));
  if (invalid) { error.textContent = invalid.name === 'description' ? '请用至少 10 个字说明具体情况。' : '请填写标题和发生地点，不能只输入空格。'; invalid.setAttribute('aria-invalid','true'); invalid.focus(); return; }
  submit.disabled = true; submit.textContent = '正在保存…'; error.textContent = '';
  try {
    const photos = await feedbackReadPhotos([...form.elements.photos.files]);
    const next = structuredClone(feedbackItems); let savedId = id;
    if (id) { const f = next.find(x => x.id === id); if (!f) throw new Error('未找到对应反馈，请关闭后重试。'); if (f.photos.length+photos.length > 3) throw new Error('每条反馈最多保存 3 张图片。'); f.notes.push({name:portalProfile?.name || '访客',text:description,date:feedbackDate()}); f.photos.push(...photos); }
    else { savedId = 'fb-'+crypto.randomUUID(); next.unshift({id:savedId,title:String(values.title).trim(),category:feedbackCategories.includes(values.category)?values.category:'其他建议',location:String(values.location).trim(),description,impact:String(values.impact||'').trim(),tried:String(values.tried||'').trim(),date:feedbackDate(),status:'待处理',local:true,notes:[],photos}); }
    if (!feedbackSave(next)) return;
    feedbackState.status = '全部'; feedbackState.search = ''; feedbackState.page = 1; feedbackState.selected = savedId; feedbackState.rating = 0;
    modal.close(); history.replaceState(null,'',`#/feedback/${savedId}`); render(); toast(id ? '补充已保存，处理状态不会自动改变。' : '反馈已保存到当前浏览器，尚未发送给学校或宿管。');
  } catch (err) { error.textContent = err.message || '图片无法读取，请更换图片后重试。'; }
  finally { submit.disabled = false; submit.textContent = id ? '保存补充 →' : '提交反馈 →'; }
});
