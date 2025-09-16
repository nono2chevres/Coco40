const storageKey = 'advent-calendar-opened-doors-2';
const startDate = new Date(2025, 9, 16);

startDate.setHours(0, 0, 0, 0);
const doorContentConfigUrl = 'door-content.json';

function getReleaseDate(index) {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + index);
  date.setHours(0, 0, 0, 0);
  return date;
}

function loadUnlockedSet() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    const sanitized = parsed
      .filter((value) => Number.isInteger(value) && value >= 0)
      .map((value) => value);
    return new Set(sanitized);
  } catch (error) {
    console.warn('Impossible de lire les jours ouverts enregistrés :', error);
    return new Set();
  }
}

function persistUnlockedSet(unlockedSet) {
  try {
    const sorted = Array.from(unlockedSet).sort((a, b) => a - b);
    localStorage.setItem(storageKey, JSON.stringify(sorted));
  } catch (error) {
    console.warn("Impossible d'enregistrer la progression du calendrier :", error);
  }
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];

  if (days) {
    parts.push(`${days} jour${days > 1 ? 's' : ''}`);
  }
  if (days || hours) {
    parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
  }
  if (days || hours || minutes) {
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }
  parts.push(`${seconds} seconde${seconds > 1 ? 's' : ''}`);

  return parts.join(' ');
}

function normalizeDoorContentEntry(day, entry) {
  const normalizedDay = Number(day);
  if (!Number.isInteger(normalizedDay) || normalizedDay < 1) {
    return null;
  }

  const fallbackMessage = "Le cadeau de ce jour n'est pas encore prêt.";
  const normalized = {
    day: normalizedDay,
    title: `Cadeau du jour ${normalizedDay}`,
    type: 'none',
    url: '',
    poster: '',
    alt: '',
    caption: '',
    fallbackMessage,
  };

  if (typeof entry === 'string') {
    const text = entry.trim();
    if (text) {
      normalized.title = text;
    }
    return normalized;
  }

  const source = entry && typeof entry === 'object' ? entry : {};

  if (typeof source.text === 'string' && source.text.trim()) {
    normalized.title = source.text.trim();
  }

  if (typeof source.caption === 'string' && source.caption.trim()) {
    normalized.caption = source.caption.trim();
  }

  if (typeof source.fallback === 'string' && source.fallback.trim()) {
    normalized.fallbackMessage = source.fallback.trim();
  }

  if (typeof source.type === 'string') {
    const type = source.type.trim().toLowerCase();
    if (type === 'video') {
      normalized.type = 'video';
    } else if (type === 'photo' || type === 'image' || type === 'picture') {
      normalized.type = 'photo';
    }
  }

  if (typeof source.url === 'string' && source.url.trim()) {
    normalized.url = source.url.trim();
  }

  if (typeof source.poster === 'string' && source.poster.trim()) {
    normalized.poster = source.poster.trim();
  }

  if (typeof source.alt === 'string' && source.alt.trim()) {
    normalized.alt = source.alt.trim();
  }

  if (normalized.type === 'photo' && !normalized.alt) {
    normalized.alt = normalized.title;
  }

  if ((normalized.type === 'video' || normalized.type === 'photo') && !normalized.url) {
    normalized.type = 'none';
  }

  return normalized;
}

function normalizeDoorContentCollection(raw) {
  const map = new Map();

  const processEntry = (dayValue, value, index) => {
    let day = Number(dayValue);
    if (value && typeof value === 'object' && 'day' in value) {
      const entryDay = Number(value.day);
      if (Number.isInteger(entryDay) && entryDay >= 1) {
        day = entryDay;
      }
    }
    if (!Number.isInteger(day) || day < 1) {
      day = index + 1;
    }
    const normalized = normalizeDoorContentEntry(day, value);
    if (normalized) {
      map.set(day, normalized);
    }
  };

  if (Array.isArray(raw)) {
    raw.forEach((item, index) => {
      const dayValue =
        item && typeof item === 'object' && 'day' in item ? item.day : index + 1;
      processEntry(dayValue, item, index);
    });
  } else if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.doors)) {
      raw.doors.forEach((item, index) => {
        const dayValue =
          item && typeof item === 'object' && 'day' in item ? item.day : index + 1;
        processEntry(dayValue, item, index);
      });
    } else if (raw.doors && typeof raw.doors === 'object') {
      Object.entries(raw.doors).forEach(([key, value], index) => {
        processEntry(key, value, index);
      });
    } else {
      Object.entries(raw).forEach(([key, value], index) => {
        processEntry(key, value, index);
      });
    }
  }

  return map;
}

async function fetchDoorContentConfig(url) {
  if (!window.fetch) {
    return new Map();
  }

  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Statut ${response.status}`);
    }
    const data = await response.json();
    return normalizeDoorContentCollection(data);
  } catch (error) {
    console.warn('Impossible de charger le contenu des cadeaux :', error);
    return new Map();
  }
}

function createModalManager(modalElement) {
  if (!(modalElement instanceof HTMLElement)) {
    return {
      open: () => {},
      close: () => {},
      isOpen: () => false,
      isForDay: () => false,
    };
  }

  const closeElements = Array.from(modalElement.querySelectorAll('[data-modal-close]'));
  const titleElement = modalElement.querySelector('[data-modal-title]');
  const bodyElement = modalElement.querySelector('[data-modal-body]');

  let lastFocusedElement = null;
  let activeVideo = null;
  let activeDay = null;

  const focusableSelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    'video',
  ];

  function setBodyModalState(isOpen) {
    document.body.classList.toggle('body--modal-open', isOpen);
  }

  function clearActiveMedia() {
    if (activeVideo instanceof HTMLVideoElement) {
      activeVideo.pause();
      activeVideo.currentTime = 0;
    }
    activeVideo = null;
  }

  function updateModalBody(nodes) {
    if (!bodyElement) {
      return;
    }

    if (typeof bodyElement.replaceChildren === 'function') {
      bodyElement.replaceChildren(...nodes);
    } else {
      bodyElement.innerHTML = '';
      nodes.forEach((node) => {
        bodyElement.appendChild(node);
      });
    }
  }

  function renderContent(day, entry) {
    const normalized = entry || normalizeDoorContentEntry(day, null);

    if (titleElement) {
      titleElement.textContent = normalized ? normalized.title : '';
    }

    clearActiveMedia();
    const nodes = [];

    if (!normalized) {
      const fallback = document.createElement('p');
      fallback.className = 'door-modal__fallback';
      fallback.textContent = "Le cadeau de ce jour n'est pas encore prêt.";
      nodes.push(fallback);
      updateModalBody(nodes);
      return;
    }

    if (normalized.type === 'video') {
      const video = document.createElement('video');
      video.className = 'door-modal__video';
      video.controls = true;
      video.preload = 'metadata';
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.src = normalized.url;
      if (normalized.poster) {
        video.poster = normalized.poster;
      }
      video.innerHTML = 'Votre navigateur ne supporte pas la lecture vidéo.';
      nodes.push(video);

      if (normalized.caption) {
        const caption = document.createElement('p');
        caption.className = 'door-modal__caption';
        caption.textContent = normalized.caption;
        nodes.push(caption);
      }

      activeVideo = video;
    } else if (normalized.type === 'photo') {
      const figure = document.createElement('figure');
      figure.className = 'door-modal__figure';

      const image = document.createElement('img');
      image.className = 'door-modal__image';
      image.src = normalized.url;
      image.alt = normalized.alt || normalized.title;
      figure.appendChild(image);

      if (normalized.caption) {
        const caption = document.createElement('figcaption');
        caption.className = 'door-modal__caption';
        caption.textContent = normalized.caption;
        figure.appendChild(caption);
      }

      nodes.push(figure);
    } else {
      const fallback = document.createElement('p');
      fallback.className = 'door-modal__fallback';
      fallback.textContent = normalized.fallbackMessage;
      nodes.push(fallback);
    }

    updateModalBody(nodes);
  }

  function open(day, entry) {
    renderContent(day, entry);

    lastFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    modalElement.classList.add('door-modal--visible');
    modalElement.setAttribute('aria-hidden', 'false');
    setBodyModalState(true);

    const initialFocus = modalElement.querySelector('[data-modal-initial-focus]');
    if (initialFocus instanceof HTMLElement) {
      initialFocus.focus({ preventScroll: true });
    } else {
      const dialog = modalElement.querySelector('.door-modal__dialog');
      if (dialog instanceof HTMLElement) {
        dialog.focus({ preventScroll: true });
      }
    }

    if (activeVideo instanceof HTMLVideoElement) {
      const playPromise = activeVideo.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {});
      }
    }

    activeDay = day;
  }

  function close() {
    if (!isOpen()) {
      return;
    }

    clearActiveMedia();

    updateModalBody([]);

    modalElement.classList.remove('door-modal--visible');
    modalElement.setAttribute('aria-hidden', 'true');
    setBodyModalState(false);

    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus({ preventScroll: true });
    }

    lastFocusedElement = null;
    activeDay = null;
  }

  function isOpen() {
    return modalElement.classList.contains('door-modal--visible');
  }

  function isForDay(day) {
    return activeDay === day;
  }

  function trapFocus(event) {
    const focusableElements = Array.from(
      modalElement.querySelectorAll(focusableSelectors.join(', '))
    ).filter(
      (element) =>
        element instanceof HTMLElement &&
        !element.hasAttribute('disabled') &&
        element.tabIndex !== -1 &&
        element.offsetParent !== null
    );

    if (!focusableElements.length) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus({ preventScroll: true });
      }
    } else if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus({ preventScroll: true });
    }
  }

  closeElements.forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      close();
    });
  });

  modalElement.addEventListener('click', (event) => {
    if (event.target === modalElement) {
      close();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) {
      return;
    }

    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      trapFocus(event);
    }
  });

  return {
    open,
    close,
    isOpen,
    isForDay,
  };
}

function ensureDoorGiftSetup(doorElement, dayNumber, modalManager, doorContentMap) {
  if (!(doorElement instanceof HTMLElement)) {
    return;
  }

  doorElement.classList.add('door--has-gift');

  let content = doorElement.querySelector('.door__content');
  if (!(content instanceof HTMLElement)) {
    content = document.createElement('div');
    content.className = 'door__content door__content--gift';
    doorElement.appendChild(content);
  } else {
    content.classList.add('door__content--gift');
  }

  content.setAttribute('aria-hidden', 'true');

  let button = content.querySelector('[data-door-gift-button]');
  if (!(button instanceof HTMLButtonElement)) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'door__gift-button';
    content.appendChild(button);
  }

  button.setAttribute('data-door-gift-button', '');
  button.dataset.day = String(dayNumber);
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', 'door-surprise-modal');
  button.setAttribute('aria-label', 'Ouvrir le cadeau');

  let image = button.querySelector('.door__gift-image');
  if (!(image instanceof HTMLImageElement)) {
    image = document.createElement('img');
    image.className = 'door__gift-image';
    image.setAttribute('aria-hidden', 'true');
    button.appendChild(image);
  }

  image.src = 'media/gift.svg';
  image.alt = '';

  if (!button.dataset.giftListenerAttached) {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!modalManager || typeof modalManager.open !== 'function') {
        return;
      }

      if (!doorElement.classList.contains('door--opened')) {
        return;
      }

      const day = Number(button.dataset.day);
      const entry = doorContentMap.get(day) || null;
      modalManager.open(day, entry);
    });

    button.dataset.giftListenerAttached = 'true';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const modalElement = document.querySelector('[data-door-modal]');
    const modalManager = createModalManager(modalElement);
    const doorContentMap = await fetchDoorContentConfig(doorContentConfigUrl);

    const panes = Array.from(document.querySelectorAll('.door__hinge__pane'));
    if (!panes.length) {
      return;
    }

    const unlockedSet = loadUnlockedSet();

    function updateDoorContentVisibility(doorElement, dayNumber, isOpen) {
      const content = doorElement.querySelector('.door__content');
      if (content) {
        content.setAttribute('aria-hidden', String(!isOpen));
        const button = content.querySelector('[data-door-gift-button]');
        if (button instanceof HTMLElement) {
          if (isOpen) {
            button.removeAttribute('tabindex');
          } else {
            button.setAttribute('tabindex', '-1');
          }
        }
      }

      if (!isOpen && modalManager && typeof modalManager.isForDay === 'function') {
        if (modalManager.isForDay(dayNumber)) {
          modalManager.close();
        }
      }
    }

    const doors = panes
      .map((pane, index) => {
        const doorElement = pane.closest('.door');
        if (!doorElement) {
          return null;
        }

        const dayNumber = index + 1;

        ensureDoorGiftSetup(doorElement, dayNumber, modalManager, doorContentMap);

        let countdown = doorElement.querySelector('.message');
        if (!(countdown instanceof HTMLElement)) {
          countdown = document.createElement('div');
          countdown.className = 'message';
          doorElement.appendChild(countdown);
        }

        const label = pane.querySelector('.number');
        if (label) {
          label.textContent = String(dayNumber);
        }

        const releaseDate = getReleaseDate(index);
        pane.dataset.releaseDate = releaseDate.toISOString();

        if (unlockedSet.has(index)) {
          pane.classList.add('door__hinge__pane--open');
          doorElement.classList.add('door--opened', 'door--unlocked');
        }

        const doorData = {
          index,
          dayNumber,
          pane,
          doorElement,
          countdown,
          releaseDate,
        };

        const isOpen = pane.classList.contains('door__hinge__pane--open');
        updateDoorContentVisibility(doorElement, dayNumber, isOpen);

        return doorData;
      })
      .filter((doorData) => doorData !== null);

    function arePreviousUnlocked(index) {
      for (let i = 0; i < index; i += 1) {
        if (!unlockedSet.has(i)) {
          return false;
        }
      }
      return true;
    }

    function updateDoorStates() {
      const now = new Date();
      let nextLockedDoor = null;

      doors.forEach((door) => {
        const unlocked = unlockedSet.has(door.index);
        const isOpen = door.pane.classList.contains('door__hinge__pane--open');
        const previousUnlocked = arePreviousUnlocked(door.index);
        const availableByDate = now >= door.releaseDate;
        const canOpen = previousUnlocked && availableByDate;

        door.doorElement.classList.toggle('door--available', !unlocked && canOpen);
        door.doorElement.classList.toggle('door--locked', !unlocked && !canOpen);
        door.doorElement.classList.toggle('door--unlocked', unlocked);
        door.doorElement.classList.toggle('door--opened', isOpen);

        door.countdown.textContent = '';
        door.countdown.classList.remove('door__countdown--visible');
        door.doorElement.classList.remove('door--show-countdown');

        updateDoorContentVisibility(door.doorElement, door.dayNumber, isOpen);

        if (!unlocked && !nextLockedDoor && previousUnlocked) {
          nextLockedDoor = door;
        }
      });

      if (nextLockedDoor) {
        const diff = nextLockedDoor.releaseDate.getTime() - now.getTime();
        if (diff > 0) {
          nextLockedDoor.countdown.textContent = `Prochain cadeau dans ${formatDuration(diff)}`;
          nextLockedDoor.countdown.classList.add('door__countdown--visible');
          nextLockedDoor.doorElement.classList.add('door--show-countdown');
        }
      }
    }

    doors.forEach((door) => {
      door.pane.addEventListener('click', (event) => {
        const content = door.doorElement.querySelector('.door__content');
        if (
          content &&
          event.target instanceof Node &&
          content.contains(event.target)
        ) {
          return;
        }

        const unlocked = unlockedSet.has(door.index);
        const now = new Date();

        if (!unlocked) {
          if (!arePreviousUnlocked(door.index) || now < door.releaseDate) {
            return;
          }
          unlockedSet.add(door.index);
          persistUnlockedSet(unlockedSet);
        }

        const isOpen = door.pane.classList.toggle('door__hinge__pane--open');
        door.doorElement.classList.toggle('door--opened', isOpen);
        door.doorElement.classList.add('door--unlocked');

        updateDoorContentVisibility(door.doorElement, door.dayNumber, isOpen);

        updateDoorStates();
      });
    });

    updateDoorStates();
    setInterval(updateDoorStates, 1000);
  } catch (error) {
    console.error("Erreur lors de l'initialisation du calendrier :", error);
  }
});
