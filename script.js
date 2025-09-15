const storageKey = 'advent-calendar-opened-doors';
const startDate = new Date(2025, 8, 16);

function cloneDateWithOffset(index) {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + index);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getStoredOpenDoors() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((value) => Number.isInteger(value));
    }
  } catch (error) {
    console.warn('Impossible de lire les jours ouverts enregistrés :', error);
  }
  return [];
}

function persistOpenDoors(indices) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(indices));
  } catch (error) {
    console.warn("Impossible d'enregistrer la progression du calendrier :", error);
  }
}

function arePreviousDoorsOpen(doors, index) {
  for (let i = 0; i < index; i += 1) {
    if (!doors[i].pane.classList.contains('door__hinge__pane--open')) {
      return false;
    }
  }
  return true;
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

function initialiseDoors() {
  const panes = Array.from(document.querySelectorAll('.door__hinge__pane'));
  if (!panes.length) {
    return [];
  }

  const storedOpen = new Set(getStoredOpenDoors());

  return panes.map((pane, index) => {
    const doorElement = pane.closest('.door');
    let countdown = doorElement.querySelector('.door__countdown');
    if (!countdown) {
      countdown = document.createElement('div');
      countdown.className = 'door__countdown';
      doorElement.appendChild(countdown);
    }

    const label = pane.querySelector('.number');
    if (label) {
      label.textContent = `Jour ${index + 1}`;
    }

    const releaseDate = cloneDateWithOffset(index);
    pane.dataset.releaseDate = releaseDate.toISOString();

    if (storedOpen.has(index)) {
      pane.classList.add('door__hinge__pane--open');
      doorElement.classList.add('door--opened');
    }

    return {
      pane,
      doorElement,
      countdown,
      index,
      releaseDate,
    };
  });
}

function setupInteractions(doors) {
  const openedSet = new Set(
    doors
      .map((door, index) => (door.pane.classList.contains('door__hinge__pane--open') ? index : null))
      .filter((index) => index !== null),
  );

  function updateStorage() {
    persistOpenDoors(Array.from(openedSet).sort((a, b) => a - b));
  }

  function updateDoorStates() {
    const now = new Date();
    let nextDoor = null;

    doors.forEach((door) => {
      const isOpen = door.pane.classList.contains('door__hinge__pane--open');
      const previousOpen = arePreviousDoorsOpen(doors, door.index);
      const unlockedByDate = now >= door.releaseDate;
      const isAvailable = !isOpen && previousOpen && unlockedByDate;

      door.doorElement.classList.toggle('door--available', isAvailable);
      door.doorElement.classList.toggle('door--locked', !isOpen && !isAvailable);
      door.doorElement.classList.toggle('door--opened', isOpen);

      if (!isOpen && !nextDoor && previousOpen) {
        nextDoor = door;
      }

      door.countdown.textContent = '';
      door.countdown.classList.remove('door__countdown--visible');
      door.doorElement.classList.remove('door--show-countdown');
    });

    if (nextDoor) {
      const diff = nextDoor.releaseDate.getTime() - now.getTime();
      if (diff > 0) {
        nextDoor.countdown.textContent = `Prochain cadeau dans ${formatDuration(diff)}`;
      } else {
        nextDoor.countdown.textContent = 'Cadeau disponible !';
      }
      nextDoor.countdown.classList.add('door__countdown--visible');
      nextDoor.doorElement.classList.add('door--show-countdown');
    }
  }

  doors.forEach((door) => {
    door.pane.addEventListener('click', () => {
      const alreadyOpen = door.pane.classList.contains('door__hinge__pane--open');
      if (alreadyOpen) {
        return;
      }

      if (!arePreviousDoorsOpen(doors, door.index)) {
        return;
      }

      const now = new Date();
      if (now < door.releaseDate) {
        return;
      }

      door.pane.classList.add('door__hinge__pane--open');
      door.doorElement.classList.add('door--opened');
      openedSet.add(door.index);
      updateStorage();
      updateDoorStates();
    });
  });

  updateDoorStates();
  setInterval(updateDoorStates, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  const doors = initialiseDoors();
  if (doors.length) {
    setupInteractions(doors);
  }
});
