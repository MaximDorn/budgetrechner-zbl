document.addEventListener('DOMContentLoaded', function() {
  const budgetAnlegenLink = document.getElementById('budget-anlegen-link');
  const budgetuebersichtLink = document.getElementById('budgetuebersicht-link');
  const budgetAnlegenSection = document.getElementById('budget-anlegen-section');
  const budgetUebersichtSection = document.getElementById('budget-uebersicht-section');

  budgetAnlegenLink.addEventListener('click', function(e) {
    e.preventDefault();
    budgetAnlegenSection.style.display = 'block';
    budgetUebersichtSection.style.display = 'none';
    budgetAnlegenLink.classList.add('aktiv');
    budgetuebersichtLink.classList.remove('aktiv');
  });

  budgetuebersichtLink.addEventListener('click', function(e) {
    e.preventDefault();
    budgetAnlegenSection.style.display = 'none';
    budgetUebersichtSection.style.display = 'block';
    budgetAnlegenLink.classList.remove('aktiv');
    budgetuebersichtLink.classList.add('aktiv');
  });
});
