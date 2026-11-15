// The reference-matched welcome page and campus dashboard.
const portalStorageKey = 'sjtu-campus-profile-v1';
const portalBuildings = ['东区 1 号楼', '东区 2 号楼', '西区 1 号楼', '西区 3 号楼'];
const portalArtwork = 'assets/reference-ui/';
const portalState = { community: '“宿”说安全', slot: '', search: '', searchOpen: false };
let portalProfile = null;
try {
  const saved = JSON.parse(localStorage.getItem(portalStorageKey) || 'null');
  if (saved?.version === 1 && typeof saved.name === 'string' && saved.name.trim() && portalBuildings.includes(saved.building)) {
    portalProfile = { ...saved, room: typeof saved.room === 'string' ? saved.room : '' };
  }
} catch { /* An unreadable profile returns to the welcome form. */ }

const portalPaths = {
  shower: '<path d="M12 3v3m-6 8a6 6 0 0 1 12 0H6Zm-2 0h16M7 18l-.5 2M12 18v2M17 18l.5 2"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  heart: '<path d="M20.5 4.5a5.2 5.2 0 0 0-8.5 1 5.2 5.2 0 0 0-8.5-1C-1 9 7 17 12 21c5-4 13-12 8.5-16.5Z"/>',
  bell: '<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Zm4 3a3 3 0 0 0 6 0M12 2v2"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 2v6m8-6v6M4 11h16M8 15h2m4 0h2m-8 3h2"/>',
  building: '<path d="M5 21V4h14v17M3 21h18M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3"/>',
  community: '<path d="m3 10 9-7 9 7M5 9v12h5v-5h4v5h5V9"/><circle cx="12" cy="10" r="2"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  share: '<path d="m14 3 7 7-7 7v-5C7 12 5 15 3 20c0-10 5-14 11-14Z"/>',
  star: '<path d="m12 2 3 6.5 7 .9-5 5 1.2 7L12 18l-6.2 3.4L7 14.4l-5-5 7-.9Z"/>',
  service: '<circle cx="12" cy="6" r="4"/><path d="M7 13H5a2 2 0 0 0-2 2l1 6h5l3-3 3 3h5l1-6a2 2 0 0 0-2-2h-2M8 13l4 5 4-5"/>',
  music: '<path d="M9 18V5l11-3v14M9 8l11-3"/><ellipse cx="5.5" cy="18" rx="3.5" ry="3"/><ellipse cx="16.5" cy="16" rx="3.5" ry="3"/>',
  basketball: '<circle cx="12" cy="12" r="10"/><path d="m5 5 14 14M5 19 19 5M2 10c5 1 10-2 12-8M10 22c1-5 4-10 12-12"/>',
};
function pIcon(name, cls = '') {
  return `<svg class="p-icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${portalPaths[name] || icons[name] || icons.chat}</svg>`;
}
function portalSave(profile) {
  try {
    localStorage.setItem(portalStorageKey, JSON.stringify(profile));
    portalProfile = profile;
    return true;
  } catch {
    toast('浏览器未允许本地保存，请检查存储设置后重试。');
    return false;
  }
}
function portalGoHome() {
  if (location.hash === '#/') render(true);
  else location.hash = '/';
}
function portalSidebar(welcome = false) {
  const page = location.hash.slice(2).split(/[/?]/)[0] || 'home';
  const active = welcome || page === 'welcome' ? 'profile' : page;
  const links = [['home','/','home','首页'],['services','/services','service','宿舍服务'],['activities','/activities','calendar','校园活动'],['feedback','/feedback','chat','问题反馈'],['community','/community','people','交大家园'],['profile','/profile','user','个人中心']];
  return `<aside class="p-sidebar"><a class="p-brand" href="#/" aria-label="交大宿舍共创首页"><img src="${portalArtwork}sjtu-logo-red.png" alt="上海交通大学 Shanghai Jiao Tong University"></a><nav class="p-navigation" aria-label="校园导航">${links.map(([id,href,icon,label]) => `<a href="#${href}" class="${active === id ? 'is-active' : ''}" ${active === id ? 'aria-current="page"' : ''}>${pIcon(icon)}<span>${label}</span></a>`).join('')}</nav><div class="p-sidebar-bottom"><img src="${portalArtwork}tower.png" alt="校园钟楼插画"><p>交大 · 一起更好</p></div></aside>`;
}
function portalShell(content, welcome = false) {
  return `<div class="p-ambient" aria-hidden="true"><svg viewBox="0 0 1536 1024" preserveAspectRatio="none"><path class="p-ribbon-white" d="M-20 130C45-60 279-39 324 99S87 213 69 125 202 35 268 139M929 319C1100 308 1501 553 1388 827s90 95 176-76"/><path class="p-ribbon-green" d="M1070 110c97-39 157-44 143-82s-53 39 10 29 61-10 92-29M142 931c78 70 198 56 252-25"/></svg></div><section class="p-shell ${welcome ? 'p-shell-welcome' : ''}">${portalSidebar(welcome)}<div class="p-content ${welcome ? 'p-welcome-content' : ''}">${content}</div></section><div class="p-demo-footer"><span class="p-dot"></span>演示模式<span>·</span>服务数据与楼栋为场景演示<span>·</span>填写的信息仅保存在当前浏览器</div>`;
}

function portalWelcome() {
  const profile = portalProfile;
  return portalShell(`<header class="p-welcome-top"><span>WELCOME TO YOUR CAMPUS LIFE</span><button data-action="about">关于这个项目 ${pIcon('external')}</button></header>
    <div class="p-welcome-grid">
      <section class="p-welcome-story"><div class="p-welcome-story-copy"><span class="p-eyebrow"><span class="p-dot"></span>属于你的交大日常</span><h1>在交大，<br>把日子过成<br><em>喜欢的样子。</em></h1><p>从一间宿舍，到一整个校园。<br>让生活的每一件小事，都有温暖的回应。</p></div>
        <div class="p-welcome-art"><img class="p-welcome-student" src="${portalArtwork}student.png" alt="背着书包走在校园中的学生插画"><img class="p-welcome-tower" src="${portalArtwork}tower.png" alt="校园钟楼插画"><span class="p-art-note">参考插画</span><div class="p-art-note-card">${pIcon('leaf')}新的相遇，从这里开始。</div></div>
        <div class="p-welcome-values"><span>${pIcon('home')}安心住下</span><span>${pIcon('people')}遇见同伴</span><span>${pIcon('heart')}一起更好</span></div>
      </section>
      <section class="p-profile-card"><div class="p-profile-hello"><img src="${portalArtwork}avatar.png" alt="默认用户插画头像"><span class="p-greeting-wave">👋</span></div><span class="p-step">${profile ? 'YOUR CAMPUS PROFILE' : '让我们先认识一下'}</span><h2>${profile ? '更新你的校园名片' : '欢迎，交大新邻居'}</h2><p class="p-form-intro">${profile ? '换了宿舍，或想换个称呼？在这里修改就好。' : '告诉我们怎么称呼你，以及你住在哪里。'}</p>
        <form id="campus-profile-form" novalidate>
          <label class="p-field" for="profile-name"><span>你的姓名或昵称 <i>*</i></span><div class="p-input-wrap">${pIcon('user')}<input id="profile-name" name="name" autocomplete="nickname" placeholder="希望我们怎么称呼你？" maxlength="24" required value="${esc(profile?.name || '')}"></div></label>
          <label class="p-field" for="profile-building"><span>你住在哪栋宿舍？ <i>*</i></span><div class="p-input-wrap">${pIcon('building')}<select id="profile-building" name="building" required><option value="">请选择宿舍楼</option>${portalBuildings.map(b => `<option value="${b}" ${profile?.building === b ? 'selected' : ''}>${b}</option>`).join('')}</select>${pIcon('chevron', 'p-select-chevron')}</div></label>
          <label class="p-field" for="profile-room"><span>房间号 <small>选填</small></span><div class="p-input-wrap">${pIcon('home')}<input id="profile-room" name="room" inputmode="text" placeholder="例如：512" maxlength="12" value="${esc(profile?.room || '')}"></div></label>
          <p class="p-profile-hint">楼栋选项来自参考图，仅用于当前页面演示。</p><p id="profile-error" class="p-field-error" role="alert"></p>
          <button class="p-button p-profile-submit" type="submit">${profile ? '保存，回到首页' : '开启我的校园生活'}${pIcon('arrow')}</button>
          <p class="p-local-note">${pIcon('lock')}仅保存在当前浏览器，可随时在个人中心修改。</p>
        </form>
        ${profile ? '<a class="p-guest-entry" href="#/">返回首页</a>' : '<button class="p-guest-entry" data-portal="guest">先以访客身份看看 <span>→</span></button>'}
      </section>
    </div>`, true);
}

function portalHeader() {
  return `<header class="p-dashboard-top"><div class="p-greeting"><img src="${portalArtwork}avatar.png" alt="你的默认头像"><div><h1>Hi, ${esc(portalProfile?.name || '同学')}! <span>👋</span></h1><p>新的一天，愿你在交大拥有充实而温暖的校园生活～</p></div></div><div class="p-top-actions"><div class="p-search-wrap"><label class="p-search">${pIcon('search')}<input id="campus-search" type="search" autocomplete="off" aria-label="搜索校园服务、活动或地点" placeholder="搜索服务、活动或地点..." maxlength="80"></label><div id="campus-search-results" class="p-search-results" hidden></div></div><button class="p-notifications" data-portal="notifications" aria-label="查看校园提醒">${pIcon('bell')}${portalProfile?.readWelcome ? '' : '<span></span>'}</button></div></header>`;
}

function portalDashboard() {
  const p = portalProfile;
  return portalShell(`${portalHeader()}
    <div class="p-top-grid">
      <section class="p-card p-dorm-card"><div class="p-card-heading"><h2>${pIcon('home', 'p-mint-icon')}选择宿舍</h2><button data-portal="all-dorms">查看全部 ${pIcon('chevron')}</button></div><div class="p-dorm-grid"><button class="p-current-dorm" data-portal="profile" aria-label="编辑当前宿舍资料"><img src="${portalArtwork}dorm.png" alt="校园建筑参考图，非所选楼栋实景"><span class="p-current-tag">当前宿舍</span><span class="p-dorm-bottom"><strong>${esc(p.building)}${p.room ? ` · ${esc(p.room)} 室` : ''}</strong>${pIcon('pin')}</span></button><div class="p-other-dorms">${portalBuildings.filter(b => b !== p.building).map(b => `<button data-portal="select-dorm" data-building="${b}"><img src="${portalArtwork}campus.png" alt="楼栋示意"><span>${b}</span>${pIcon('chevron')}</button>`).join('')}</div></div></section>
      <section class="p-card p-shower-card"><div class="p-card-heading"><h2>${pIcon('shower', 'p-mint-icon')}洗澡排队实时监控</h2><button data-portal="queue"><span class="p-dot"></span>数据演示 ${pIcon('chevron')}</button></div><button class="p-queue-body" data-portal="queue" aria-label="查看排队演示数据说明"><div class="p-gauge"><svg class="p-gauge-arc" viewBox="0 0 180 155" aria-hidden="true"><path class="p-gauge-track" d="M22 137A76 76 0 1 1 157 137"/><path class="p-gauge-value" d="M22 137A76 76 0 1 1 157 137"/></svg><div class="p-gauge-content">${pIcon('shower')}<strong>3<span>人</span></strong><small>当前排队人数</small></div></div><div class="p-queue-stats"><div><span>预计等待时间</span><strong>约 <b>8</b> 分钟 ${pIcon('clock')}</strong></div><div class="p-peak"><span>使用高峰期</span><p>18:00 – 22:00</p><div class="p-bars" aria-hidden="true">${[2,3,4,4,6,8,15,23,33,43].map(h => `<i style="height:${h}px"></i>`).join('')}</div></div></div></button></section>
      <section class="p-card p-reservation-card"><div class="p-card-heading"><h2>${pIcon('flag', 'p-peach-icon')}党团活动室预约</h2><button data-portal="booking-list">查看全部 ${pIcon('chevron')}</button></div><img class="p-room-banner" src="${portalArtwork}activity-room.png" alt="活动室参考图，不代表真实可预约场地"><div class="p-booking-subhead"><h3>今日可预约</h3><span>演示时段</span></div><fieldset class="p-booking-times"><legend class="p-sr-only">选择演示预约时段</legend>${['13:00 – 15:00', '15:00 – 17:00'].map(s => `<label><span>${s}</span><input type="radio" name="demo-slot" value="${s}" ${portalState.slot === s ? 'checked' : ''}></label>`).join('')}</fieldset><div class="p-booking-bottom"><span id="booking-inline-status">${p.booking || serviceRecords.bookings.some(b => b.date === serviceDate(0) && b.room === 'room-b') ? '已记录一项演示预约' : ''}</span><button class="p-button p-button-small" data-portal="book">立即预约 ${pIcon('arrow')}</button></div></section>
    </div>
    <div class="p-bottom-grid">
      <section class="p-card p-community-card"><div class="p-card-heading"><h2>${pIcon('community', 'p-mint-icon')}交大家园</h2><a href="#/community">进入社区 ${pIcon('chevron')}</a></div><div class="p-community-tabs" role="tablist" aria-label="社区内容分类">${portalCommunityTabs.map(t => `<button role="tab" id="community-tab-${portalCommunityTabs.indexOf(t)}" aria-controls="community-content" aria-selected="${portalState.community === t}" data-portal="community-tab" data-tab="${t}" class="${portalState.community === t ? 'is-active' : ''}">${t}</button>`).join('')}</div><div id="community-content" role="tabpanel" aria-labelledby="community-tab-${portalCommunityTabs.indexOf(portalState.community)}">${portalCommunityPost()}</div></section>
      <section class="p-card p-events-card" id="campus-events"><div class="p-card-heading"><h2>${pIcon('star', 'p-gold-icon')}活动报名</h2><button data-portal="activities">查看全部 ${pIcon('chevron')}</button></div><div class="p-events-grid"><div class="p-activity-poster"><img src="${portalArtwork}activity-banner.png" alt="在交大，遇见更大的世界：校园学生插画"><button data-portal="event" data-event="campus">立即报名 ${pIcon('arrow')}</button></div><div class="p-event-list">${portalEvents.map(e => `<button data-portal="event" data-event="${e.id}"><span class="p-event-emoji ${e.id}">${pIcon(e.icon)}</span><span><strong>${e.name}</strong><small>${e.when} · ${e.where}</small></span>${pIcon('chevron')}</button>`).join('')}</div></div></section>
    </div>`);
}

const portalEvents = [
  { id: 'night-run', name: '校园夜跑活动', icon: 'run', when: '11.20 19:00', where: '校园步道（示意）', type: '户外运动', duration: '约 45 分钟', description: '把一天的忙碌留在身后，和同学沿校园步道轻松夜跑。根据自己的体能选择速度，也可以结伴散步。路线、集合点和组织安排仍待核实。' },
  { id: 'round-fan', name: '团扇制作', icon: 'fan', when: '11.22 14:00', where: '公共活动室（示意）', type: '手作体验', duration: '约 90 分钟', description: '从配色到落笔，亲手做一把属于自己的团扇。可以带着喜欢的图案来交流灵感，材料提供、场地和参与安排仍待核实。' },
  { id: 'dumplings', name: '一起包饺子', icon: 'dumpling', when: '11.25 17:30', where: '共享活动空间（示意）', type: '邻里交流', duration: '约 90 分钟', description: '在包饺子的过程中认识新邻居，分享家乡的口味和手法。厨房使用、食材、过敏原与食品卫生安排仍待组织者核实，当前不提供实际餐食。' },
];
const portalCommunityTabs = ['“宿”说安全', '校园活动', '五星宿舍', '学业辅导'];
const portalPosts = {
  '“宿”说安全': { id:'safety-1',name:'交小筱',time:'2 小时前',text:'出门前多看一眼：充电设备收好、通道留空。来分享你和室友一起坚持的安全小习惯吧。',photos:['campus','leaves'],likes:28,comments:6 },
  '校园活动': { id:'activity-1',name:'校园生活小组',time:'今天',text:'夜跑、画团扇、一起包饺子，你最想和新邻居体验哪一项？把想法留在这里，一起安排有趣的宿舍生活。',photos:['sunset','campus'],likes:36,comments:8 },
  '五星宿舍': { id:'dorm-1',name:'小林同学',time:'今天',text:'我们给宿舍做了一张轮值小清单：桌面整理、垃圾带走、公共物品归位。让整洁成为室友之间的小默契。',photos:['leaves','campus'],likes:42,comments:9 },
  '学业辅导': { id:'study-1',name:'共学小组',time:'1 小时前',text:'找一段安静的时间，和同学一起整理高数错题。你想分享学习方法，还是找一个一起自习的伙伴？',photos:['campus','leaves'],likes:19,comments:4 },
};
function portalCommunityPost() {
  const p = portalPosts[portalState.community];
  const liked = !!portalProfile?.likes?.[portalState.community];
  return `<article class="p-community-post"><div class="p-post-author"><img src="${portalArtwork}community-avatar.png" alt="社区演示作者头像"><div><strong>${p.name}<small>${p.time}</small></strong><span>校园生活分享 · 演示</span></div></div><p>${p.text}</p><div class="p-post-photos">${p.photos.map(n => `<button data-portal="photo" data-photo="${n}" aria-label="查看${n === 'sunset' ? '晚霞' : n === 'campus' ? '校园建筑' : '树叶'}参考图片"><img src="${portalArtwork}${n}.png" alt="${n === 'sunset' ? '校园晚霞' : n === 'campus' ? '校园建筑' : '树荫'}参考图片"></button>`).join('')}</div><div class="p-post-reactions"><button data-portal="like" aria-label="${liked ? '取消点赞' : '点赞这条演示动态'}" aria-pressed="${liked}" class="${liked ? 'is-liked' : ''}">${pIcon('heart')}<span>${p.likes + (liked ? 1 : 0)}</span></button><button data-portal="post-comments">${pIcon('chat')}<span>${p.comments + campusComments(p.id).length}</span></button><button data-portal="share" aria-label="查看分享方式">${pIcon('share')}</button></div></article>`;
}
function portalDialog(title, subtitle, body) {
  if (modal.open) modal.close();
  openModal(title, subtitle, `<div class="p-dialog-body">${body}</div>`);
}
function portalServices() {
  location.hash = '/services';
}

document.addEventListener('change', e => {
  if (e.target.name === 'demo-slot') {
    portalState.slot = e.target.value;
    const status = document.querySelector('#booking-inline-status');
    if (status) status.textContent = '';
  }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'campus-profile-form') return;
  e.preventDefault();
  const form = e.target;
  const values = Object.fromEntries(new FormData(form));
  const name = String(values.name || '').trim();
  const building = String(values.building || '');
  const room = String(values.room || '').trim();
  const error = form.querySelector('#profile-error');
  form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  let invalid;
  if (!name || name.length > 24) {
    error.textContent = '请填写你的姓名或昵称（1–24 个字符）。';
    invalid = form.elements.name;
  } else if (!portalBuildings.includes(building)) {
    error.textContent = '请选择你所在的宿舍楼。';
    invalid = form.elements.building;
  } else if (room.length > 12) {
    error.textContent = '房间号请控制在 12 个字符以内。';
    invalid = form.elements.room;
  }
  if (invalid) { invalid.setAttribute('aria-invalid', 'true'); invalid.focus(); return; }
  if (!portalSave({ ...portalProfile, version: 1, name, building, room })) {
    error.textContent = '未能保存资料，请允许浏览器存储后重试。';
    return;
  }
  if (new URLSearchParams(location.hash.split('?')[1]).get('return') === 'profile') location.hash = '/profile';
  else portalGoHome();
  toast(`欢迎，${name}。你的校园名片已保存在当前浏览器。`);
});

document.addEventListener('click', e => {
  const button = e.target.closest('[data-portal]');
  if (!button) return;
  const action = button.dataset.portal;
  if (action === 'profile') { location.hash = '/welcome'; return; }
  if (action === 'guest') {
    if (portalSave({ version: 1, name: 'Julie', building: '西区 3 号楼', room: '512' })) portalGoHome();
  }
  if (action === 'services') portalServices();
  if (action === 'notifications') { location.hash = '/profile?tab=notifications'; }
  if (action === 'queue') { location.hash = '/services?section=shower'; }
  if (action === 'laundry') { location.hash = '/services?section=laundry'; }
  if (action === 'all-dorms') { location.hash = '/services?mode=dorms'; }
  if (action === 'select-dorm' && portalProfile) {
    const building = button.dataset.building;
    if (!portalBuildings.includes(building)) return;
    if (building === portalProfile.building) { if (modal.open) modal.close(); return; }
    if (portalSave({ ...portalProfile, building, room: '' })) {
      if (modal.open) modal.close();
      render();
      toast(`已切换至${building}，房间号可在个人中心补充。`);
    }
  }
  if (action === 'booking-list') { location.hash = '/services?section=booking'; }
  if (action === 'pick-slot') { portalState.slot = button.dataset.slot; portalBookingDialog(); }
  if (action === 'book') {
    if (!portalState.slot) { document.querySelector('#booking-inline-status').textContent = '请先选择一个时段'; document.querySelector('[name="demo-slot"]')?.focus(); return; }
    serviceState.day = 0;
    serviceState.room = 'room-b';
    serviceBookingDialog('room-b', portalState.slot.startsWith('13') ? 13 : 15);
  }
  if (action === 'confirm-booking' && portalProfile && portalState.slot) {
    if (portalSave({ ...portalProfile, booking: { slot: portalState.slot, recordedAt: new Date().toISOString() } })) {
      modal.close(); render(); toast('演示预约已记录在当前浏览器，未预约真实场地。');
    }
  }
  if (action === 'activities') { location.hash = '/activities'; return; }
  if (action === 'event') { campusOpenEvent(button.dataset.event === 'campus' ? portalEvents[0].id : button.dataset.event); }
  if (action === 'community-tab') {
    portalState.community = button.dataset.tab;
    document.querySelectorAll('.p-community-tabs button').forEach(el => { el.classList.toggle('is-active', el === button); el.setAttribute('aria-selected', String(el === button)); });
    const content = document.querySelector('#community-content');
    content.setAttribute('aria-labelledby', button.id);
    content.innerHTML = portalCommunityPost();
  }
  if (action === 'like' && portalProfile) {
    const tab = portalState.community;
    if (portalSave({ ...portalProfile, likes: { ...portalProfile.likes, [tab]: !portalProfile.likes?.[tab] } })) document.querySelector('#community-content').innerHTML = portalCommunityPost();
  }
  if (action === 'post-comments') campusOpenPost(portalPosts[portalState.community].id);
  if (action === 'share') portalDialog('一起发现校园生活', '这是本机运行的演示网页。', `<p>当前地址只能在这台电脑访问，可以面对面展示。尚未生成对外分享链接。</p>`);
  if (action === 'photo' && ['sunset', 'campus', 'leaves'].includes(button.dataset.photo)) portalDialog('校园一角', '来自你提供的参考图，非新增实景拍摄。', `<img class="p-photo-preview" src="${portalArtwork}${button.dataset.photo}.png" alt="校园参考图放大预览">`);
  if (action === 'search-result') {
    const result = portalSearchItems.find(i => i.id === button.dataset.id);
    if (!result) return;
    document.querySelector('#campus-search-results').hidden = true;
    if (result.href) location.hash = result.href;
    else { const proxy = document.createElement('button'); proxy.dataset.portal = result.action; if (result.event) proxy.dataset.event = result.event; document.body.append(proxy); proxy.click(); proxy.remove(); }
  }
});
function portalBookingDialog() {
  if (!portalProfile) { if (modal.open) modal.close(); location.hash = '/welcome'; return; }
  portalDialog('确认这次演示预约', '不会占用真实场地或发送申请。', `<div class="p-booking-summary"><span>场地</span><b>演示 · 党团活动室</b><span>时段</span><b>${esc(portalState.slot)}</b><span>参与者</span><b>${esc(portalProfile.name)}</b></div><p>真实预约规则、跨楼权限和审批方式均待核实。</p><button class="p-button" data-portal="confirm-booking">保存演示预约 ${pIcon('check')}</button>`);
}
const portalSearchItems = [
  { id: 'feedback', name: '问题反馈', hint: '提交问题 / 查看处理进度', href: '/feedback' },
  { id: 'dorms', name: '选择宿舍 / 修改楼栋', hint: '个人资料', action: 'all-dorms' },
  { id: 'laundry', name: '洗衣进度', hint: '洗衣机状态 / 进度演示', action: 'laundry' },
  { id: 'shower', name: '洗澡排队实时监控', hint: '数据演示', action: 'queue' },
  { id: 'booking', name: '党团活动室预约', hint: '预约演示', action: 'booking-list' },
  { id: 'space', name: '公共空间地图', hint: '找空间', href: '/spaces' },
  { id: 'community', name: '交大家园', hint: '安全 / 活动 / 五星宿舍 / 学业辅导', href: '/community' },
  { id: 'profile', name: '个人中心', hint: '我的预约 / 我的报名 / 我的收藏', href: '/profile' },
  ...portalEvents.map(e => ({ id: e.id, name: e.name, hint: '活动演示', action: 'event', event: e.id })),
];
function portalSearch(value) {
  const results = document.querySelector('#campus-search-results');
  if (!results) return;
  const q = value.trim().toLowerCase();
  const matches = portalSearchItems.filter(i => `${i.name}${i.hint}`.toLowerCase().includes(q));
  results.hidden = false;
  results.innerHTML = `<span class="p-search-label">${q ? '搜索结果' : '常用入口'}</span>${matches.length ? matches.map(i => `<button data-portal="search-result" data-id="${i.id}"><span>${i.name}</span><small>${i.hint}</small>${pIcon('chevron')}</button>`).join('') : '<p class="p-search-empty">没有找到，试试“宿舍”“预约”或“活动”。</p>'}`;
}
document.addEventListener('input', e => { if (e.target.id === 'campus-search') portalSearch(e.target.value); });
document.addEventListener('focusin', e => { if (e.target.id === 'campus-search') portalSearch(e.target.value); });
document.addEventListener('click', e => { if (!e.target.closest('.p-search-wrap')) { const results = document.querySelector('#campus-search-results'); if (results) results.hidden = true; } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const results = document.querySelector('#campus-search-results'); if (results) results.hidden = true; } });
