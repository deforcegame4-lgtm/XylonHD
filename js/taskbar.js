// ================================================================
// TASKBAR NAVIGASI (bawah, ala mobile app)
// Milih ikon akan mengganti "halaman" yang tampil di area utama,
// dengan highlight kaca yang geser & menetap di ikon aktif.
// ================================================================
(function(){
  const taskbar = document.getElementById('taskbar');
  const thumb = document.getElementById('taskbar-thumb');
  const items = taskbar.querySelectorAll('.taskbar-item');
  const views = document.querySelectorAll('.view');

  function moveThumbTo(btn){
    const barRect = taskbar.querySelector('.taskbar-inner').getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    thumb.style.width = btnRect.width + 'px';
    thumb.style.height = btnRect.height + 'px';
    thumb.style.transform = `translate(${btnRect.left - barRect.left}px, ${btnRect.top - barRect.top}px)`;
  }

  function showView(name){
    views.forEach(v => { v.hidden = (v.id !== `view-${name}`); });
  }

  items.forEach(btn => {
    btn.addEventListener('click', () => {
      items.forEach(b => b.classList.toggle('active', b === btn));
      moveThumbTo(btn);
      showView(btn.dataset.view);
    });
  });

  // posisikan thumb ke tombol aktif (Dashboard) begitu halaman siap & saat resize
  function syncThumb(){
    const active = taskbar.querySelector('.taskbar-item.active') || items[0];
    moveThumbTo(active);
  }
  syncThumb();
  window.addEventListener('load', syncThumb);
  window.addEventListener('resize', syncThumb);
})();
