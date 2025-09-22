const ASSIST_TITLE_PATTERNS = [
  /Passe\s+d[ée]cisive\s+de\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Passe\s+d[ée]cisive\s+par\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Assist(?:ed)?\s+by\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Assist\s*[:]\s*([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Assistência\s+de\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Assist[êe]ncia\s+de\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Asistencia\s+de\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Asistència\s+de\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Pase\s+de\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Assistenz\s+von\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
  /Assistito\s+da\s+([^,()]+?)(?=(?:\s*(?:,|\(|\.|;|$)))/gi,
];

function stripDiacritics(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeWhitespace(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function normalizeName(value) {
  if (!value) {
    return '';
  }

  const stripped = stripDiacritics(value)
    .replace(/[^0-9A-Za-z]+/g, ' ')
    .trim()
    .toLowerCase();

  return stripped.replace(/\s+/g, ' ');
}

function cleanCandidateName(raw) {
  if (!raw) {
    return '';
  }

  const cleaned = normalizeWhitespace(raw)
    .replace(/^[-,:;\s]+/, '')
    .replace(/[-,:;\s]+$/, '')
    .trim();

  return cleaned;
}

function extractAssistCandidatesFromTitle(title) {
  if (!title || typeof title !== 'string') {
    return [];
  }

  const candidates = [];
  const seen = new Set();

  ASSIST_TITLE_PATTERNS.forEach((pattern) => {
    pattern.lastIndex = 0;
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = pattern.exec(title))) {
      const rawName = cleanCandidateName(match[1]);
      if (!rawName) {
        continue;
      }

      const normalizedName = normalizeName(rawName);
      if (!normalizedName || seen.has(normalizedName)) {
        continue;
      }

      seen.add(normalizedName);
      candidates.push({ name: rawName, normalizedName });
    }
  });

  return candidates;
}

function toNumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getTeamId(incident) {
  if (!incident || typeof incident !== 'object') {
    return null;
  }

  if (incident.teamId != null) {
    return toNumberOrNull(incident.teamId);
  }

  if (incident.teamID != null) {
    return toNumberOrNull(incident.teamID);
  }

  if (incident.team && incident.team.id != null) {
    return toNumberOrNull(incident.team.id);
  }

  if (incident.team && incident.team.teamId != null) {
    return toNumberOrNull(incident.team.teamId);
  }

  if (incident.team && incident.team.teamID != null) {
    return toNumberOrNull(incident.team.teamID);
  }

  return null;
}

function getIncidentPlayerName(incident) {
  if (!incident || typeof incident !== 'object') {
    return '';
  }

  const { playerName, name, player, scorer, author } = incident;

  if (typeof playerName === 'string' && playerName.trim()) {
    return playerName.trim();
  }

  if (typeof name === 'string' && name.trim()) {
    return name.trim();
  }

  if (player && typeof player.name === 'string' && player.name.trim()) {
    return player.name.trim();
  }

  if (typeof scorer === 'string' && scorer.trim()) {
    return scorer.trim();
  }

  if (scorer && typeof scorer.name === 'string' && scorer.name.trim()) {
    return scorer.name.trim();
  }

  if (typeof author === 'string' && author.trim()) {
    return author.trim();
  }

  if (author && typeof author.name === 'string' && author.name.trim()) {
    return author.name.trim();
  }

  return '';
}

function getAssistName(assist) {
  if (!assist) {
    return '';
  }

  if (typeof assist === 'string') {
    return assist;
  }

  if (typeof assist.name === 'string') {
    return assist.name;
  }

  return '';
}

function findLastIncidentBefore(incidents, startIndex, predicate) {
  for (let index = startIndex; index >= 0; index -= 1) {
    const incident = incidents[index];
    if (!incident || typeof incident !== 'object') {
      continue;
    }

    if (predicate(incident, index)) {
      return index;
    }
  }

  return null;
}

function cloneIncident(incident) {
  if (!incident || typeof incident !== 'object') {
    return incident;
  }

  const clone = { ...incident };

  if (Array.isArray(clone.assists)) {
    clone.assists = clone.assists.map((assist) =>
      assist && typeof assist === 'object' ? { ...assist } : assist
    );
  }

  if (Array.isArray(clone.assistFor)) {
    clone.assistFor = clone.assistFor.map((target) =>
      target && typeof target === 'object' ? { ...target } : target
    );
  }

  return clone;
}

function detectAssists(incidents) {
  if (!Array.isArray(incidents)) {
    return [];
  }

  const annotated = incidents.map((incident) => cloneIncident(incident));

  annotated.forEach((incident, index) => {
    if (!incident || typeof incident !== 'object') {
      return;
    }

    const eventType = Number(incident.type ?? incident.eventType ?? incident.code);
    if (!Number.isInteger(eventType) || eventType !== 16) {
      return;
    }

    const titleText =
      typeof incident.title === 'string'
        ? incident.title
        : typeof incident.description === 'string'
        ? incident.description
        : typeof incident.text === 'string'
        ? incident.text
        : '';

    const candidates = extractAssistCandidatesFromTitle(titleText);
    if (!candidates.length) {
      return;
    }

    if (!Array.isArray(incident.assists)) {
      incident.assists = [];
    }

    const goalTeamId = getTeamId(incident);

    candidates.forEach((candidate) => {
      const duplicate = incident.assists.find(
        (assist) =>
          assist &&
          typeof assist === 'object' &&
          normalizeName(getAssistName(assist)) === candidate.normalizedName
      );

      if (duplicate) {
        return;
      }

      const providerIndex = findLastIncidentBefore(annotated, index - 1, (candidateEvent) => {
        const candidateTeamId = getTeamId(candidateEvent);
        if (
          goalTeamId != null &&
          candidateTeamId != null &&
          goalTeamId !== candidateTeamId
        ) {
          return false;
        }

        const candidateName = getIncidentPlayerName(candidateEvent);
        if (!candidateName) {
          return false;
        }

        return normalizeName(candidateName) === candidate.normalizedName;
      });

      const assistInfo = {
        name: candidate.name,
        normalizedName: candidate.normalizedName,
        eventIndex: typeof providerIndex === 'number' ? providerIndex : null,
        playerId: null,
      };

      if (typeof providerIndex === 'number') {
        const provider = annotated[providerIndex];
        const providerId =
          provider && provider.playerId != null
            ? toNumberOrNull(provider.playerId)
            : provider && provider.player && provider.player.id != null
            ? toNumberOrNull(provider.player.id)
            : null;

        assistInfo.playerId = providerId;

        provider.hasAssist = true;

        if (!Array.isArray(provider.assistFor)) {
          provider.assistFor = [];
        }

        provider.assistFor.push({
          goalIndex: index,
          goalTitle: titleText,
        });
      }

      incident.assists.push(assistInfo);
    });
  });

  return annotated;
}

function extractAssistNamesFromTitle(title) {
  return extractAssistCandidatesFromTitle(title).map((candidate) => candidate.name);
}

module.exports = {
  detectAssists,
  extractAssistNamesFromTitle,
  normalizeName,
};

if (typeof window !== 'undefined') {
  window.CocoAssistDetection = {
    detectAssists,
    extractAssistNamesFromTitle,
    normalizeName,
  };
}
