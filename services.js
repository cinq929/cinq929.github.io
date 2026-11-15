// A campus reference map with explicitly illustrative service locations.
const serviceRooms = [
  { id: 'room-a', name: '演示 · 讨论室 A', building: '东区 1 号楼', use: '小组讨论', capacity: 8, x: 32, y: 38 },
  { id: 'room-b', name: '演示 · 党团活动室 B', building: '东区 2 号楼', use: '党团活动', capacity: 20, x: 56, y: 29 },
  { id: 'room-c', name: '演示 · 共学室 C', building: '西区 3 号楼', use: '自习阅读', capacity: 12, x: 43, y: 65 },
];
const serviceDormPoints = portalBuildings.map((name, i) => ({ id: `dorm-${i}`, name, kind: '宿舍楼', x: [20, 46, 24, 60][i], y: [29, 18, 59, 54][i] }));
const servicePoints = [...serviceDormPoints, ...serviceRooms.map(r => ({ ...r, kind: '活动室' }))];
const serviceHours = [9, 11, 13, 15, 17, 19];
const serviceStorageKey = 'sjtu-campus-services-v1';
const serviceState = { kind: '全部', search: '', selected: '', room: 'room-a', day: 0, zoom: 1, utilityBuilding: '', queueScenario: 0, advance: 0 };
let serviceRecords = { version: 1, bookings: [], follows: [] };
let serviceStorageWarning = '';
try {
  const saved = JSON.parse(localStorage.getItem(serviceStorageKey) || 'null');
  if (saved?.version === 1 && Array.isArray(saved.bookings) && Array.isArray(saved.follows) && saved.bookings.every(b => typeof b.id === 'string' && serviceRooms.some(r => r.id === b.room) && typeof b.date === 'string' && serviceHours.includes(b.hour) && typeof b.purpose === 'string' && Number.isInteger(b.people) && b.people >= 1 && b.people <= serviceRooms.find(r => r.id === b.room).capacity) && saved.follows.every(f => typeof f === 'string')) serviceRecords = saved;
  else if (saved !== null) serviceStorageWarning = '本地服务记录格式无法读取，当前显示初始演示。';
} catch { serviceStorageWarning = '本地服务记录无法读取，当前显示初始演示。'; }
function serviceSave(records) {
  try { localStorage.setItem(serviceStorageKey, JSON.stringify(records)); serviceRecords = records; return true; }
  catch { toast('未能保存，请允许浏览器本地存储后重试。'); return false; }
}
function serviceDate(offset = serviceState.day) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function serviceSlot(hour) { return `${String(hour).padStart(2,'0')}:00 – ${String(hour+2).padStart(2,'0')}:00`; }
function serviceAvailablePoints() {
  const q = serviceState.search.trim().toLowerCase();
  return servicePoints.filter(p => (serviceState.kind === '全部' || serviceState.kind === p.kind) && `${p.name}${p.building || ''}${p.use || ''}`.toLowerCase().includes(q));
}
function serviceBookingStatus(room, hour, day = serviceState.day) {
  const booking = serviceRecords.bookings.find(b => b.room === room && b.hour === hour && b.date === serviceDate(day));
  if (booking) return { state: 'local', label: '我的记录', booking };
  const i = serviceRooms.findIndex(r => r.id === room);
  if ((serviceHours.indexOf(hour) + i * 2 + day) % 5 === 1) return { state: 'busy', label: '已占用' };
  return { state: 'free', label: '可预约' };
}
function servicesPage(query) {
  if (new URLSearchParams(query).get('mode') === 'dorms') { serviceState.kind = '宿舍楼'; serviceState.search = ''; serviceState.selected = serviceDormPoints.find(p => p.name === portalProfile?.building)?.id || 'dorm-0'; }
  if (!serviceState.selected) serviceState.selected = serviceDormPoints.find(p => p.name === portalProfile?.building)?.id || 'dorm-0';
  if (!serviceState.utilityBuilding) serviceState.utilityBuilding = portalProfile?.building || portalBuildings[0];
  const points = serviceAvailablePoints();
  if (!points.some(p => p.id === serviceState.selected)) serviceState.selected = points[0]?.id || '';
  const selected = points.find(p => p.id === serviceState.selected);
  return portalShell(`${portalHeader()}<div class="s-page"><header class="s-heading"><div><span class="s-eyebrow">YOUR EVERYDAY, A LITTLE EASIER</span><h1>宿舍服务<span>从一张地图，找到身边的便利。</span></h1></div><nav aria-label="服务页面分区">${[['map','空间导览','map'],['booking','活动室预约','calendar'],['shower','洗澡排队','shower'],['laundry','洗衣进度','laundry']].map(([id,label,icon]) => `<button data-service="section" data-section="${id}">${serviceIcon(icon)}${label}</button>`).join('')}</nav></header>
    <section class="s-map-card" id="service-map"><div class="s-section-heading"><div><h2>${pIcon('map')}在校园里，找到你的下一站</h2><p>点选楼栋切换宿舍，或查看不同楼栋的演示活动室。</p></div><a href="https://map.sjtu.edu.cn/" target="_blank" rel="noopener noreferrer">交大官方地图 ${pIcon('external')}</a></div><div class="s-map-toolbar"><div class="s-map-filters">${['全部','宿舍楼','活动室'].map(kind => `<button data-service="filter" data-kind="${kind}" aria-pressed="${serviceState.kind === kind}" class="${serviceState.kind === kind ? 'is-active' : ''}">${kind}</button>`).join('')}</div><label class="s-map-search">${pIcon('search')}<input id="service-map-search" type="text" role="searchbox" aria-label="搜索楼栋或活动室" placeholder="搜索楼栋、活动室或用途" maxlength="60" value="${esc(serviceState.search)}"><span>${points.length} 个点位</span></label></div>
    <div class="s-map-viewport"><div class="s-map-layer" style="transform:scale(${serviceState.zoom})"><img class="s-map-art" src="${portalArtwork}campus-culture-map.jpg" alt="交大闵行校区人文手绘地图参考图，叠加点位仅供交互演示">${points.map(p => `<button style="left:${p.x}%;top:${p.y}%" data-service="point" data-id="${p.id}" aria-pressed="${selected?.id === p.id}" class="s-pin ${p.kind === '活动室' ? 'is-room' : ''} ${selected?.id === p.id ? 'is-selected' : ''}"><span>${pIcon(p.kind === '活动室' ? 'flag' : 'home')}</span><b>${esc(p.name.replace('演示 · ',''))}${p.kind === '宿舍楼' && p.name === portalProfile?.building ? '<small>当前</small>' : ''}</b></button>`).join('')}</div><div class="s-map-label"><span class="p-dot"></span>手绘校园导览 <i>·</i> 点位为演示，非实际测绘</div><div class="s-map-zoom"><button data-service="zoom" data-change="0.2" aria-label="放大地图" ${serviceState.zoom >= 1.6 ? 'disabled' : ''}>＋</button><button data-service="zoom" data-change="-0.2" aria-label="缩小地图" ${serviceState.zoom <= 1 ? 'disabled' : ''}>−</button><button data-service="zoom-reset" aria-label="重置地图">${pIcon('map')}</button></div>${selected ? serviceMapDetail(selected) : `<div class="s-map-info s-map-empty">${pIcon('search')}<h3>没有匹配的点位</h3><p>换个关键词，或看看其他用途。</p><button data-service="reset-map">重置筛选</button></div>`}</div><div class="s-map-caption"><span>${pIcon('info')}地图为项目已有的人文地图参考图；楼栋与空间服务信息均为演示，使用规则待核实。</span><span>闵行校区 · 参考导览</span></div></section>
    ${serviceSchedule()}<div class="s-utilities-heading"><div><span class="s-eyebrow">MAKE ROOM FOR A BETTER DAY</span><h2>洗漱与洗衣，不必一直等在楼下。</h2><p>选择楼栋，看看排队情况和洗衣进度。</p></div><label>查看楼栋<select id="service-utility-building" aria-label="洗澡洗衣楼栋">${portalBuildings.map(b => `<option ${b === serviceState.utilityBuilding ? 'selected' : ''}>${b}</option>`).join('')}</select></label></div><div class="s-utilities">${serviceShower()}${serviceLaundry()}</div>${serviceStorageWarning ? `<p class="s-warning" role="alert">${esc(serviceStorageWarning)}</p>` : ''}</div>`);
}
function serviceIcon(name) {
  return name === 'laundry' ? '<svg class="p-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="3"/><circle cx="12" cy="14" r="5"/><path d="M7 6h1m3 0h6M8 14c2-3 5 3 8 0"/></svg>' : pIcon(name);
}
function serviceMapDetail(p) {
  const dorm = p.kind === '宿舍楼';
  const current = p.name === portalProfile?.building;
  return `<aside class="s-map-info"><span class="s-info-type">${pIcon(dorm ? 'home' : 'flag')}${dorm ? '演示楼栋' : '公共空间 · 演示'}</span><h3>${esc(p.name)}</h3><p>${dorm ? '点选地图上的楼栋，更新你的校园名片。' : `${esc(p.building)}（位置示意）<br>${esc(p.use)} · 演示容纳 ${p.capacity} 人`}</p><div class="s-info-chips">${dorm ? '<span>楼栋位置示意</span><span>不代表入住办理</span>' : '<span>预约信息演示</span><span>使用权限待核实</span>'}</div>${dorm ? `<button class="p-button" data-service="set-dorm" data-id="${p.id}" ${current ? 'disabled' : ''}>${current ? '已是当前宿舍' : '设为当前宿舍'}${pIcon(current ? 'check' : 'arrow')}</button>` : `<button class="p-button" data-service="room-schedule" data-id="${p.id}">查看预约时间 ${pIcon('arrow')}</button>`}<small>${dorm ? '切换楼栋将清空原房间号，姓名保留。' : '开放时间、可使用人群、跨楼使用权限待核实。'}</small></aside>`;
}
function serviceSchedule() {
  const date = serviceDate();
  const selectedRoom = serviceRooms.find(r => r.id === serviceState.room);
  const bookings = serviceRecords.bookings.filter(b => b.date === date);
  return `<section class="s-booking-card" id="service-booking"><div class="s-section-heading"><div><h2>${pIcon('calendar')}把下一次讨论，安排在这里</h2><p>活动室预约情况 · 点选空闲时段，体验一份本地预约。</p></div><div class="s-date-tabs">${[0,1,2].map(day => `<button data-service="day" data-day="${day}" class="${serviceState.day === day ? 'is-active' : ''}" aria-pressed="${serviceState.day === day}"><strong>${['今天','明天','后天'][day]}</strong><small>${serviceDate(day).slice(5).replace('-',' / ')}</small></button>`).join('')}</div></div><div class="s-schedule-summary"><span>${esc(selectedRoom.name)} <i>·</i> ${esc(selectedRoom.building)}（示意）</span><div class="s-legend"><span><i class="free"></i>可预约</span><span><i class="busy"></i>演示占用</span><span><i class="local"></i>我的记录</span></div></div><div class="s-timetable-scroll"><div class="s-timetable">${serviceRooms.map(r => `<div class="s-schedule-row ${r.id === serviceState.room ? 'is-selected' : ''}"><button class="s-room-label" data-service="room" data-id="${r.id}"><span>${pIcon('flag')}<strong>${esc(r.name.replace('演示 · ',''))}</strong></span><small>${esc(r.building)} · ${r.capacity} 人 · 演示</small></button>${serviceHours.map(hour => { const status = serviceBookingStatus(r.id,hour); return `<button class="s-time-slot ${status.state}" data-service="slot" data-room="${r.id}" data-hour="${hour}" aria-label="${esc(r.name)} ${date} ${serviceSlot(hour)} ${status.label}" ${status.state === 'busy' ? 'disabled' : ''}><span>${serviceSlot(hour).replaceAll(':00','').replace(' – ',' – ')}</span><b>${status.label}</b>${status.state === 'local' ? pIcon('check') : ''}</button>`; }).join('')}</div>`).join('')}<div class="s-time-axis"><span>时间轴</span><div>${[...serviceHours,21].map(hour => `<span>${String(hour).padStart(2,'0')}:00</span>`).join('')}</div></div></div></div><div class="s-booking-foot"><span>${pIcon('info')}演示场地及时间；开放规则、审批方式与跨楼权限待核实。</span><a href="#/spaces">更多空间信息 ${pIcon('chevron')}</a></div>${bookings.length ? `<div class="s-my-bookings"><h3>${pIcon('check')}当天的本地预约 <small>${bookings.length} 条</small></h3>${bookings.map(b => `<div><span><b>${esc(serviceRooms.find(r => r.id === b.room).name)}</b><small>${serviceSlot(b.hour)} · ${esc(b.purpose)} · ${b.people} 人</small></span><button data-service="cancel-booking" data-id="${esc(b.id)}">取消本地预约</button></div>`).join('')}</div>` : ''}</section>`;
}
function serviceShower() {
  const i = portalBuildings.indexOf(serviceState.utilityBuilding);
  const count = [3,5,2,0][(i + serviceState.queueScenario) % 4];
  return `<section class="s-utility-card s-shower-card" id="service-shower"><div class="s-section-heading"><div><h2>${pIcon('shower')}洗澡排队</h2><p>${esc(serviceState.utilityBuilding)} · 数据演示</p></div><span class="s-soft-tag"><span class="p-dot"></span>${count === 0 ? '较空闲' : '有同学在等'}</span></div><div class="s-shower-content"><div class="s-queue-ring" style="--queue-fill:${count ? 74 : 15}%">${pIcon('shower')}<strong>${count}<small>人</small></strong><span>当前排队 · 演示</span></div><div class="s-shower-stats"><div><span>预计等待</span><strong>${count ? count * 2 + 2 : 0}<small> 分钟</small></strong></div><div><span>演示高峰时段</span><strong class="s-peak-time">18:00 – 22:00</strong><div class="s-peak-bars" aria-hidden="true">${[10,15,14,24,32,45,64,52,35,20].map(h => `<i style="height:${h}%"></i>`).join('')}</div></div></div></div><div class="s-shower-foot"><p>这里展示模拟排队情况，实际等待请以现场为准。</p><button data-service="queue-scenario">切换演示状态 ${pIcon('arrow')}</button></div></section>`;
}
function serviceMachines() {
  return [
    { id: '01', status: serviceState.advance >= 18 ? 'free' : 'washing', total: 40, left: Math.max(0,18-serviceState.advance) },
    { id: '02', status: 'free', total: 40, left: 0 },
    { id: '03', status: serviceState.advance >= 8 ? 'free' : 'washing', total: 35, left: Math.max(0,8-serviceState.advance) },
    { id: '04', status: 'maintenance', total: 0, left: 0 },
  ];
}
function serviceLaundry() {
  const machines = serviceMachines();
  return `<section class="s-utility-card s-laundry-card" id="service-laundry"><div class="s-section-heading"><div><h2>${serviceIcon('laundry')}洗衣进度</h2><p>${esc(serviceState.utilityBuilding)} · 设备状态演示</p></div><span class="s-soft-tag"><span class="p-dot"></span>${machines.filter(m => m.status === 'free').length} 台空闲</span></div><div class="s-machines">${machines.map(m => { const followed = serviceRecords.follows.includes(`${serviceState.utilityBuilding}/${m.id}`); const label = m.status === 'free' ? '空闲可用' : m.status === 'washing' ? '洗衣中' : '维护中'; return `<article class="s-machine ${m.status}"><div class="s-machine-icon">${serviceIcon('laundry')}</div><div class="s-machine-copy"><div><strong>${m.id} 号洗衣机</strong><span>${label}</span></div>${m.status === 'washing' ? `<p>演示剩余 <b>${m.left}</b> 分钟</p><div class="s-machine-track"><i style="width:${(1-m.left/m.total)*100}%"></i></div>` : `<p>${m.status === 'free' ? '请以现场机器状态为准' : '演示维护状态，暂不展示进度'}</p>`}</div><button data-service="follow" data-id="${m.id}" aria-pressed="${followed}" ${m.status === 'maintenance' ? 'disabled' : ''}>${followed ? '已关注' : '关注进度'}</button></article>`; }).join('')}</div><div class="s-laundry-foot"><p>关注仅记在本浏览器，暂不发送完成通知。</p><button data-service="advance" ${serviceState.advance >= 20 ? 'disabled' : ''}>${serviceState.advance >= 20 ? '演示已完成' : '推进 5 分钟演示'} ${pIcon('clock')}</button>${serviceState.advance ? '<button data-service="reset-progress">重置</button>' : ''}</div></section>`;
}
function serviceAfterRender(query) {
  const params = new URLSearchParams(query); const section = params.get('section');
  if (query) history.replaceState(null,'','#/services');
  if (['map','booking','shower','laundry'].includes(section)) requestAnimationFrame(() => document.querySelector(`#service-${section}`)?.scrollIntoView({block:'start'}));
}
function serviceBookingDialog(roomId, hour) {
  const room = serviceRooms.find(r => r.id === roomId); if (!room || !serviceHours.includes(hour)) return;
  const status = serviceBookingStatus(roomId,hour); if (status.state === 'busy') return;
  if (status.state === 'local') { portalDialog('本地预约记录','仅保存在当前浏览器，尚未提交真实申请。',`<div class="s-confirm-summary"><h3>${esc(room.name)}</h3><p>${serviceDate()} · ${serviceSlot(hour)}</p><p>${esc(status.booking.purpose)} · ${status.booking.people} 人</p></div><button class="p-button" data-service="cancel-booking" data-id="${esc(status.booking.id)}">取消这份本地预约</button>`); return; }
  portalDialog('预约一段共创时间','演示预约 · 不占用真实场地，不代表管理许可。',`<div class="s-confirm-summary"><h3>${esc(room.name)}</h3><p>${esc(room.building)}（示意） · ${serviceDate()} · ${serviceSlot(hour)}</p></div><form id="service-booking-form" data-room="${room.id}" data-hour="${hour}" data-date="${serviceDate()}" novalidate><label class="field"><span>活动用途 *</span><input name="purpose" maxlength="60" required placeholder="例如：课程小组讨论"></label><label class="field"><span>预计人数 * <small>演示容量 ${room.capacity} 人</small></span><input name="people" type="number" min="1" max="${room.capacity}" value="2" required></label><p class="s-form-error" role="alert"></p><p class="s-local-note">使用人群、开放规则与跨楼使用权限待核实。预约仅保存在当前浏览器。</p><button class="p-button" type="submit">保存演示预约 ${pIcon('check')}</button></form>`);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-service]'); if (!b || b.disabled) return;
  const action = b.dataset.service;
  if (action === 'section') { document.querySelector(`#service-${b.dataset.section}`)?.scrollIntoView({behavior:'smooth',block:'start'}); return; }
  if (action === 'filter') { serviceState.kind = b.dataset.kind; render(); }
  if (action === 'reset-map') { serviceState.kind = '全部'; serviceState.search = ''; serviceState.zoom = 1; render(); }
  if (action === 'point') { serviceState.selected = b.dataset.id; if (serviceRooms.some(r => r.id === b.dataset.id)) serviceState.room = b.dataset.id; render(); }
  if (action === 'zoom') { serviceState.zoom = Math.max(1,Math.min(1.6,Math.round((serviceState.zoom+Number(b.dataset.change))*10)/10)); render(); }
  if (action === 'zoom-reset') { serviceState.zoom = 1; render(); }
  if (action === 'set-dorm') {
    const point = serviceDormPoints.find(p => p.id === b.dataset.id); if (!point) return;
    if (!portalProfile) { toast('请先填写校园名片，再设置当前宿舍。'); location.hash = '/welcome'; return; }
    if (!portalSave({...portalProfile,building:point.name,room:''})) return;
    serviceState.utilityBuilding = point.name; serviceState.advance = 0; render(); toast(`已将${point.name}设为当前宿舍，首页已同步。`);
  }
  if (action === 'room-schedule' || action === 'room') {
    if (!serviceRooms.some(r => r.id === b.dataset.id)) return;
    serviceState.room = b.dataset.id;
    if (action === 'room') { serviceState.selected = b.dataset.id; serviceState.kind = '全部'; serviceState.search = ''; }
    render(); if (action === 'room-schedule') document.querySelector('#service-booking').scrollIntoView({behavior:'smooth',block:'start'});
  }
  if (action === 'day') { serviceState.day = Number(b.dataset.day); render(); }
  if (action === 'slot') serviceBookingDialog(b.dataset.room,Number(b.dataset.hour));
  if (action === 'cancel-booking') {
    const next = {...serviceRecords,bookings:serviceRecords.bookings.filter(item => item.id !== b.dataset.id)};
    if (!serviceSave(next)) return;
    if (modal.open) modal.close(); render(); toast('本地预约已取消，该时段恢复为演示空闲。');
  }
  if (action === 'queue-scenario') { serviceState.queueScenario = (serviceState.queueScenario+1)%4; render(); }
  if (action === 'follow') {
    const key = `${serviceState.utilityBuilding}/${b.dataset.id}`;
    const followed = serviceRecords.follows.includes(key);
    if (!serviceSave({...serviceRecords,follows:followed ? serviceRecords.follows.filter(k => k !== key) : [...serviceRecords.follows,key]})) return;
    render(); toast(followed ? '已取消本地关注。' : '已关注进度，仅保存在当前浏览器，暂不发送通知。');
  }
  if (action === 'advance') { serviceState.advance += 5; render(); }
  if (action === 'reset-progress') { serviceState.advance = 0; render(); }
});
function serviceMapSearch(input) {
  const pos = input.selectionStart; serviceState.search = input.value; render();
  const next = document.querySelector('#service-map-search'); next.focus({preventScroll:true}); next.setSelectionRange(pos,pos);
}
document.addEventListener('input', e => { if (e.target.id === 'service-map-search' && !e.isComposing) serviceMapSearch(e.target); });
document.addEventListener('compositionend', e => { if (e.target.id === 'service-map-search') serviceMapSearch(e.target); });
document.addEventListener('change', e => {
  if (e.target.id !== 'service-utility-building') return;
  if (!portalBuildings.includes(e.target.value)) return;
  serviceState.utilityBuilding = e.target.value; serviceState.advance = 0; serviceState.queueScenario = 0; render();
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'service-booking-form') return; e.preventDefault();
  const form = e.target; const values = Object.fromEntries(new FormData(form)); const purpose = String(values.purpose || '').trim(); const people = Number(values.people);
  const room = serviceRooms.find(r => r.id === form.dataset.room); const hour = Number(form.dataset.hour); const date = form.dataset.date;
  const error = form.querySelector('.s-form-error');
  if (!purpose) { error.textContent = '请填写活动用途，不能只输入空格。'; form.elements.purpose.focus(); return; }
  if (!room || !Number.isInteger(people) || people < 1 || people > room.capacity) { error.textContent = `人数应为 1–${room?.capacity || 1} 之间的整数。`; form.elements.people.focus(); return; }
  if (date !== serviceDate() || serviceBookingStatus(room.id,hour).state !== 'free') { error.textContent = '日期或时段状态已变化，请关闭后重新选择。'; return; }
  const booking = {id:crypto.randomUUID(),room:room.id,hour,date,purpose,people};
  if (!serviceSave({...serviceRecords,bookings:[...serviceRecords.bookings,booking]})) { error.textContent = '保存失败，表单已保留，请检查浏览器存储。'; return; }
  modal.close(); render(); toast('演示预约已保存到当前浏览器，未提交真实申请。');
});
