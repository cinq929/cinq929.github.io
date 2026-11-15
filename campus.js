// Shared activity and community content for the home, full pages and personal center.
Object.assign(portalPaths, {
  run: '<circle cx="15" cy="4" r="2"/><path d="m10 8 4-1 3 5 4 1M13 8l-3 6 5 3-1 5M10 14l-4 5H2M10 8l-4 4H3"/>',
  fan: '<path d="M12 17C1 17 1 4 8 3c2-1 4 0 4 2 0-2 2-3 4-2 7 1 7 14-4 14Zm0 0v5M7 8l5 9 5-9M12 5v12"/>',
  dumpling: '<path d="M2 11c5-9 15-9 20 0-1 10-19 10-20 0Zm0 0c2 2 3-2 5 0s3-2 5 0 3-2 5 0 3-2 5 0M5 14c3 4 11 4 14 0"/>',
  bookmark: '<path d="M6 3h12v19l-6-4-6 4Z"/>',
});
const campusKey = 'sjtu-campus-community-v1';
let campusRecords = { version:1, posts:[], comments:{}, saved:[] };
let campusWarning = '';
const campusState = { activityType:'全部', profileTab:'overview' };
try {
  const saved = JSON.parse(localStorage.getItem(campusKey) || 'null');
  if (saved?.version === 1 && Array.isArray(saved.posts) && saved.posts.every(p => typeof p.id === 'string' && typeof p.text === 'string' && typeof p.name === 'string' && portalCommunityTabs.includes(p.category)) && saved.comments && typeof saved.comments === 'object' && !Array.isArray(saved.comments) && Object.values(saved.comments).every(list => Array.isArray(list) && list.every(c => typeof c.text === 'string' && typeof c.name === 'string')) && Array.isArray(saved.saved) && saved.saved.every(id => typeof id === 'string')) campusRecords = saved;
  else if (saved !== null) campusWarning = '本地社区记录无法读取，当前展示初始内容。';
} catch { campusWarning = '本地社区记录无法读取，当前展示初始内容。'; }
function campusSave(next) {
  try { localStorage.setItem(campusKey,JSON.stringify(next)); campusRecords = next; return true; }
  catch { toast('保存失败，请检查浏览器本地存储后重试。'); return false; }
}
const campusExtraPosts = [
  {id:'safety-2',category:'“宿”说安全',name:'楼里邻居',time:'今天',text:'晚归时把脚步和说话声放轻一点，也是对室友的照顾。你还希望楼里增加哪些安全或生活指引？欢迎说说具体场景。',photos:['leaves'],likes:16,comments:3},
  {id:'activity-2',category:'校园活动',name:'邻里活动小组',time:'今天',text:'想试试团扇制作，也想学一学不同地方包饺子的手法。第一次参加活动的同学也可以来交流灵感，不用担心还不认识大家。',photos:['campus','sunset'],likes:24,comments:5},
  {id:'dorm-2',category:'五星宿舍',name:'宿舍共创小组',time:'昨天',text:'这个栏目想收集值得互相借鉴的宿舍生活小办法。分享收纳、轮值或沟通经验都可以；“五星宿舍”目前是演示栏目，不代表官方评选或获奖。',photos:['leaves','campus'],likes:31,comments:7},
  {id:'study-2',category:'学业辅导',name:'学习搭子',time:'昨天',text:'比起一次学完所有内容，我更想和同学一起定一个小目标。今天整理一类题，周末互相讲解。你正在复习哪门课？',photos:['campus'],likes:22,comments:4},
];
function campusPosts() { return [...campusRecords.posts.map(p => ({...p,photos:[],likes:0,comments:0,local:true})),...portalCommunityTabs.map(category => ({...portalPosts[category],category})),...campusExtraPosts]; }
function campusPost(id) { return campusPosts().find(p => p.id === id); }
function campusComments(id) { return campusRecords.comments[id] || []; }
function campusRegistration(id) { return (portalProfile?.registrations || []).find(r => r.eventId === id); }
function campusDate() { const d = new Date(); return `${d.getMonth()+1} 月 ${d.getDate()} 日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function campusLikeKey(post) { return portalPosts[post.category]?.id === post.id ? post.category : post.id; }
function campusActivityItem(event) {
  const joined = !!campusRegistration(event.id);
  return `<button class="l-upcoming-item" data-campus="event" data-id="${event.id}"><span class="l-event-icon ${event.id}">${pIcon(event.icon)}</span><span class="l-upcoming-copy"><strong>${event.name}</strong><small>${event.when} · ${event.where}</small></span><span class="l-event-badge ${joined ? 'is-joined' : ''}">${joined ? '已记录报名' : '报名中 · 演示'}</span></button>`;
}
function campusActivities() {
  const matches = portalEvents.filter(e => campusState.activityType === '全部' || e.type === campusState.activityType);
  return portalShell(`${portalHeader()}<div class="l-page"><section class="l-activity-shell"><div class="l-activity-feature"><h1>${pIcon('star','p-gold-icon')}活动报名</h1><div class="l-activity-art"><img src="${portalArtwork}activity-banner.png" alt="在交大，遇见更大的世界：校园活动插画"><button class="l-art-button" data-campus="event" data-id="night-run">一起参加活动 ${pIcon('arrow')}</button></div></div><aside class="l-upcoming"><div class="l-section-top"><h2>近期活动</h2><button data-campus="all-events">全部 ${pIcon('chevron')}</button></div><div>${portalEvents.map(campusActivityItem).join('')}</div><p class="l-demo-note">活动时间、地点与组织安排均为演示，实际参与方式待核实。</p></aside></section><section class="l-activity-bottom" id="campus-activity-list"><div class="l-section-top"><div><span class="l-eyebrow">MEET YOUR CAMPUS NEIGHBORS</span><h2>把课余时间，过得有声有色。</h2></div><div class="l-category-filters">${['全部','户外运动','手作体验','邻里交流'].map(t => `<button data-campus="activity-filter" data-value="${t}" aria-pressed="${campusState.activityType === t}" class="${campusState.activityType === t ? 'is-active' : ''}">${t}</button>`).join('')}</div></div><div class="l-event-grid">${matches.map(e => `<article class="l-event-card ${e.id}"><div class="l-event-card-art"><span>${pIcon(e.icon)}</span><i>${e.type}</i></div><div class="l-event-card-body"><small>校园生活 · 演示活动</small><h3>${e.name}</h3><p>${e.description.split('。')[0]}。</p><div class="l-event-meta"><span>${pIcon('calendar')}${e.when}</span><span>${pIcon('clock')}${e.duration}</span></div><button data-campus="event" data-id="${e.id}">${campusRegistration(e.id) ? '查看我的报名' : '了解活动，记录报名'}${pIcon('arrow')}</button></div></article>`).join('')}</div></section></div>`);
}
function campusOpenEvent(id) {
  const event = portalEvents.find(e => e.id === id); if (!event) return;
  const registration = campusRegistration(id);
  portalDialog(event.name,'校园活动 · 报名演示',`<div class="l-event-dialog-icon ${id}">${pIcon(event.icon)}<span>${event.type}</span></div><div class="l-event-dialog-meta"><span>${pIcon('calendar')}${event.when} · 2026 年演示安排</span><span>${pIcon('pin')}${event.where}</span></div><p>${event.description}</p><p class="l-demo-note">本地报名不会发送给组织者，不代表名额或现场许可。具体活动、开放权限与安全安排待核实。</p>${registration ? `<div class="l-local-registration">${pIcon('check')}已记录 ${esc(registration.name)} 的报名意愿<small>${esc(registration.date)} · 仅当前浏览器</small></div><button class="l-text-button" data-campus="cancel-registration" data-id="${id}">取消本地报名</button>` : `<form id="campus-registration-form" data-event="${id}" novalidate><label class="field"><span>参与者姓名或昵称 *</span><input name="name" maxlength="24" required value="${esc(portalProfile?.name || '')}" placeholder="怎么称呼你？"></label><label class="l-check"><input name="demo" type="checkbox">我知道这是演示报名，仅保存在当前浏览器。</label><p class="l-form-error" role="alert"></p><button class="p-button" type="submit">记录本地报名 ${pIcon('arrow')}</button></form>`}`);
}
function campusCommunity() {
  const category = portalState.community;
  const posts = campusPosts().filter(p => p.category === category);
  return portalShell(`${portalHeader()}<div class="l-page l-community-page"><section class="l-community-heading"><div><span class="l-eyebrow">A PLACE TO SHARE & BELONG</span><h1>${pIcon('community')}交大家园</h1><p>分享宿舍日常，遇见同频邻居，让好点子在楼里发生。</p></div><button class="p-button" data-campus="new-post">${pIcon('plus')}分享一件小事</button></section><div class="l-community-layout"><div><div class="l-community-tabs" role="group" aria-label="交大家园分类">${portalCommunityTabs.map(t => `<button data-campus="community-tab" data-value="${t}" aria-pressed="${category === t}" class="${category === t ? 'is-active' : ''}">${t}</button>`).join('')}</div><button class="l-compose" data-campus="new-post"><img src="${portalArtwork}avatar.png" alt="默认头像"><span>今天有什么想和邻居们分享？</span>${pIcon('plus')}</button><div class="l-feed">${posts.map(campusPostCard).join('')}</div></div><aside class="l-community-aside"><section class="l-aside-card"><span class="l-eyebrow">OUR CAMPUS, OUR STORIES</span><h2>在这里，找到你的话题。</h2>${portalCommunityTabs.map((t,i) => `<button data-campus="community-tab" data-value="${t}"><span class="l-topic-icon l-topic-${i}">${pIcon(['lock','calendar','star','book'][i])}</span><span><b>${t}</b><small>${['分享生活中的安全小习惯','夜跑、团扇与饺子的相遇','交流整理与相处的小办法','寻找方法，也寻找学习搭子'][i]}</small></span>${pIcon('chevron')}</button>`).join('')}</section><section class="l-aside-card"><div class="l-section-top"><h2>一起去参加</h2><a href="#/activities">更多 ${pIcon('chevron')}</a></div>${portalEvents.map(e => `<button class="l-small-event" data-campus="event" data-id="${e.id}">${pIcon(e.icon)}<span><b>${e.name}</b><small>${e.when} · 演示</small></span>${pIcon('chevron')}</button>`).join('')}</section><section class="l-cocreate-invite"><span>${pIcon('chat')}</span><h2>有件事，想一起改善？</h2><p>带着具体问题进入共创广场，和同学、宿管一起补充事实、商量办法。</p><a href="#/plaza">进入共创广场 ${pIcon('arrow')}</a></section><p class="l-demo-note">初始动态与互动数量为演示；新发布、评论、点赞和收藏仅保存在当前浏览器。“五星宿舍”为交流栏目，不代表官方评选。</p>${campusWarning ? `<p class="l-form-error" role="alert">${esc(campusWarning)}</p>` : ''}</aside></div></div>`);
}
function campusPostCard(post) {
  const liked = !!portalProfile?.likes?.[campusLikeKey(post)]; const saved = campusRecords.saved.includes(post.id);
  return `<article class="l-post"><div class="l-post-head"><img src="${portalArtwork}${post.local ? 'avatar' : 'community-avatar'}.png" alt="默认演示头像"><div><strong>${esc(post.name)}</strong><small>${esc(post.time)} · ${post.local ? '本地发布' : '演示动态'}</small></div><span>${post.category}</span></div><p>${esc(post.text)}</p>${post.photos.length ? `<div class="l-post-photos">${post.photos.map(photo => `<button data-portal="photo" data-photo="${photo}" aria-label="查看校园参考图片"><img src="${portalArtwork}${photo}.png" alt="校园参考图片，非本次活动现场"></button>`).join('')}</div>` : ''}<div class="l-post-actions"><button data-campus="post-like" data-id="${esc(post.id)}" aria-label="${liked ? '取消点赞' : '点赞'}" aria-pressed="${liked}" class="${liked ? 'is-liked' : ''}">${pIcon('heart')}${post.likes + Number(liked)}</button><button data-campus="post-comments" data-id="${esc(post.id)}">${pIcon('chat')}${post.comments + campusComments(post.id).length} 条交流</button><button data-campus="post-save" data-id="${esc(post.id)}" aria-pressed="${saved}" class="${saved ? 'is-saved' : ''}">${pIcon('bookmark')}${saved ? '已收藏' : '收藏'}</button></div></article>`;
}
function campusOpenPost(id) {
  const post = campusPost(id); if (!post) return;
  portalDialog('邻里交流',`${post.category} · ${post.local ? '本地动态' : '演示动态'}`,`<div class="l-dialog-post"><strong>${esc(post.name)}</strong><p>${esc(post.text)}</p></div><div class="l-comments">${campusComments(id).length ? campusComments(id).map(c => `<article><strong>${esc(c.name)}<small>${esc(c.date)}</small></strong><p>${esc(c.text)}</p></article>`).join('') : '<p class="l-demo-note">还没有本地评论。卡片中的初始交流数量为演示。</p>'}</div><form id="campus-comment-form" data-id="${esc(id)}" novalidate><label class="field"><span>说说你的想法 *</span><textarea name="text" maxlength="600" required rows="3" placeholder="补充一个经验，或回应这位邻居。"></textarea></label><p class="l-form-error" role="alert"></p><button class="p-button" type="submit">保存本地评论 ${pIcon('arrow')}</button></form>`);
}
function campusProfile(query) {
  const allowed = ['overview','information','bookings','registrations','saved','notifications','help'];
  const requested = new URLSearchParams(query).get('tab'); if (allowed.includes(requested)) campusState.profileTab = requested;
  const tab = campusState.profileTab; const p = portalProfile;
  return portalShell(`${portalHeader()}<div class="l-page"><section class="l-profile-shell"><aside class="l-person-sidebar"><div class="l-person-heading"><img src="${portalArtwork}avatar.png" alt="默认个人头像"><h1>${esc(p?.name || '校园访客')}</h1><p>${p ? esc(p.building) + (p.room ? ` · ${esc(p.room)} 室` : '') : '先创建一张校园生活名片'}</p><a href="#/welcome?return=profile">${p ? '编辑资料' : '填写资料'} ${pIcon('chevron')}</a></div><nav aria-label="个人中心设置">${[['information','user','个人信息'],['settings','lock','账户设置'],['help','info','帮助中心'],['about','heart','关于我们']].map(([id,icon,label]) => `<button data-campus="profile-${id}" class="${tab === id ? 'is-active' : ''}">${pIcon(icon)}${label}</button>`).join('')}<a href="#/welcome">${pIcon('home')}返回欢迎页</a></nav><div class="l-profile-local-note">${pIcon('lock')}你的校园生活记录<br>仅保存在当前浏览器</div></aside><div class="l-person-main"><div class="l-profile-shortcuts">${[['bookings','calendar','我的预约',serviceRecords.bookings.length],['registrations','heart','我的报名',(p?.registrations || []).length],['saved','star','我的收藏',campusRecords.saved.length],['notifications','bell','消息通知',p?.readWelcome ? 0 : 1]].map(([id,icon,label,count]) => `<button data-campus="profile-tab" data-tab="${id}" class="${tab === id ? 'is-active' : ''}"><span>${pIcon(icon)}${count ? `<i>${count}</i>` : ''}</span><strong>${label}</strong></button>`).join('')}</div><div class="l-profile-banner"><img src="${portalArtwork}profile-campus-art.png" alt="参考图中的校园建筑插画"><div><span>YOUR DAYS AT SJTU</span><h2>愿你在交大，<br>度过充实的每一天！</h2><svg viewBox="0 0 250 40" aria-hidden="true"><path d="M7 14c82 45 127-39 227-3m-9-6 10 6-9 5"/></svg></div></div><section class="l-profile-content">${campusProfileContent(tab)}</section></div></section></div>`);
}
function campusProfileContent(tab) {
  const p = portalProfile;
  if (tab === 'bookings') return `<div class="l-section-top"><h2>我的预约 <small>本地演示</small></h2><a href="#/services?section=booking">去预约 ${pIcon('arrow')}</a></div>${serviceRecords.bookings.length ? serviceRecords.bookings.map(b => `<article class="l-record"><span class="l-record-icon">${pIcon('calendar')}</span><div><h3>${esc(serviceRooms.find(r => r.id === b.room)?.name || '演示活动室')}</h3><p>${esc(b.date)} · ${serviceSlot(b.hour)}</p><small>${esc(b.purpose)} · ${b.people} 人 · 未提交真实申请</small></div><button data-service="cancel-booking" data-id="${esc(b.id)}">取消预约</button></article>`).join('') : campusEmpty('还没有本地预约','在宿舍服务的时间轴里，挑一段合适的讨论时间。','/services?section=booking','查看活动室')}${p?.booking ? `<p class="l-demo-note">另有旧版演示记录：${esc(p.booking.slot)}（尚未提交真实预约）。</p>` : ''}`;
  if (tab === 'registrations') return `<div class="l-section-top"><h2>我的报名 <small>本地演示</small></h2><a href="#/activities">发现活动 ${pIcon('arrow')}</a></div>${p?.registrations?.length ? p.registrations.map(r => { const event = portalEvents.find(e => e.id === r.eventId); return `<article class="l-record"><span class="l-record-icon ${r.eventId}">${pIcon(event?.icon || 'calendar')}</span><div><h3>${esc(event?.name || '历史演示活动')}</h3><p>${esc(event?.when || r.date)} · ${esc(r.name)}</p><small>已记录本地报名意愿 · 未发送给组织者</small></div><button data-campus="event" data-id="${esc(r.eventId)}">查看</button></article>`; }).join('') : campusEmpty('下一场相遇，正在等你','夜跑、画团扇或包饺子，挑一件你喜欢的小事。','/activities','看看校园活动')}${p?.interests?.length ? `<p class="l-demo-note">此前记录过 ${p.interests.length} 项活动兴趣，已保留在浏览器名片中；兴趣记录不等于报名。</p>` : ''}`;
  if (tab === 'saved') { const posts = campusRecords.saved.map(campusPost).filter(Boolean); return `<div class="l-section-top"><h2>我的收藏</h2><a href="#/community">逛逛交大家园 ${pIcon('arrow')}</a></div>${posts.length ? posts.map(post => `<article class="l-record"><span class="l-record-icon">${pIcon('bookmark')}</span><div><h3>${esc(post.text.slice(0,32))}${post.text.length > 32 ? '…' : ''}</h3><p>${post.category} · ${esc(post.name)}</p></div><button data-campus="post-comments" data-id="${esc(post.id)}">查看</button><button data-campus="post-save" data-id="${esc(post.id)}">取消收藏</button></article>`).join('') : campusEmpty('把喜欢的生活经验，留在这里','在交大家园点击收藏，回头就能轻松找到。','/community','去交大家园')}`; }
  if (tab === 'notifications') return `<div class="l-section-top"><h2>消息通知 <small>演示</small></h2>${!p?.readWelcome ? '<button data-campus="read-notification">标为已读</button>' : '<span class="l-demo-note">已读</span>'}</div><article class="l-message"><span>${pIcon('bell')}</span><div><h3>欢迎来到你的交大日常</h3><p>校园名片、预约、报名和收藏都可以在这里查看。这里没有接入学校通知，当前消息为演示欢迎提示。</p></div></article>`;
  if (tab === 'information') return `<div class="l-section-top"><h2>个人信息</h2><a href="#/welcome?return=profile">编辑资料 ${pIcon('arrow')}</a></div><dl class="l-person-details">${[['姓名或昵称',p?.name || '尚未填写'],['宿舍楼',p?.building || '尚未选择'],['房间号',p?.room || '未填写'],['资料范围','本地演示名片，未认证学籍身份']].map(([k,v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  if (tab === 'help') return `<div class="l-section-top"><h2>帮助中心</h2></div>${[['报名后会通知组织者吗？','不会。本页仅记录本地报名意愿，活动时间、场地和实际参与方式均待核实。'],['换了宿舍，在哪里修改？','点击左侧编辑资料或到宿舍服务地图选楼；换楼会清空原房间号。'],['记录为什么在另一台设备看不到？','数据仅保存在当前浏览器；不同浏览器或端口不能共享，清理站点数据后记录也会移除。']].map(([q,a]) => `<details class="l-help-item"><summary>${q}</summary><p>${a}</p></details>`).join('')}`;
  return `<div class="l-section-top"><h2>我的校园生活</h2><button data-campus="profile-information">查看个人信息 ${pIcon('chevron')}</button></div><div class="l-profile-welcome"><span>${pIcon('heart')}</span><div><h3>把日常小事，放在心上。</h3><p>看看预约，参加一场活动，或在交大家园分享一个生活小办法。</p></div></div><div class="l-profile-links"><a href="#/activities">发现校园活动 ${pIcon('arrow')}</a><a href="#/community">去交大家园逛逛 ${pIcon('arrow')}</a></div>`;
}
function campusEmpty(title,text,href,label) { return `<div class="l-empty"><span>${pIcon('heart')}</span><h3>${title}</h3><p>${text}</p><a href="#${href}">${label} ${pIcon('arrow')}</a></div>`; }
function campusNewPost() {
  portalDialog('分享一件小事','交大家园 · 仅保存在当前浏览器',`<form id="campus-post-form" novalidate><label class="field"><span>发在哪个栏目？</span><select name="category">${portalCommunityTabs.map(t => `<option ${portalState.community === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label><label class="field"><span>想分享什么？ *</span><textarea name="text" minlength="10" maxlength="1200" required rows="5" placeholder="说说具体场景、你的经验，或想和邻居交流的事情（至少 10 个字）。"></textarea></label><p class="l-form-error" role="alert"></p><p class="l-demo-note">请避免填写电话、学号或他人的个人信息。发布后只会在当前浏览器显示。</p><button class="p-button" type="submit">发布本地动态 ${pIcon('arrow')}</button></form>`);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-campus]'); if (!b || b.disabled) return; const action = b.dataset.campus;
  if (action === 'event') campusOpenEvent(b.dataset.id);
  if (action === 'activity-filter') { campusState.activityType = b.dataset.value; render(); }
  if (action === 'all-events') { campusState.activityType = '全部'; render(); document.querySelector('#campus-activity-list')?.scrollIntoView({behavior:'smooth'}); }
  if (action === 'cancel-registration' && portalProfile) { if (!portalSave({...portalProfile,registrations:(portalProfile.registrations || []).filter(r => r.eventId !== b.dataset.id)})) return; modal.close(); render(); toast('本地报名已取消。'); }
  if (action === 'community-tab') { if (!portalCommunityTabs.includes(b.dataset.value)) return; portalState.community = b.dataset.value; render(); }
  if (action === 'new-post') campusNewPost();
  if (action === 'post-comments') campusOpenPost(b.dataset.id);
  if (action === 'post-like') {
    const post = campusPost(b.dataset.id); if (!post) return;
    if (!portalProfile) { toast('先填写校园名片，即可保存点赞记录。'); return; }
    const key = campusLikeKey(post); if (!portalSave({...portalProfile,likes:{...portalProfile.likes,[key]:!portalProfile.likes?.[key]}})) return; render();
  }
  if (action === 'post-save') { if (!campusPost(b.dataset.id)) return; const saved = campusRecords.saved.includes(b.dataset.id); if (!campusSave({...campusRecords,saved:saved ? campusRecords.saved.filter(id => id !== b.dataset.id) : [...campusRecords.saved,b.dataset.id]})) return; render(); toast(saved ? '已取消收藏。' : '已收藏，可以在个人中心查看。'); }
  if (action === 'profile-tab') { campusState.profileTab = b.dataset.tab; history.replaceState(null,'',`#/profile?tab=${b.dataset.tab}`); render(); }
  if (action === 'profile-information' || action === 'profile-help') { campusState.profileTab = action.split('-')[1]; history.replaceState(null,'',`#/profile?tab=${campusState.profileTab}`); render(); }
  if (action === 'profile-settings') portalDialog('账户设置','本地演示名片，未接入账号与学校认证。',`<p>姓名与宿舍可在个人信息中修改。预约、报名和社区内容仅存储在本浏览器，不需要设置密码。</p><a class="p-button" href="#/welcome?return=profile">修改校园名片 ${pIcon('arrow')}</a>`);
  if (action === 'profile-about') portalDialog('关于交大宿舍共创','学生实践项目 · 可点击演示',`<p>发现身边的空间，一起改善宿舍生活。这里连接空间信息、生活服务与邻里讨论，让学生和宿管共同发现问题、补充事实和参与行动。</p><p>当前未接入学校认证、真实预约、活动组织者或消息系统。</p><a class="p-button" href="#/plaza">看看共创议题 ${pIcon('arrow')}</a>`);
  if (action === 'read-notification') { if (!portalProfile) { toast('当前为访客提示，填写名片后可保存已读状态。'); return; } if (portalSave({...portalProfile,readWelcome:true})) { render(); toast('演示通知已标为已读。'); } }
});
document.addEventListener('submit', e => {
  const form = e.target; if (!['campus-registration-form','campus-post-form','campus-comment-form'].includes(form.id)) return; e.preventDefault();
  const values = Object.fromEntries(new FormData(form)); const error = form.querySelector('.l-form-error');
  if (form.id === 'campus-registration-form') {
    const name = String(values.name || '').trim(); if (!name || name.length > 24) { error.textContent = '请填写 1–24 个字的姓名或昵称。'; form.elements.name.focus(); return; }
    if (values.demo !== 'on') { error.textContent = '请先确认这是一份本地演示报名。'; return; }
    if (!portalProfile) { error.textContent = '请先在个人中心填写校园名片，再记录报名。'; return; }
    const id = form.dataset.event; if (!portalEvents.some(event => event.id === id) || campusRegistration(id)) { error.textContent = '本地已有该报名，请关闭后查看。'; return; }
    if (!portalSave({...portalProfile,registrations:[...(portalProfile.registrations || []),{eventId:id,name,date:campusDate()}]})) { error.textContent = '未能保存，表单已保留，请检查本地存储。'; return; }
    modal.close(); render(); toast('本地报名已记录，可在个人中心查看。'); return;
  }
  const text = String(values.text || '').trim(); const posting = form.id === 'campus-post-form';
  if (text.length < (posting ? 10 : 1)) { error.textContent = posting ? '请用至少 10 个字分享具体情况。' : '请填写评论，不能只输入空格。'; form.elements.text.focus(); return; }
  const next = structuredClone(campusRecords);
  if (posting) { if (!portalCommunityTabs.includes(values.category)) return; next.posts.unshift({id:'post-'+crypto.randomUUID(),category:values.category,name:portalProfile?.name || '校园访客',time:campusDate(),text}); portalState.community = values.category; }
  else { if (!campusPost(form.dataset.id)) return; (next.comments[form.dataset.id] ||= []).push({name:portalProfile?.name || '校园访客',text,date:campusDate()}); }
  if (!campusSave(next)) { error.textContent = '保存失败，内容已保留，请检查本地存储。'; return; }
  if (posting) { modal.close(); if (location.hash.split('?')[0] !== '#/community') location.hash = '/community'; else render(); toast('动态已发布，仅保存在当前浏览器。'); }
  else { render(); campusOpenPost(form.dataset.id); toast('评论已保存在当前浏览器。'); }
});
