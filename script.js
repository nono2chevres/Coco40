const storageKey = 'advent-calendar-opened-doors';
const startDate = new Date(2025, 8, 16);
startDate.setHours(0, 0, 0, 0);

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

document.addEventListener('DOMContentLoaded', () => {
  const doorOneGiftButton = document.querySelector('[data-door-gift-button]');
  const doorOneModal = document.querySelector('[data-door-modal="1"]');
  const doorOneModalCloseElements = doorOneModal
    ? Array.from(doorOneModal.querySelectorAll('[data-modal-close]'))
    : [];
  const doorOneVideo = doorOneModal ? doorOneModal.querySelector('video') : null;
  let doorOneLastFocusedElement = null;

  function isDoorOneModalVisible() {
    return Boolean(doorOneModal && doorOneModal.classList.contains('door-modal--visible'));
  }

  function setBodyModalState(isOpen) {
    document.body.classList.toggle('body--modal-open', isOpen);
  }

  function openDoorOneModal() {
    if (!doorOneModal) {
      return;
    }

    doorOneLastFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    doorOneModal.classList.add('door-modal--visible');
    doorOneModal.setAttribute('aria-hidden', 'false');
    setBodyModalState(true);

    const initialFocus = doorOneModal.querySelector('[data-modal-initial-focus]');
    if (initialFocus instanceof HTMLElement) {
      initialFocus.focus({ preventScroll: true });
    }

    if (doorOneVideo instanceof HTMLVideoElement) {
      const playPromise = doorOneVideo.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {});
      }
    }
  }

  function closeDoorOneModal() {
    if (!doorOneModal) {
      return;
    }

    if (doorOneVideo instanceof HTMLVideoElement) {
      doorOneVideo.pause();
      doorOneVideo.currentTime = 0;
    }

    doorOneModal.classList.remove('door-modal--visible');
    doorOneModal.setAttribute('aria-hidden', 'true');
    setBodyModalState(false);

    if (doorOneLastFocusedElement && document.contains(doorOneLastFocusedElement)) {
      doorOneLastFocusedElement.focus({ preventScroll: true });
    }

    doorOneLastFocusedElement = null;
  }

  function trapDoorOneFocus(event) {
    if (!doorOneModal) {
      return;
    }

    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
      'video',
    ];

    const focusableElements = Array.from(
      doorOneModal.querySelectorAll(focusableSelectors.join(', '))
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

  if (doorOneGiftButton && doorOneModal) {
    doorOneGiftButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openDoorOneModal();
    });
  }

  doorOneModalCloseElements.forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      closeDoorOneModal();
    });
  });

  if (doorOneModal) {
    doorOneModal.addEventListener('click', (event) => {
      if (event.target === doorOneModal) {
        closeDoorOneModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!isDoorOneModalVisible()) {
      return;
    }

    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      closeDoorOneModal();
    } else if (event.key === 'Tab') {
      trapDoorOneFocus(event);
    }
  });

  const panes = Array.from(document.querySelectorAll('.door__hinge__pane'));
  if (!panes.length) {
    return;
  }

  const unlockedSet = loadUnlockedSet();

  function updateDoorContentVisibility(doorElement, isOpen) {
    const content = doorElement.querySelector('.door__content');
    if (content) {
      content.setAttribute('aria-hidden', String(!isOpen));
    }

    if (!isOpen && doorElement.classList.contains('door--has-gift')) {
      closeDoorOneModal();
    }
  }

  const doors = panes.map((pane, index) => {
    const doorElement = pane.closest('.door');
    let countdown = doorElement.querySelector('.message');
    if (!countdown) {
      countdown = document.createElement('div');
      countdown.className = 'message';
      doorElement.appendChild(countdown);
    }

    const label = pane.querySelector('.number');
    if (label) {
      label.textContent = String(index + 1);
    }

    const releaseDate = getReleaseDate(index);
    pane.dataset.releaseDate = releaseDate.toISOString();

    if (unlockedSet.has(index)) {
      pane.classList.add('door__hinge__pane--open');
      doorElement.classList.add('door--opened', 'door--unlocked');
    }

    const doorData = {
      index,
      pane,
      doorElement,
      countdown,
      releaseDate,
    };

    const isOpen = pane.classList.contains('door__hinge__pane--open');
    updateDoorContentVisibility(doorElement, isOpen);

    return doorData;
  });

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

      updateDoorContentVisibility(door.doorElement, isOpen);

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
    door.pane.addEventListener('click', () => {
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

      updateDoorContentVisibility(door.doorElement, isOpen);

      updateDoorStates();
    });
  });

  updateDoorStates();
  setInterval(updateDoorStates, 1000);
});
