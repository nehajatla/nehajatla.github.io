/* ================================================================
   report-book.js — flip-through preview for a `.report-book` block
   inside a case study's body (see work-data.js). Content is injected
   into #case-body via innerHTML at runtime, so this listens on
   document via delegation rather than querying on load — works no
   matter when/how many times a `.report-book` gets inserted.
   ================================================================ */
(function () {
  'use strict';

  function getPages(book) { return Array.from(book.querySelectorAll('.report-book-page')); }
  function getDots(book) { return Array.from(book.querySelectorAll('.report-book-dot')); }

  function activeIndex(pages) {
    const i = pages.findIndex((p) => p.classList.contains('is-active'));
    return i < 0 ? 0 : i;
  }

  function goTo(book, index) {
    const pages = getPages(book);
    if (!pages.length) return;
    const clamped = (index + pages.length) % pages.length;
    pages.forEach((p, i) => p.classList.toggle('is-active', i === clamped));
    getDots(book).forEach((d, i) => d.classList.toggle('is-active', i === clamped));
    const counter = book.querySelector('.report-book-counter');
    if (counter) counter.textContent = (clamped + 1) + ' / ' + pages.length;
  }

  document.addEventListener('click', (e) => {
    const next = e.target.closest('.report-book-next');
    const prev = e.target.closest('.report-book-prev');
    const dot = e.target.closest('.report-book-dot');
    if (!next && !prev && !dot) return;
    const book = e.target.closest('.report-book');
    if (!book) return;
    const pages = getPages(book);
    const cur = activeIndex(pages);
    if (next) goTo(book, cur + 1);
    else if (prev) goTo(book, cur - 1);
    else if (dot) goTo(book, getDots(book).indexOf(dot));
  });

  // Arrow keys while a book (or anything inside it) has focus.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const book = document.activeElement && document.activeElement.closest && document.activeElement.closest('.report-book');
    if (!book) return;
    const pages = getPages(book);
    const cur = activeIndex(pages);
    goTo(book, cur + (e.key === 'ArrowRight' ? 1 : -1));
    e.preventDefault();
  });
})();
