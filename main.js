document.addEventListener('DOMContentLoaded', function () {
  const MONATS_BUDGET = {
    2022: 125,
    2023: 125,
    2024: 125,
    2025: 131,
    2026: 131
  };

  let budgetDaten = {};
  let pflegegradSeit = null;
  let verbrauchtesStartBudget = 0;

  const pflegegradDatumInput = document.getElementById('pflegegrad-datum');
  const budgetVerbrauchtSelect = document.getElementById('budget-verbraucht');
  const verbrauchtBudgetContainer = document.getElementById('verbrauchtes-budget-container');
  const verbrauchtBudgetInput = document.getElementById('verbrauchtes-budget');
  const budgetAnlegenBtn = document.getElementById('budget-anlegen-btn');
  const jahrAuswahlSelect = document.getElementById('jahr-auswahl');
  const budgetTabelleBody = document.getElementById('budget-tabelle-body');
  const betragProMonatInput = document.getElementById('betrag-pro-monat');
  const vortragInput = document.getElementById('vortrag');
  const verfuegbarUebertragInput = document.getElementById('verfuegbar-uebertrag');

  budgetVerbrauchtSelect.addEventListener('change', function () {
    verbrauchtBudgetContainer.style.display = this.value === 'ja' ? 'block' : 'none';
  });

  budgetAnlegenBtn.addEventListener('click', budgetAnlegen);
  jahrAuswahlSelect.addEventListener('change', budgetTabelleAktualisieren);
  vortragInput.addEventListener('input', budgetTabelleAktualisieren);

  document.getElementById('zurueck-btn').addEventListener('click', function () {
    alert('Zurück-Button geklickt');
  });

  document.getElementById('weiter-btn').addEventListener('click', function () {
    alert('Weiter-Button geklickt');
  });

  document.getElementById('fertigstellen-btn').addEventListener('click', function () {
    alert('Daten gespeichert');
  });

  document.getElementById('abbrechen-btn').addEventListener('click', function () {
    if (confirm('Wirklich abbrechen? Nicht gespeicherte Änderungen gehen verloren.')) {
      alert('Vorgang abgebrochen');
    }
  });  function budgetAnlegen() {
    pflegegradSeit = new Date(pflegegradDatumInput.value);

    if (isNaN(pflegegradSeit.getTime())) {
      alert('Bitte ein gültiges Datum für den Pflegegrad eingeben.');
      return;
    }

    if (budgetVerbrauchtSelect.value === 'ja') {
      verbrauchtesStartBudget = parseFloat(verbrauchtesBudgetInput.value.replace(',', '.')) || 0;
    } else {
      verbrauchtesStartBudget = 0;
    }

    const startJahr = pflegegradSeit.getFullYear();
    const endeJahr = new Date().getFullYear() + 1;

    for (let jahr = startJahr; jahr <= endeJahr; jahr++) {
      budgetDaten[jahr] = {};

      for (let monat = 0; monat < 12; monat++) {
        const monatsDatum = new Date(jahr, monat, 1);
        if (monatsDatum < pflegegradSeit) continue;

        budgetDaten[jahr][monat] = {
          fremd: 0,
          pflegekasse: 0
        };
      }
    }

    document.getElementById('budget-anlegen-section').style.display = 'none';
    document.getElementById('budget-uebersicht-section').style.display = 'block';
    document.getElementById('budget-anlegen-link').classList.remove('aktiv');
    document.getElementById('budgetuebersicht-link').classList.add('aktiv');

    budgetTabelleAktualisieren();
  }  function budgetTabelleAktualisieren() {
    const jahr = parseInt(jahrAuswahlSelect.value);
    const monatsBudget = MONATS_BUDGET[jahr] || 125;

    betragProMonatInput.value = monatsBudget.toFixed(2).replace('.', ',');

    budgetTabelleBody.innerHTML = '';

    let gesamtBudget = 0;
    let gesamtFremd = 0;
    let gesamtPflegekasse = 0;
    let gesamtVerfuegbar = 0;
    let gesamtPrivat = 0;

    const vortragWert = parseFloat(vortragInput.value.replace(',', '.')) || 0;
    let kumuliertesMonatsBudget = 0;

    for (let monat = 0; monat < 12; monat++) {
      kumuliertesMonatsBudget += monatsBudget;

      if (monat === 0 && vortragWert > 0) {
        kumuliertesMonatsBudget += vortragWert;
      }

      if (monat === 6 && vortragWert > 0) {
        kumuliertesMonatsBudget -= vortragWert;

        const verfallWarnung = document.createElement('div');
        verfallWarnung.className = 'info-box warning';
        verfallWarnung.innerHTML = `<p><strong>Achtung:</strong> Der Vortrag (${vortragWert.toFixed(2)} €) ist am 30.06.${jahr} verfallen!</p>`;

        const warnungExistiert = document.querySelector('.info-box.warning');
        if (!warnungExistiert) {
          const budgetContainer = document.getElementById('budget-tabelle-container');
          budgetContainer.parentNode.insertBefore(verfallWarnung, budgetContainer);
        }
      }

      let fremd = 0;
      let pflegekasse = 0;

      if (budgetDaten[jahr] && budgetDaten[jahr][monat]) {
        fremd = budgetDaten[jahr][monat].fremd || 0;
        pflegekasse = budgetDaten[jahr][monat].pflegekasse || 0;
      }

      erstelleMonatsZeile(monat, kumuliertesMonatsBudget, fremd, pflegekasse, jahr);

      gesamtFremd += fremd;
      gesamtPflegekasse += pflegekasse;
    }

    gesamtBudget = kumuliertesMonatsBudget;
    gesamtVerfuegbar = gesamtBudget - gesamtFremd - gesamtPflegekasse;
    gesamtPrivat = gesamtVerfuegbar < 0 ? Math.abs(gesamtVerfuegbar) : 0;

    verfuegbarUebertragInput.value = gesamtVerfuegbar.toFixed(2).replace('.', ',');

    document.getElementById('gesamt-budget').textContent = gesamtBudget.toFixed(2) + ' €';
    document.getElementById('gesamt-fremd').textContent = gesamtFremd.toFixed(2) + ' €';
    document.getElementById('gesamt-pflegekasse').textContent = gesamtPflegekasse.toFixed(2) + ' €';
    document.getElementById('gesamt-verfuegbar').textContent = gesamtVerfuegbar.toFixed(2) + ' €';
    document.getElementById('gesamt-privat').textContent = gesamtPrivat.toFixed(2) + ' €';
  }  function erstelleMonatsZeile(monat, budget, fremd, pflegekasse, jahr) {
    const monatNamen = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const zeile = document.createElement('tr');

    const monatZelle = document.createElement('td');
    monatZelle.textContent = monatNamen[monat];
    monatZelle.style.textAlign = 'left';
    zeile.appendChild(monatZelle);

    const budgetZelle = document.createElement('td');
    budgetZelle.textContent = budget.toFixed(2) + ' €';
    zeile.appendChild(budgetZelle);

    const fremdZelle = document.createElement('td');
    fremdZelle.textContent = fremd.toFixed(2) + ' €';
    zeile.appendChild(fremdZelle);

    const pflegeZelle = document.createElement('td');
    pflegeZelle.textContent = pflegekasse.toFixed(2) + ' €';
    zeile.appendChild(pflegeZelle);

    const verfuegbar = budget - fremd - pflegekasse;
    const verfuegbarZelle = document.createElement('td');
    verfuegbarZelle.textContent = verfuegbar.toFixed(2) + ' €';
    verfuegbarZelle.className = verfuegbar >= 0 ? 'budget-positive' : 'budget-negative';
    zeile.appendChild(verfuegbarZelle);

    const privatZelle = document.createElement('td');
    const privatBetrag = verfuegbar < 0 ? Math.abs(verfuegbar) : 0;
    privatZelle.textContent = privatBetrag.toFixed(2) + ' €';
    if (privatBetrag > 0) {
      privatZelle.className = 'budget-negative';
    }
    zeile.appendChild(privatZelle);

    // Doppelklick für Fremd
    zeile.cells[2].addEventListener('dblclick', function () {
      const eingabe = prompt('Fremde Rechnung für ' + monatNamen[monat] + ':', fremd);
      if (eingabe !== null) {
        budgetDaten[jahr][monat].fremd = parseFloat(eingabe.replace(',', '.')) || 0;
        budgetTabelleAktualisieren();
      }
    });

    // Doppelklick für Pflegekasse
    zeile.cells[3].addEventListener('dblclick', function () {
      const eingabe = prompt('Eigene Rechnung für ' + monatNamen[monat] + ':', pflegekasse);
      if (eingabe !== null) {
        budgetDaten[jahr][monat].pflegekasse = parseFloat(eingabe.replace(',', '.')) || 0;
        budgetTabelleAktualisieren();
      }
    });

    budgetTabelleBody.appendChild(zeile);
  }

  // Initialstatus setzen
  budgetVerbrauchtSelect.dispatchEvent(new Event('change'));
  jahrAuswahlSelect.value = new Date().getFullYear();
});
