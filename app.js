document.addEventListener('DOMContentLoaded', () => {
  const yearLabel = document.querySelector('.year-label');
  if (yearLabel) {
    yearLabel.textContent = new Date().getFullYear();
  }

  const buttons = document.querySelectorAll('button');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.horse-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
});
