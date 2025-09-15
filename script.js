(() => {
  'use strict';

  const START_DATE = new Date(2025, 8, 16); // 16 septembre 2025
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const STORAGE_KEY = 'calendrier-surprises-2025';

  const DOOR_DATA = [
    {
      title: 'Première partition',
      hintLines: [
        'Tourne la manivelle de la boîte à musique.',
        "Une note pliée t'y attend."
      ],
      accentColor: '#ff9f1c',
      backgroundColor: '#fff4df',
      textColor: '#331b05',
      emoji: '🎵',
      caption: 'Laisse résonner la boîte à musique du salon pour découvrir le premier indice.'
    },
    {
      title: 'Carte secrète',
      hintLines: [
        'Ouvre le second tiroir du buffet.',
        'Cherche la carte aux étoiles.'
      ],
      accentColor: '#5c6ac4',
      backgroundColor: '#eef1ff',
      textColor: '#1a1d44',
      emoji: '🗺️',
      caption: 'Un tiroir bien ordinaire peut cacher une carte extraordinaire.'
    },
    {
      title: 'Message glacé',
      hintLines: [
        "Sur le frigo, trouve l'aimant boussole.",
        'Le code est caché derrière.'
      ],
      accentColor: '#2ec4b6',
      backgroundColor: '#e7f8f4',
      textColor: '#103731',
      emoji: '🧭',
      caption: "Un simple aimant garde le secret du cadeau du jour." 
    },
    {
      title: 'Pause café',
      hintLines: [
        'Soulève le plateau de la machine à café.',
        "Un indice parfumé s'y glisse."
      ],
      accentColor: '#d81159',
      backgroundColor: '#ffe6f0',
      textColor: '#3e0a1a',
      emoji: '☕',
      caption: 'Pendant la pause café, un parfum mène au présent.'
    },
    {
      title: 'Livraison express',
      hintLines: [
        "Feuillette le magazine de l'entrée.",
        'La page pliée révèle le lieu.'
      ],
      accentColor: '#ff784f',
      backgroundColor: '#ffe9e1',
      textColor: '#411204',
      emoji: '📦',
      caption: "Une page cornée livre l'indice en express." 
    },
    {
      title: 'Échos du bureau',
      hintLines: [
        'Allume la lampe du bureau trois secondes.',
        'Lis le mot apparu dans la lumière.'
      ],
      accentColor: '#8e44ad',
      backgroundColor: '#f3e9fb',
      textColor: '#2c0d35',
      emoji: '💡',
      caption: 'Quand la lampe s’allume, le message résonne.'
    },
    {
      title: 'Aventure littéraire',
      hintLines: [
        'Choisis le roman le plus coloré.',
        'Une photo sert de marque-page.'
      ],
      accentColor: '#00a896',
      backgroundColor: '#e8f9f5',
      textColor: '#06463f',
      emoji: '📚',
      caption: 'Les pages des romans renferment de précieux souvenirs.'
    },
    {
      title: 'Piste gourmande',
      hintLines: [
        'Ouvre la boîte à biscuits ronde.',
        'Lis le message dans le couvercle.'
      ],
      accentColor: '#c86b3c',
      backgroundColor: '#fceee5',
      textColor: '#48230f',
      emoji: '🍪',
      caption: 'Un couvercle croquant révèle une piste gourmande.'
    },
    {
      title: 'Écharpe messagère',
      hintLines: [
        "Sur le porte-manteau, vise l'écharpe rayée.",
        'Le cadeau y est attaché.'
      ],
      accentColor: '#536dfe',
      backgroundColor: '#eef0ff',
      textColor: '#10194d',
      emoji: '🧣',
      caption: 'Enfilée sur le porte-manteau, une écharpe chuchote un secret.'
    },
    {
      title: 'Souvenir en couleurs',
      hintLines: [
        'Décroche la photo la plus récente.',
        "Un mot doré t'attend derrière."
      ],
      accentColor: '#f6bd60',
      backgroundColor: '#fff6e7',
      textColor: '#4a2a07',
      emoji: '📸',
      caption: 'Chaque souvenir prend vie avec un indice doré.'
    },
    {
      title: 'Chuchotements du jardin',
      hintLines: [
        'Arrose la plante près de la baie vitrée.',
        'Une étiquette apparaît dans le pot.'
      ],
      accentColor: '#6ab04c',
      backgroundColor: '#edf8e6',
      textColor: '#12330d',
      emoji: '🌿',
      caption: 'Une plante bien hydratée souffle la direction du cadeau.'
    },
    {
      title: 'Notes parfumées',
      hintLines: [
        'Ouvre le tiroir aux bougies parfumées.',
        'Soulève celle à la vanille.'
      ],
      accentColor: '#e056fd',
      backgroundColor: '#fbe8ff',
      textColor: '#3a0d4c',
      emoji: '🕯️',
      caption: 'Sous une douce odeur, un indice scintille.'
    },
    {
      title: 'Mission cinéma',
      hintLines: [
        'Ouvre le boîtier du DVD favori.',
        'Un plan y est dissimulé.'
      ],
      accentColor: '#34495e',
      backgroundColor: '#e8f0f7',
      textColor: '#13202c',
      emoji: '🎬',
      caption: 'Le boîtier d’un film culte mène à une nouvelle scène.'
    },
    {
      title: 'Secret du grenier',
      hintLines: [
        'Monte chercher la valise bleue.',
        'Regarde sous la doublure.'
      ],
      accentColor: '#ff6f91',
      backgroundColor: '#ffe7ef',
      textColor: '#541225',
      emoji: '🧳',
      caption: 'Au grenier, une valise dissimule un message délicat.'
    },
    {
      title: 'Indice connecté',
      hintLines: [
        'Branche la console de jeux.',
        'Le profil Mystère te parle.'
      ],
      accentColor: '#2d9cdb',
      backgroundColor: '#e6f4fc',
      textColor: '#0f3a57',
      emoji: '🎮',
      caption: 'Une console connectée fait apparaître un message vocal.'
    },
    {
      title: 'Boîte aux lettres',
      hintLines: [
        'Regarde la boîte aux lettres intérieure.',
        'Un mini colis indique la cachette.'
      ],
      accentColor: '#c0392b',
      backgroundColor: '#fdecea',
      textColor: '#4a0d08',
      emoji: '📬',
      caption: 'La mini boîte aux lettres livre une nouvelle mission.'
    },
    {
      title: 'Douceur du matin',
      hintLines: [
        "Soulève l'oreiller de gauche.",
        'Une enveloppe au ruban rouge attend.'
      ],
      accentColor: '#f2994a',
      backgroundColor: '#fff1e3',
      textColor: '#49250a',
      emoji: '🛏️',
      caption: 'Sous un oreiller moelleux repose un doux secret.'
    },
    {
      title: 'Pause thé',
      hintLines: [
        'Choisis un sachet de thé vert.',
        'Lis le mot dans le couvercle.'
      ],
      accentColor: '#27ae60',
      backgroundColor: '#e8f7ee',
      textColor: '#0a3a1d',
      emoji: '🍵',
      caption: 'Une boîte à thé renferme une touche de poésie.'
    },
    {
      title: 'Mélodie nocturne',
      hintLines: [
        'Ouvre le piano et joue do majeur.',
        "Un message s'affiche à l'écran."
      ],
      accentColor: '#9b59b6',
      backgroundColor: '#f2eafa',
      textColor: '#331044',
      emoji: '🎹',
      caption: 'Un accord suffit à révéler la surprise nocturne.'
    },
    {
      title: 'Parapluie complice',
      hintLines: [
        'Accroche le parapluie jaune.',
        'La poignée livre une coordonnée.'
      ],
      accentColor: '#1abc9c',
      backgroundColor: '#e5faf4',
      textColor: '#0d3f35',
      emoji: '☔',
      caption: 'Même la pluie ne peut éteindre la chasse aux trésors.'
    },
    {
      title: 'Coffre aux trésors',
      hintLines: [
        'Tire la boîte à souvenirs sous le lit.',
        'Le carnet bleu donne le lieu.'
      ],
      accentColor: '#f4a261',
      backgroundColor: '#fff0e6',
      textColor: '#4b2b11',
      emoji: '💎',
      caption: 'Les souvenirs gardent la trace de la surprise suivante.'
    },
    {
      title: 'Atelier créatif',
      hintLines: [
        'Dans le tiroir des pinceaux, vise le ruban violet.',
        'Le cadeau est fixé à la palette.'
      ],
      accentColor: '#e67e22',
      backgroundColor: '#fff2e6',
      textColor: '#4a2505',
      emoji: '🎨',
      caption: 'Dans l’atelier, les couleurs indiquent la prochaine étape.'
    },
    {
      title: 'Minute sportive',
      hintLines: [
        'Déroule le tapis de yoga.',
        'Lis le mot dans la sangle.'
      ],
      accentColor: '#6c5ce7',
      backgroundColor: '#ebe9ff',
      textColor: '#211a5f',
      emoji: '🧘',
      caption: 'Une séance d’étirements révèle une note inspirante.'
    },
    {
      title: 'Finale étincelante',
      hintLines: [
        'Allume la guirlande du salon.',
        'Le coffret brille près de la fenêtre.'
      ],
      accentColor: '#ff4757',
      backgroundColor: '#ffe7ea',
      textColor: '#571118',
      emoji: '✨',
      caption: 'La lumière finale dévoile la récompense tant attendue.'
    }
  ];

  document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    if (!calendar) {
      return;
    }

    const { referenceDate, isSimulated } = resolveReferenceDate();
    const normalizedStart = stripTime(START_DATE);
    const normalizedReference = stripTime(referenceDate);
    const differenceInDays = Math.floor((normalizedReference - normalizedStart) / MS_PER_DAY);
    const unlockedCount = normalizedReference < normalizedStart
      ? 0
      : Math.min(DOOR_DATA.length, differenceInDays + 1);

    const openedDoors = loadOpenedDoors();
    const messageElement = document.querySelector('[data-calendar-message]');
    const progressElement = document.querySelector('[data-calendar-progress]');
    const nextElement = document.querySelector('[data-calendar-next]');
    const dateElement = document.querySelector('[data-reference-date]');

    if (dateElement) {
      const prefix = isSimulated ? 'Date simulée :' : "Aujourd'hui :";
      dateElement.textContent = `${prefix} ${formatDateLong(normalizedReference)}`;
    }

    if (progressElement) {
      if (unlockedCount > 0) {
        let progressText = `Cases disponibles : ${unlockedCount} sur ${DOOR_DATA.length}.`;
        if (openedDoors.size > 0) {
          progressText += ` Cases déjà explorées : ${openedDoors.size}.`;
        }
        progressElement.textContent = progressText;
      } else {
        progressElement.textContent = `La première case s'ouvrira le ${formatDateLong(normalizedStart)}.`;
      }
    }

    if (nextElement) {
      if (unlockedCount >= DOOR_DATA.length) {
        nextElement.textContent = 'Toutes les cases ont été débloquées. Profite des surprises !';
      } else {
        const nextIndex = Math.max(unlockedCount, 0);
        const nextDate = addDays(normalizedStart, nextIndex);
        const prefix = unlockedCount === 0 ? 'Patience !' : 'Prochaine ouverture :';
        nextElement.textContent = `${prefix} la case ${nextIndex + 1} sera disponible le ${formatDateLong(nextDate)}.`;
      }
    }

    const dialog = document.getElementById('door-dialog');
    const dialogTitle = dialog?.querySelector('[data-dialog-title]');
    const dialogBody = dialog?.querySelector('[data-dialog-body]');
    const dialogDate = dialog?.querySelector('[data-dialog-date]');
    const dialogCloseButton = dialog?.querySelector('[data-dialog-close]');
    const supportsDialog = typeof HTMLDialogElement !== 'undefined' && dialog instanceof HTMLDialogElement && typeof dialog.showModal === 'function';

    let activeDoorButton = null;
    let messageTimeoutId = null;

    DOOR_DATA.forEach((entry, index) => {
      const dayNumber = index + 1;
      const availableOn = addDays(normalizedStart, index);
      const isAvailable = dayNumber <= unlockedCount;
      const wasOpened = openedDoors.has(dayNumber);
      const isCurrentDay = isAvailable && dayNumber === unlockedCount;

      const doorButton = document.createElement('button');
      doorButton.type = 'button';
      doorButton.className = 'calendar-door';
      doorButton.dataset.day = String(dayNumber);
      doorButton.dataset.availableOn = availableOn.toISOString();
      doorButton.setAttribute('role', 'listitem');

      doorButton.style.setProperty('--door-background', entry.backgroundColor);
      doorButton.style.setProperty('--door-accent', entry.accentColor);
      if (entry.textColor) {
        doorButton.style.setProperty('--door-text', entry.textColor);
      }

      if (isAvailable) {
        doorButton.classList.add('calendar-door--available');
      } else {
        doorButton.classList.add('calendar-door--locked');
      }

      if (wasOpened) {
        doorButton.classList.add('calendar-door--opened');
      }

      if (isCurrentDay && !wasOpened) {
        doorButton.classList.add('calendar-door--current');
      }

      const numberSpan = document.createElement('span');
      numberSpan.className = 'calendar-door__number';
      numberSpan.textContent = String(dayNumber);
      doorButton.appendChild(numberSpan);

      const titleSpan = document.createElement('span');
      titleSpan.className = 'calendar-door__title';
      titleSpan.textContent = entry.title;
      doorButton.appendChild(titleSpan);

      const labelSpan = document.createElement('span');
      labelSpan.className = 'calendar-door__label';
      labelSpan.textContent = isAvailable
        ? (wasOpened ? 'Revoir l\'indice' : 'Ouvrir la case')
        : 'Encore un peu de patience';
      doorButton.appendChild(labelSpan);

      const availabilitySpan = document.createElement('span');
      availabilitySpan.className = 'calendar-door__availability';
      availabilitySpan.textContent = isAvailable
        ? `Débloquée le ${formatDateShort(availableOn)}`
        : `Disponible le ${formatDateShort(availableOn)}`;
      doorButton.appendChild(availabilitySpan);

      const ariaLabel = isAvailable
        ? `Case ${dayNumber} : ${entry.title}. Ouvrir pour découvrir l'indice.`
        : `Case ${dayNumber} verrouillée. Disponible le ${formatDateLong(availableOn)}.`;
      doorButton.setAttribute('aria-label', ariaLabel);

      doorButton.addEventListener('click', () => {
        if (!isAvailable) {
          showMessage(`La case ${dayNumber} sera disponible le ${formatDateLong(availableOn)}.`, 'info');
          return;
        }

        activeDoorButton = doorButton;
        markDoorAsOpened(dayNumber);
        doorButton.classList.add('calendar-door--opened');
        doorButton.classList.remove('calendar-door--current');
        labelSpan.textContent = 'Revoir l\'indice';

        const mediaSource = resolveMediaSource(entry, dayNumber);
        const altText = `Indice du jour ${dayNumber} : ${entry.hintLines.join(' ')}`;

        if (dialog && dialogBody && dialogTitle && dialogDate) {
          populateDialog({
            dialog,
            dialogBody,
            dialogTitle,
            dialogDate,
            entry,
            dayNumber,
            availableOn,
            mediaSource,
            altText
          });

          openDialog(dialog, supportsDialog);
        }

        showMessage(`Case ${dayNumber} ouverte, bonne chasse !`, 'success');
      });

      calendar.appendChild(doorButton);
    });

    if (dialog && dialogCloseButton) {
      dialogCloseButton.addEventListener('click', () => {
        closeDialog(dialog, supportsDialog);
        if (activeDoorButton) {
          activeDoorButton.focus();
          activeDoorButton = null;
        }
      });

      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeDialog(dialog, supportsDialog);
        if (activeDoorButton) {
          activeDoorButton.focus();
          activeDoorButton = null;
        }
      });

      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
          closeDialog(dialog, supportsDialog);
          if (activeDoorButton) {
            activeDoorButton.focus();
            activeDoorButton = null;
          }
        }
      });

      dialog.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
        document.body.classList.remove('dialog-fallback');
      });
    }

    if (messageElement && unlockedCount === 0) {
      showMessage(`Le compte à rebours commence le ${formatDateLong(normalizedStart)}.`, 'info');
    }

    function showMessage(text, tone) {
      if (!messageElement) {
        return;
      }

      messageElement.textContent = text;
      messageElement.dataset.tone = tone || 'info';
      messageElement.classList.add('calendar__message--visible');

      if (messageTimeoutId) {
        window.clearTimeout(messageTimeoutId);
      }

      messageTimeoutId = window.setTimeout(() => {
        messageElement.classList.remove('calendar__message--visible');
      }, 6000);
    }

    function markDoorAsOpened(dayNumber) {
      if (openedDoors.has(dayNumber)) {
        return;
      }

      openedDoors.add(dayNumber);
      saveOpenedDoors(openedDoors);
    }
  });

  function populateDialog({
    dialog,
    dialogBody,
    dialogTitle,
    dialogDate,
    entry,
    dayNumber,
    availableOn,
    mediaSource,
    altText
  }) {
    dialogTitle.textContent = `Case ${dayNumber} · ${entry.title}`;

    dialogBody.innerHTML = '';

    const mediaWrapper = document.createElement('figure');
    mediaWrapper.className = 'door-dialog__media';

    const image = document.createElement('img');
    image.src = mediaSource;
    image.alt = altText;
    image.loading = 'lazy';
    mediaWrapper.appendChild(image);

    if (entry.caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = entry.caption;
      mediaWrapper.appendChild(figcaption);
    }

    dialogBody.appendChild(mediaWrapper);

    if (Array.isArray(entry.hintLines) && entry.hintLines.length > 0) {
      const textWrapper = document.createElement('div');
      textWrapper.className = 'door-dialog__text';

      entry.hintLines.forEach((line) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = line;
        textWrapper.appendChild(paragraph);
      });

      dialogBody.appendChild(textWrapper);
    }

    dialogDate.textContent = `Indice disponible depuis le ${formatDateLong(availableOn)}.`;
  }

  function openDialog(dialog, supportsDialog) {
    document.body.classList.add('modal-open');
    if (supportsDialog) {
      dialog.showModal();
    } else {
      document.body.classList.add('dialog-fallback');
      dialog.setAttribute('open', '');
    }
  }

  function closeDialog(dialog, supportsDialog) {
    if (supportsDialog && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      document.body.classList.remove('modal-open');
      document.body.classList.remove('dialog-fallback');
    }
  }

  function resolveMediaSource(entry, dayNumber) {
    if (entry.mediaSource) {
      return entry.mediaSource;
    }

    const svgData = createIllustration(dayNumber, entry);
    entry.mediaSource = svgData;
    return svgData;
  }

  function createIllustration(dayNumber, entry) {
    const accent = entry.accentColor || '#ff9f1c';
    const background = entry.backgroundColor || '#fff8ee';
    const textColor = entry.textColor || '#2f1d0f';
    const highlight = entry.highlightColor || lightenColor(accent, 0.25);
    const secondary = entry.secondaryColor || lightenColor(accent, 0.45);
    const title = entry.emoji ? `${entry.emoji} ${entry.title}` : entry.title;
    const hints = Array.isArray(entry.hintLines) ? entry.hintLines : [];

    const lines = hints.map((line, index) => {
      const yPosition = 420 + index * 46;
      return `<tspan x="60" y="${yPosition}">${escapeForSvg(line)}</tspan>`;
    }).join('');

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" role="img" aria-labelledby="title-${dayNumber}" aria-describedby="desc-${dayNumber}">
  <title id="title-${dayNumber}">Indice du jour ${dayNumber}</title>
  <desc id="desc-${dayNumber}">${escapeForSvg(hints.join(' '))}</desc>
  <defs>
    <linearGradient id="gradient-${dayNumber}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${secondary}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
    <style>
      .background { fill: ${background}; }
      .badge { fill: url(#gradient-${dayNumber}); }
      .badge-text { font-family: 'Poppins', 'Segoe UI', sans-serif; font-weight: 700; font-size: 40px; fill: #ffffff; letter-spacing: 0.08em; }
      .title { font-family: 'Poppins', 'Segoe UI', sans-serif; font-weight: 600; font-size: 42px; fill: ${textColor}; }
      .hint { font-family: 'Poppins', 'Segoe UI', sans-serif; font-weight: 500; font-size: 28px; fill: ${textColor}; }
    </style>
  </defs>
  <rect class="background" width="720" height="720" rx="48" />
  <path d="M60 360 C180 250 540 250 660 360 L660 660 L60 660 Z" fill="${highlight}" opacity="0.3" />
  <circle cx="360" cy="220" r="170" fill="${accent}" opacity="0.78" />
  <rect x="170" y="160" width="380" height="120" rx="28" class="badge" opacity="0.95" />
  <text class="badge-text" x="360" y="235" text-anchor="middle">Jour ${dayNumber}${entry.emoji ? ` ${escapeForSvg(entry.emoji)}` : ''}</text>
  <text class="title" x="60" y="340">${escapeForSvg(title)}</text>
  <text class="hint">${lines}</text>
</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function escapeForSvg(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function lightenColor(hexColor, amount) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) {
      return hexColor;
    }

    const lighten = (channel) => {
      const value = Math.round(channel + (255 - channel) * amount);
      return Math.max(0, Math.min(255, value));
    };

    return rgbToHex(lighten(rgb.r), lighten(rgb.g), lighten(rgb.b));
  }

  function hexToRgb(hexColor) {
    const sanitized = hexColor.replace('#', '').trim();

    if (sanitized.length === 3) {
      const r = parseInt(sanitized.charAt(0) + sanitized.charAt(0), 16);
      const g = parseInt(sanitized.charAt(1) + sanitized.charAt(1), 16);
      const b = parseInt(sanitized.charAt(2) + sanitized.charAt(2), 16);
      if ([r, g, b].some(Number.isNaN)) {
        return null;
      }
      return { r, g, b };
    }

    if (sanitized.length === 6) {
      const r = parseInt(sanitized.slice(0, 2), 16);
      const g = parseInt(sanitized.slice(2, 4), 16);
      const b = parseInt(sanitized.slice(4, 6), 16);
      if ([r, g, b].some(Number.isNaN)) {
        return null;
      }
      return { r, g, b };
    }

    return null;
  }

  function rgbToHex(r, g, b) {
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function resolveReferenceDate() {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    if (!dateParam) {
      return { referenceDate: new Date(), isSimulated: false };
    }

    const parsed = parseDateParam(dateParam);
    if (!parsed) {
      return { referenceDate: new Date(), isSimulated: false };
    }

    return { referenceDate: parsed, isSimulated: true };
  }

  function parseDateParam(value) {
    const trimmed = String(value).trim();
    const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(trimmed);

    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);

    const parsedDate = new Date(year, monthIndex, day);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== monthIndex ||
      parsedDate.getDate() !== day
    ) {
      return null;
    }

    return parsedDate;
  }

  function stripTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function formatDateLong(date) {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  function formatDateShort(date) {
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  function loadOpenedDoors() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return new Set();
      }

      const values = JSON.parse(raw);
      if (!Array.isArray(values)) {
        return new Set();
      }

      const filtered = values
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0 && value <= DOOR_DATA.length);

      return new Set(filtered);
    } catch (error) {
      console.warn('Impossible de charger les cases déjà ouvertes :', error);
      return new Set();
    }
  }

  function saveOpenedDoors(openedSet) {
    try {
      const orderedValues = Array.from(openedSet).sort((a, b) => a - b);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orderedValues));
    } catch (error) {
      console.warn('Impossible de sauvegarder les cases ouvertes :', error);
    }
  }
})();
