// ================================================================
// HAMBURGER MENU — drawer cuma buat navigasi.
// Milih item di drawer akan mengganti "halaman" yang tampil di area
// utama (main), lalu drawer otomatis tertutup dengan animasi smooth.
// ================================================================
(function(){
  const toggleBtn = document.getElementById('menu-toggle');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close');
  const listEl = document.getElementById('drawer-list');
  const views = document.querySelectorAll('.view');

  function openDrawer(){
    backdrop.classList.add('open');
    toggleBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer(){
    backdrop.classList.remove('open');
    toggleBtn.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showView(name){
    views.forEach(v => { v.hidden = (v.id !== `view-${name}`); });
  }

  toggleBtn.addEventListener('click', () => {
    if(backdrop.classList.contains('open')) closeDrawer();
    else openDrawer();
  });

  closeBtn.addEventListener('click', closeDrawer);

  backdrop.addEventListener('click', (e) => {
    if(e.target === backdrop) closeDrawer();
  });

  listEl.querySelectorAll('.drawer-item').forEach(btn => {
    btn.addEventListener('click', () => {
      showView(btn.dataset.view);
      closeDrawer();
    });
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && backdrop.classList.contains('open')) closeDrawer();
  });
})();
