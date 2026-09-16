// ================================================================
// HAMBURGER MENU + DRAWER (Dashboard / Credit / Donate / Information)
// ================================================================
(function(){
  const toggleBtn = document.getElementById('menu-toggle');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close');
  const backBtn = document.getElementById('drawer-back');
  const titleEl = document.getElementById('drawer-title');
  const listEl = document.getElementById('drawer-list');
  const details = document.querySelectorAll('.drawer-detail');

  const LABELS = {
    dashboard: 'Dashboard',
    credit: 'Credit',
    donate: 'Donate',
    information: 'Information'
  };

  function openDrawer(){
    backdrop.classList.add('open');
    toggleBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer(){
    backdrop.classList.remove('open');
    toggleBtn.classList.remove('open');
    document.body.style.overflow = '';
    // balik ke tampilan list menu pas ditutup, biar pas dibuka lagi mulai dari awal
    setTimeout(showList, 450);
  }

  function showList(){
    details.forEach(d => { d.hidden = true; });
    listEl.hidden = false;
    backBtn.classList.remove('visible');
    titleEl.textContent = 'Menu';
  }

  function showDetail(name){
    listEl.hidden = true;
    details.forEach(d => { d.hidden = (d.id !== `detail-${name}`); });
    backBtn.classList.add('visible');
    titleEl.textContent = LABELS[name] || 'Menu';
  }

  toggleBtn.addEventListener('click', () => {
    if(backdrop.classList.contains('open')) closeDrawer();
    else openDrawer();
  });

  closeBtn.addEventListener('click', closeDrawer);

  backdrop.addEventListener('click', (e) => {
    if(e.target === backdrop) closeDrawer();
  });

  backBtn.addEventListener('click', showList);

  listEl.querySelectorAll('.drawer-item').forEach(btn => {
    btn.addEventListener('click', () => showDetail(btn.dataset.panel));
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && backdrop.classList.contains('open')) closeDrawer();
  });
})();
