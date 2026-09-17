const CONFIG = window.SUPABASE_CONFIG || {};
const SESSION_KEY = 'lapisonis_session_token';
const THEME_KEY = 'lapisonis_theme';
const DELETE_CONFIRMATION_KEY = 'lapisonis_delete_confirmations';

const LIGHT_CLIP_PATH = 'M0 0h25a1 1 0 0010 10v14H0Z';
const DARK_CLIP_PATH = 'M0 2h13a1 1 0 0010 10v14H0Z';

const isConfigReady =
  CONFIG.url &&
  CONFIG.publishableKey &&
  !CONFIG.url.includes('YOUR_') &&
  !CONFIG.publishableKey.includes('YOUR_') &&
  window.supabase;

const supabaseClient = isConfigReady
  ? window.supabase.createClient(CONFIG.url, CONFIG.publishableKey)
  : null;

const elements = {
  authScreen: document.getElementById('authScreen'),
  appShell: document.getElementById('appShell'),
  authUsername: document.getElementById('authUsername'),
  authPassword: document.getElementById('authPassword'),
  loginButton: document.getElementById('loginButton'),
  signupButton: document.getElementById('signupButton'),
  logoutButton: document.getElementById('logoutButton'),
  authMessage: document.getElementById('authMessage'),
  accountSummary: document.getElementById('accountSummary'),
  unlockToggleButton: document.getElementById('unlockToggleButton'),
  unlockDialog: document.getElementById('unlockDialog'),
  closeUnlockButton: document.getElementById('closeUnlockButton'),
  unlockPasswordInput: document.getElementById('unlockPasswordInput'),
  unlockButton: document.getElementById('unlockButton'),
  unlockMessage: document.getElementById('unlockMessage'),
  unlockBadges: document.getElementById('unlockBadges'),
  scanQrButton: document.getElementById('scanQrButton'),
  stopQrButton: document.getElementById('stopQrButton'),
  qrScanner: document.getElementById('qrScanner'),
  qrVideo: document.getElementById('qrVideo'),
  mainTabs: document.getElementById('mainTabs'),
  themeButton: document.getElementById('themeButton'),
  themeButtonAuth: document.getElementById('themeButtonAuth'),
  deleteConfirmToggle: document.getElementById('deleteConfirmToggle'),
  spellList: document.getElementById('spellList'),
  stoneChoices: document.getElementById('stoneChoices'),
  elementChoices: document.getElementById('elementChoices'),
  lpInput: document.getElementById('lp'),
  lpMinusButton: document.getElementById('lpMinusButton'),
  lpPlusButton: document.getElementById('lpPlusButton'),
  currentLuValue: document.getElementById('currentLuValue'),
  learned: document.getElementById('learned'),
  stoneDamaged: document.getElementById('stoneDamaged'),
  stateTextPanel: document.getElementById('stateTextPanel'),
  stateTextDisplay: document.getElementById('stateTextDisplay'),
  stateTextEditor: document.getElementById('stateTextEditor'),
  stateTextInput: document.getElementById('stateTextInput'),
  editStateTextButton: document.getElementById('editStateTextButton'),
  saveStateTextButton: document.getElementById('saveStateTextButton'),
  refreshAdminButton: document.getElementById('refreshAdminButton'),
  adminMessage: document.getElementById('adminMessage'),
  createUserForm: document.getElementById('createUserForm'),
  newUsername: document.getElementById('newUsername'),
  newUserPassword: document.getElementById('newUserPassword'),
  newUserLu: document.getElementById('newUserLu'),
  newUserRole: document.getElementById('newUserRole'),
  newUserMultiSelect: document.getElementById('newUserMultiSelect'),
  elementForm: document.getElementById('elementForm'),
  elementSlug: document.getElementById('elementSlug'),
  elementLabel: document.getElementById('elementLabel'),
  stoneForm: document.getElementById('stoneForm'),
  stoneSlug: document.getElementById('stoneSlug'),
  stoneLabel: document.getElementById('stoneLabel'),
  spellForm: document.getElementById('spellForm'),
  spellId: document.getElementById('spellId'),
  spellName: document.getElementById('spellName'),
  spellStones: document.getElementById('spellStones'),
  spellElements: document.getElementById('spellElements'),
  spellActive: document.getElementById('spellActive'),
  clearSpellFormButton: document.getElementById('clearSpellFormButton'),
  iterationForm: document.getElementById('iterationForm'),
  iterationId: document.getElementById('iterationId'),
  iterationSpellId: document.getElementById('iterationSpellId'),
  iterationMinLu: document.getElementById('iterationMinLu'),
  iterationMinLp: document.getElementById('iterationMinLp'),
  iterationEffect: document.getElementById('iterationEffect'),
  clearIterationFormButton: document.getElementById('clearIterationFormButton'),
  bulkIterationForm: document.getElementById('bulkIterationForm'),
  bulkIterationSpellId: document.getElementById('bulkIterationSpellId'),
  bulkIterationEffect: document.getElementById('bulkIterationEffect'),
  loadBulkIterationTemplateButton: document.getElementById('loadBulkIterationTemplateButton'),
  clearBulkIterationFormButton: document.getElementById('clearBulkIterationFormButton'),
  adminSpellSearchInput: document.getElementById('adminSpellSearchInput'),
  adminSpellFilterTags: document.getElementById('adminSpellFilterTags'),
  adminSpellSearchSuggestions: document.getElementById('adminSpellSearchSuggestions'),
  adminSpells: document.getElementById('adminSpells'),
  unlockAdminForm: document.getElementById('unlockAdminForm'),
  unlockId: document.getElementById('unlockId'),
  unlockSlug: document.getElementById('unlockSlug'),
  unlockLabel: document.getElementById('unlockLabel'),
  unlockPasswordAdmin: document.getElementById('unlockPasswordAdmin'),
  unlockSpellSearchInput: document.getElementById('unlockSpellSearchInput'),
  unlockSpellIds: document.getElementById('unlockSpellIds'),
  unlockSpellPicker: document.getElementById('unlockSpellPicker'),
  unlockActive: document.getElementById('unlockActive'),
  generateUnlockQrButton: document.getElementById('generateUnlockQrButton'),
  clearUnlockFormButton: document.getElementById('clearUnlockFormButton'),
  unlockQrPreview: document.getElementById('unlockQrPreview'),
  unlockSearchInput: document.getElementById('unlockSearchInput'),
  adminUnlocks: document.getElementById('adminUnlocks'),
  rulesDisplay: document.getElementById('rulesDisplay'),
  rulesText: document.getElementById('rulesText'),
  editRulesButton: document.getElementById('editRulesButton'),
  saveRulesButton: document.getElementById('saveRulesButton'),
  adminUsers: document.getElementById('adminUsers'),
  adminElements: document.getElementById('adminElements'),
  adminStones: document.getElementById('adminStones')
};

const appState = {
  sessionToken: localStorage.getItem(SESSION_KEY) || '',
  user: null,
  stones: [],
  elements: [],
  spells: [],
  unlocks: [],
  toggleTexts: [],
  admin: null,
  confirmDeletes: localStorage.getItem(DELETE_CONFIRMATION_KEY) !== 'false',
  adminSpellFilters: [],
  collapsedSpells: new Set(),
  expandedAdminSpells: new Set(),
  selectedStones: [],
  selectedElements: []
};

let qrStream = null;
let qrFrame = 0;
let qrDetector = null;

const MIN_LU = 1;
const MAX_LU = 10;
const MIN_LP = 1;
const MAX_LP_MULTIPLIER = 2;
const ABSOLUTE_MAX_LP = 20;


function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function normalizeLuLevel(value) {
  return clampNumber(value ?? MIN_LU, MIN_LU, MAX_LU);
}

function getEffectiveLu() {
  return normalizeLuLevel(appState.user?.lu_level);
}

function getCurrentLp() {
  return clampNumber(elements.lpInput?.value ?? MIN_LP, MIN_LP, getMaxLp());
}

function setMessage(element, text, type = '') {
  element.textContent = text;
  element.classList.remove('error', 'success');
  if (type) element.classList.add(type);
}

function validUsername(username) {
  return /^[a-zA-Z0-9ÄÖÜäöüß_-]{3,30}$/.test(username.trim());
}

function formatList(values) {
  return Array.isArray(values) ? values.join(', ') : '';
}

function getSelectValues(select) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function setSelectValues(select, values) {
  const selected = new Set(values || []);
  Array.from(select.options).forEach((option) => {
    option.selected = selected.has(option.value);
  });
}

function fillSelectOptions(select, items, selectedValues, getValue, getLabel) {
  const selected = new Set(selectedValues || []);
  emptyNode(select);

  for (const item of items || []) {
    const option = document.createElement('option');
    option.value = getValue(item);
    option.textContent = getLabel(item);
    option.selected = selected.has(option.value);
    select.append(option);
  }
}

function emptyNode(node) {
  node.replaceChildren();
}

function createTextElement(tag, text, className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function createIconButton(kind, label, onClick, extraClass = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `icon-only secondary icon-${kind} ${extraClass}`.trim();
  button.title = label;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', onClick);
  return button;
}

function createCollapseButton(id, scope) {
  const isCollapsed = isItemCollapsed(id, scope);
  const button = createIconButton(
    'arrow',
    isCollapsed ? 'Aufklappen' : 'Zuklappen',
    () => toggleCollapsedItem(id, scope),
    `collapse-button ${isCollapsed ? 'is-collapsed' : ''}`
  );
  button.setAttribute('aria-expanded', String(!isCollapsed));
  return button;
}

function createSwitch(checked, label, onChange) {
  const wrapper = document.createElement('label');
  wrapper.className = 'switch-row inline-switch';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(checked);
  input.addEventListener('change', () => onChange(input.checked));

  const switchNode = document.createElement('span');
  switchNode.className = 'switch';
  switchNode.setAttribute('aria-hidden', 'true');

  wrapper.append(input, switchNode, createTextElement('span', label));
  return { wrapper, input };
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function fuzzyScoreTerm(term, text) {
  const query = normalizeSearchText(term).replace(/\s+/g, '');
  const target = normalizeSearchText(text);

  if (!query) return 1;
  if (!target) return 0;
  if (target.includes(query)) return 100 + query.length;

  let queryIndex = 0;
  let score = 0;
  let streak = 0;

  for (const char of target) {
    if (char === query[queryIndex]) {
      queryIndex += 1;
      streak += 1;
      score += 2 + streak;
      if (queryIndex === query.length) {
        return score;
      }
    } else {
      streak = 0;
    }
  }

  return 0;
}

function fuzzyScore(query, texts) {
  const terms = normalizeSearchText(query)
    .split(/\s+/)
    .filter(Boolean);

  if (!terms.length) return 1;

  const searchableText = texts.filter(Boolean).join(' ');
  let totalScore = 0;

  for (const term of terms) {
    const termScore = Math.max(
      fuzzyScoreTerm(term, searchableText),
      ...texts.map((text) => fuzzyScoreTerm(term, text))
    );

    if (!termScore) return 0;
    totalScore += termScore;
  }

  return totalScore;
}

function itemLabelBySlug(type, slug) {
  const items = [
    ...(appState.admin?.[type] || []),
    ...(appState[type] || [])
  ];
  const item = items.find((candidate) => (candidate.value || candidate.slug) === slug);
  return item?.label || slug;
}

function spellSearchTexts(spell, includeIterations = false) {
  const texts = [
    spell.id,
    spell.name,
    ...(spell.stones || []),
    ...(spell.elements || []),
    ...(spell.stones || []).map((slug) => itemLabelBySlug('stones', slug)),
    ...(spell.elements || []).map((slug) => itemLabelBySlug('elements', slug))
  ];

  if (includeIterations) {
    texts.push(...(spell.iterations || []).map((iteration) => iteration.effect_template || ''));
  }

  return texts;
}

function getSpellScore(spell, query, includeIterations = false) {
  return fuzzyScore(query, spellSearchTexts(spell, includeIterations));
}

function getSpellById(spellId) {
  return (appState.admin?.spells || appState.spells || []).find((spell) => spell.id === spellId);
}

function formatSpellReference(spellId) {
  const spell = getSpellById(spellId);
  return spell?.name ? `${spell.name} (${spellId})` : spellId;
}

function isItemCollapsed(id, scope) {
  return scope === 'admin'
    ? !appState.expandedAdminSpells.has(id)
    : appState.collapsedSpells.has(id);
}

function toggleCollapsedItem(id, scope) {
  if (scope === 'admin') {
    const expanded = appState.expandedAdminSpells;
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    renderAdminSpells();
    return;
  }

  const collapsed = appState.collapsedSpells;
  if (collapsed.has(id)) {
    collapsed.delete(id);
  } else {
    collapsed.add(id);
  }

  refreshSpellList();
}

async function rpc(functionName, args) {
  if (!supabaseClient) {
    throw new Error('Supabase config missing');
  }

  const { data, error } = await supabaseClient.rpc(functionName, args);
  if (error) throw error;
  return data;
}

function setTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
  updateThemeButtons();
}

function toggleTheme() {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
}

function setDeleteConfirmations(enabled) {
  appState.confirmDeletes = Boolean(enabled);
  localStorage.setItem(DELETE_CONFIRMATION_KEY, appState.confirmDeletes ? 'true' : 'false');

  if (elements.deleteConfirmToggle) {
    elements.deleteConfirmToggle.checked = appState.confirmDeletes;
  }
}

function updateThemeButtons() {
  const currentTheme = document.documentElement.dataset.theme || 'dark';
  const nextLabel = currentTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  const clipPath = currentTheme === 'dark' ? DARK_CLIP_PATH : LIGHT_CLIP_PATH;

  [elements.themeButton, elements.themeButtonAuth].forEach((button) => {
    button.title = nextLabel;
    button.setAttribute('aria-label', nextLabel);
  });

  document.querySelectorAll('.theme-clip-shape').forEach((path) => {
    path.setAttribute('d', clipPath);
  });
}

function applyState(data) {
  appState.user = data.user || null;
  if (appState.user) {
    appState.user.lu_level = normalizeLuLevel(appState.user.lu_level);
  }
  appState.stones = data.stones || [];
  appState.elements = data.elements || [];
  appState.spells = data.spells || [];
  appState.unlocks = data.unlocks || [];
  appState.toggleTexts = data.toggle_texts || [];
  retainValidSelections();
}

async function loadState() {
  const data = await rpc('app_get_state', {
    p_session_token: appState.sessionToken
  });

  applyState(data);
  renderApp();

  if (appState.user?.role === 'admin') {
    await loadAdminSnapshot();
  }
}

function showLoggedOut() {
  appState.sessionToken = '';
  appState.user = null;
  appState.admin = null;
  localStorage.removeItem(SESSION_KEY);
  stopQrScanner();

  elements.authScreen.classList.remove('hidden');
  elements.appShell.classList.add('hidden');
  elements.authPassword.value = '';
  setMessage(elements.authMessage, '');
  setAdminVisibility(false);
  setActiveTab('learnedTab');
}

function setAdminVisibility(isAdmin) {
  document.querySelectorAll('.admin-only').forEach((node) => {
    node.classList.toggle('hidden', !isAdmin);
  });

  const activeTab = document.querySelector('.tab-button.active')?.dataset.tab || 'learnedTab';
  setActiveTab(isAdmin ? activeTab : 'learnedTab');
}

function setActiveTab(tabId) {
  const isAdmin = appState.user?.role === 'admin';
  const nextTab = isAdmin || tabId === 'learnedTab' ? tabId : 'learnedTab';

  document.querySelectorAll('.tab-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === nextTab);
  });

  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === nextTab);
  });
}

function renderApp() {
  elements.authScreen.classList.add('hidden');
  elements.appShell.classList.remove('hidden');

  const roleLabel = appState.user?.role === 'admin' ? 'admin' : 'user';
  elements.accountSummary.textContent = `${appState.user.username} (${roleLabel})`;
  elements.currentLuValue.textContent = `LU ${getEffectiveLu()}`;
  syncLpBounds();

  renderUnlockBadges();
  renderChoiceGroups();
  refreshSpellList();
  setAdminVisibility(appState.user?.role === 'admin');
  renderStateText();
}

function renderUnlockBadges() {
  emptyNode(elements.unlockBadges);

  if (!appState.unlocks.length) {
    elements.unlockBadges.append(createTextElement('span', 'Noch nichts', 'muted'));
    return;
  }

  for (const unlock of appState.unlocks) {
    elements.unlockBadges.append(createTextElement('span', unlock.label || unlock.slug, 'badge'));
  }
}

function retainValidSelections() {
  const stoneValues = new Set(appState.stones.map((stone) => stone.value || stone.slug));
  const elementValues = new Set(appState.elements.map((element) => element.value || element.slug));
  appState.selectedStones = appState.selectedStones.filter((value) => stoneValues.has(value));
  appState.selectedElements = appState.selectedElements.filter((value) => elementValues.has(value));

  if (!canSelectMultipleChoices()) {
    appState.selectedStones = appState.selectedStones.slice(0, 1);
    appState.selectedElements = appState.selectedElements.slice(0, 1);
  }
}

function canSelectMultipleChoices() {
  return Boolean(appState.user?.can_select_multiple_choices);
}

function renderChoiceGroups() {
  renderChoiceGroup(elements.stoneChoices, appState.stones, appState.selectedStones, 'stones');
  renderChoiceGroup(elements.elementChoices, appState.elements, appState.selectedElements, 'elements');
}

function renderChoiceGroup(container, options, selectedValues, type) {
  emptyNode(container);

  if (!options.length) {
    container.append(createTextElement('p', type === 'stones' ? 'Keine Steine freigeschaltet.' : 'Keine Elemente freigeschaltet.', 'empty-state'));
    return;
  }

  for (const item of options) {
    const value = item.value || item.slug;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-button';
    button.textContent = item.label || item.slug;
    button.setAttribute('aria-pressed', selectedValues.includes(value) ? 'true' : 'false');
    button.classList.toggle('active', selectedValues.includes(value));
    button.addEventListener('click', () => toggleChoice(type, value));
    container.append(button);
  }
}

function toggleChoice(type, value) {
  if (type === 'stones') {
    const selected = appState.selectedStones.includes(value);
    appState.selectedStones = canSelectMultipleChoices()
      ? toggleValue(appState.selectedStones, value)
      : selected ? [] : [value];
  } else {
    const selected = appState.selectedElements.includes(value);
    appState.selectedElements = canSelectMultipleChoices()
      ? toggleValue(appState.selectedElements, value)
      : selected ? [] : [value];
  }

  renderChoiceGroups();
  refreshSpellList();
}

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getChoiceAliases(type) {
  if (type === 'elements') {
    return {
      water: 'wasser',
      fire: 'feuer',
      earth: 'erde',
      air: 'luft',
      light: 'licht',
      shadow: 'schatten'
    };
  }

  return {
    talc: 'talk',
    gypsum: 'selenit',
    selenite: 'selenit',
    calcite: 'calcit',
    fluorite: 'fluorit',
    apatite: 'apatit',
    orthoclase: 'orthoklas',
    quartz: 'bergkristall',
    rockcrystal: 'bergkristall',
    'rock-crystal': 'bergkristall',
    topaz: 'topas',
    corundum: 'rubin',
    ruby: 'rubin',
    diamond: 'diamant',
    // alte Namen als Sucheingaben weiterhin erlauben
    pearl: 'selenit',
    coal: 'talk',
    amber: 'calcit',
    tourmaline: 'apatit',
    obsidian: 'topas',
    opal: 'fluorit'
  };
}

function getChoiceOptions(type) {
  const byValue = new Map();

  for (const item of [...(appState[type] || []), ...(appState.admin?.[type] || [])]) {
    const value = item.value || item.slug;
    if (!value || byValue.has(value)) continue;
    byValue.set(value, {
      value,
      label: item.label || item.slug
    });
  }

  return [...byValue.values()];
}

function resolveChoiceFilter(type, rawValue) {
  const aliases = getChoiceAliases(type);
  const normalizedValue = normalizeSearchText(rawValue).replace(/[^a-z0-9_-]/g, '');
  const aliasedValue = aliases[normalizedValue] || normalizedValue;

  return getChoiceOptions(type).find((item) => {
    const value = normalizeSearchText(item.value);
    const label = normalizeSearchText(item.label).replace(/[^a-z0-9_-]/g, '');
    return value === aliasedValue || label === aliasedValue;
  }) || null;
}

function addSpellFilter(type, value) {
  if (appState.adminSpellFilters.some((filter) => filter.type === type && filter.value === value)) {
    return;
  }

  appState.adminSpellFilters.push({ type, value });
}

function removeSpellFilter(type, value) {
  appState.adminSpellFilters = appState.adminSpellFilters.filter((filter) =>
    filter.type !== type || filter.value !== value
  );
  renderSpellFilters();
  renderAdminSpells();
}

function extractSpellFilterTokens() {
  const input = elements.adminSpellSearchInput;
  let changed = false;
  const parts = input.value.split(/(\s+)/).filter((part) => part !== '');
  const remainingParts = [];

  for (const part of parts) {
    const token = part.match(/^(element|e|stone|s)=([^,;\s]+)[,;]?$/i);

    if (!token) {
      remainingParts.push(part);
      continue;
    }

    const type = token[1].toLowerCase().startsWith('e') ? 'elements' : 'stones';
    const choice = resolveChoiceFilter(type, token[2]);

    if (!choice) {
      remainingParts.push(part);
      continue;
    }

    addSpellFilter(type, choice.value);
    changed = true;
  }

  if (changed) {
    input.value = remainingParts.join('').replace(/\s+/g, ' ').trimStart();
    renderSpellFilters();
  }
}

function renderSpellFilters() {
  emptyNode(elements.adminSpellFilterTags);

  for (const filter of appState.adminSpellFilters) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-chip';
    const prefix = filter.type === 'elements' ? 'e' : 's';
    button.textContent = `${prefix}=${itemLabelBySlug(filter.type, filter.value)} x`;
    button.title = 'Filter entfernen';
    button.addEventListener('click', () => removeSpellFilter(filter.type, filter.value));
    elements.adminSpellFilterTags.append(button);
  }
}

function spellMatchesChoiceFilters(spell) {
  return appState.adminSpellFilters.every((filter) => (spell[filter.type] || []).includes(filter.value));
}

function renderSpellSearchSuggestions() {
  emptyNode(elements.adminSpellSearchSuggestions);

  const suggestions = [];
  for (const element of getChoiceOptions('elements')) {
    suggestions.push(`element=${element.label}`, `e=${element.value}`);
  }
  for (const stone of getChoiceOptions('stones')) {
    suggestions.push(`stone=${stone.label}`, `s=${stone.value}`);
  }
  for (const alias of Object.keys(getChoiceAliases('elements'))) {
    suggestions.push(`element=${alias}`, `e=${alias}`);
  }
  for (const alias of Object.keys(getChoiceAliases('stones'))) {
    suggestions.push(`stone=${alias}`, `s=${alias}`);
  }

  for (const value of [...new Set(suggestions)]) {
    const option = document.createElement('option');
    option.value = value;
    elements.adminSpellSearchSuggestions.append(option);
  }
}

function setsMatch(required, selected) {
  const requiredValues = required || [];
  if (requiredValues.length !== selected.length) return false;
  return requiredValues.every((value) => selected.includes(value));
}

function getBestIteration(spell, lp, lu) {
  return (spell.iterations || [])
    .filter((iteration) => Number(iteration.min_lu) <= lu && Number(iteration.min_lp) <= lp)
    .sort((a, b) =>
      Number(b.min_lu) - Number(a.min_lu) ||
      Number(b.min_lp) - Number(a.min_lp)
    )[0] || null;
}

function evaluateFormulaExpression(expression, lp, lu) {
  const normalized = expression
    .replace(/\bLP\b/g, String(lp))
    .replace(/\bLU\b/g, String(lu));

  if (!/^[0-9+\-*/%().\s]+$/.test(normalized)) {
    throw new Error('unsupported_formula');
  }

  const result = Function(`"use strict"; return (${normalized});`)();

  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('invalid_formula_result');
  }

  return Number.isInteger(result) ? String(result) : String(Number(result.toFixed(2)));
}

function evaluateTemplateCondition(expression, lp, lu) {
  const normalized = String(expression || '')
    .replace(/\bLP\b/g, String(lp))
    .replace(/\bLU\b/g, String(lu));

  if (!/^[0-9+\-*/%().\s<>=!&|]+$/.test(normalized)) {
    throw new Error('unsupported_condition');
  }

  return Boolean(Function(`"use strict"; return (${normalized});`)());
}

function renderConditionalBlocks(template, lp, lu) {
  let output = String(template || '');
  let safety = 0;
  const blockPattern = /\[\[if\s+([^\]]+)\]\]([\s\S]*?)\[\[endif\]\]/gi;

  while (blockPattern.test(output) && safety < 20) {
    safety += 1;
    output = output.replace(blockPattern, (fullMatch, expression, body) => {
      try {
        return evaluateTemplateCondition(expression, lp, lu) ? body : '';
      } catch (error) {
        console.error(error);
        return '';
      }
    });
  }

  return output;
}

function renderEffectTemplate(template, lp, lu) {
  const withConditions = renderConditionalBlocks(template, lp, lu);
  return String(withConditions || '')
    .replace(/\$\{([^}]+)\}/g, (fullMatch, expression) => {
      try {
        return evaluateFormulaExpression(expression, lp, lu);
      } catch (error) {
        console.error(error);
        return fullMatch;
      }
    })
    .replace(/\bLP\b/g, String(lp))
    .replace(/\bLU\b/g, String(lu));
}

function refreshSpellList() {
  emptyNode(elements.spellList);
  clampLpInput();

  if (!appState.spells.length) {
    elements.spellList.append(createTextElement('p', 'Noch nichts freigeschaltet.', 'empty-state'));
    return;
  }

  const lp = getCurrentLp();
  const lu = getEffectiveLu();
  const hasStoneSelection = appState.selectedStones.length > 0;
  const hasElementSelection = appState.selectedElements.length > 0;

  if (!hasStoneSelection || !hasElementSelection) {
    elements.spellList.append(createTextElement('p', 'Wähle Stein und Element.', 'empty-state'));
    return;
  }

  const visibleSpells = appState.spells
    .filter((spell) =>
      setsMatch(spell.stones, appState.selectedStones) &&
      setsMatch(spell.elements, appState.selectedElements)
    )
    .map((spell) => ({
      spell,
      iteration: getBestIteration(spell, lp, lu)
    }))
    .filter((item) => item.iteration)
    .sort((a, b) => (a.spell.name || a.spell.id).localeCompare(b.spell.name || b.spell.id));

  if (!visibleSpells.length) {
    elements.spellList.append(createTextElement('p', ':(', 'empty-state'));
    return;
  }

  for (const { spell, iteration } of visibleSpells) {
    const card = document.createElement('article');
    card.className = 'spell-card';
    const isCollapsed = appState.collapsedSpells.has(spell.id);

    const head = document.createElement('div');
    head.className = 'spell-card-head';
    head.append(createTextElement('h3', spell.name || spell.id));
    head.append(createCollapseButton(spell.id, 'learned'));

    const body = document.createElement('div');
    body.className = 'spell-card-body';
    body.classList.toggle('hidden', isCollapsed);
    body.append(createTextElement(
      'div',
      `${formatList(spell.stones)} | ${formatList(spell.elements)} | LP ${lp} | LU ${lu}`,
      'spell-meta'
    ));
    body.append(createTextElement(
      'div',
      `Iteration ab LU ${iteration.min_lu}, LP ${iteration.min_lp}`,
      'spell-meta'
    ));
    body.append(createTextElement(
      'div',
      renderEffectTemplate(iteration.effect_template, lp, lu),
      'spell-description'
    ));
    card.append(head, body);
    elements.spellList.append(card);
  }
}

function getMaxLp() {
  return Math.max(MIN_LP, Math.min(ABSOLUTE_MAX_LP, getEffectiveLu() * MAX_LP_MULTIPLIER));
}

function clampLpInput() {
  const maxLp = getMaxLp();
  const currentValue = Number(elements.lpInput.value || MIN_LP);
  const nextValue = Math.max(MIN_LP, Math.min(maxLp, Number.isFinite(currentValue) ? currentValue : MIN_LP));
  elements.lpInput.min = String(MIN_LP);
  elements.lpInput.max = String(maxLp);
  elements.lpInput.value = String(nextValue);
  return nextValue;
}

function syncLpBounds() {
  elements.lpInput.min = String(MIN_LP);
  elements.lpInput.max = String(getMaxLp());
  clampLpInput();
}

function changeLp(delta) {
  const currentValue = Number(elements.lpInput.value || MIN_LP);
  const nextValue = Math.max(MIN_LP, Math.min(getMaxLp(), currentValue + delta));
  elements.lpInput.value = String(nextValue);
  refreshSpellList();
}

async function handleAuth(mode) {
  const username = elements.authUsername.value.trim();
  const password = elements.authPassword.value;

  setMessage(elements.authMessage, '');

  if (!validUsername(username)) {
    setMessage(elements.authMessage, 'Username: 3-30 Zeichen, nur Buchstaben, Zahlen, _ oder -.', 'error');
    return;
  }

  const button = mode === 'signup' ? elements.signupButton : elements.loginButton;
  button.disabled = true;

  try {
    const data = await rpc(mode === 'signup' ? 'app_signup' : 'app_login', {
      p_username: username,
      p_password: password
    });

    if (!data?.success || !data.session_token) {
      throw new Error(data?.error || 'Login fehlgeschlagen.');
    }

    appState.sessionToken = data.session_token;
    localStorage.setItem(SESSION_KEY, appState.sessionToken);
    await loadState();
  } catch (error) {
    console.error(error);
    setMessage(
      elements.authMessage,
      mode === 'signup' ? 'Account konnte nicht erstellt werden.' : 'Username oder Passwort falsch.',
      'error'
    );
  } finally {
    button.disabled = false;
  }
}

async function logout() {
  if (appState.sessionToken) {
    try {
      await rpc('app_logout', {
        p_session_token: appState.sessionToken
      });
    } catch (error) {
      console.error(error);
    }
  }

  showLoggedOut();
}

async function confirmLogout() {
  if (!window.confirm('Wirklich ausloggen?')) return;
  await logout();
}

function openUnlockDialog() {
  setMessage(elements.unlockMessage, '');
  elements.unlockDialog.classList.remove('hidden');
  elements.unlockPasswordInput.focus();
}

function closeUnlockDialog() {
  stopQrScanner();
  elements.unlockDialog.classList.add('hidden');
}

async function unlockContent() {
  const password = elements.unlockPasswordInput.value;
  setMessage(elements.unlockMessage, '');

  elements.unlockButton.disabled = true;

  try {
    const data = await rpc('app_unlock', {
      p_session_token: appState.sessionToken,
      p_password: password
    });

    if (!data?.success) {
      setMessage(elements.unlockMessage, 'Falsches Unlock-Passwort.', 'error');
      return;
    }

    applyState(data);
    renderApp();
    elements.unlockPasswordInput.value = '';
    closeUnlockDialog();
  } catch (error) {
    console.error(error);
    setMessage(elements.unlockMessage, 'Freischalten fehlgeschlagen.', 'error');
  } finally {
    elements.unlockButton.disabled = false;
  }
}

async function startQrScanner() {
  setMessage(elements.unlockMessage, '');

  if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
    setMessage(elements.unlockMessage, 'QR-Scan wird in diesem Browser nicht unterstützt.', 'error');
    return;
  }

  try {
    const formats = BarcodeDetector.getSupportedFormats
      ? await BarcodeDetector.getSupportedFormats()
      : ['qr_code'];

    if (!formats.includes('qr_code')) {
      setMessage(elements.unlockMessage, 'QR-Scan wird in diesem Browser nicht unterstützt.', 'error');
      return;
    }

    qrDetector = new BarcodeDetector({ formats: ['qr_code'] });
    qrStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });

    elements.qrVideo.srcObject = qrStream;
    elements.qrScanner.classList.remove('hidden');
    elements.stopQrButton.classList.remove('hidden');
    elements.scanQrButton.disabled = true;
    await elements.qrVideo.play();
    scanQrFrame();
  } catch (error) {
    console.error(error);
    stopQrScanner();
    setMessage(elements.unlockMessage, 'Kamera konnte nicht gestartet werden.', 'error');
  }
}

async function scanQrFrame() {
  if (!qrStream || !qrDetector) return;

  try {
    const codes = await qrDetector.detect(elements.qrVideo);
    const code = codes[0]?.rawValue;

    if (code) {
      elements.unlockPasswordInput.value = code;
      stopQrScanner();
      await unlockContent();
      return;
    }
  } catch (error) {
    console.error(error);
  }

  qrFrame = requestAnimationFrame(scanQrFrame);
}

function stopQrScanner() {
  if (qrFrame) {
    cancelAnimationFrame(qrFrame);
    qrFrame = 0;
  }

  if (qrStream) {
    qrStream.getTracks().forEach((track) => track.stop());
    qrStream = null;
  }

  if (elements.qrVideo) {
    elements.qrVideo.srcObject = null;
  }

  if (elements.qrScanner) {
    elements.qrScanner.classList.add('hidden');
  }

  if (elements.stopQrButton && elements.scanQrButton) {
    elements.stopQrButton.classList.add('hidden');
    elements.scanQrButton.disabled = false;
  }
}

async function loadAdminSnapshot() {
  const data = await rpc('app_admin_snapshot', {
    p_session_token: appState.sessionToken
  });
  appState.admin = data;
  renderAdmin();
}

async function adminAction(functionName, args, successMessage) {
  setMessage(elements.adminMessage, '');

  try {
    const data = await rpc(functionName, {
      p_session_token: appState.sessionToken,
      ...args
    });

    if (data?.success === false) {
      throw new Error(data.error || 'Admin action failed');
    }

    await loadState();
    setMessage(elements.adminMessage, successMessage, 'success');
  } catch (error) {
    console.error(error);
    setMessage(elements.adminMessage, 'Admin-Aktion fehlgeschlagen.', 'error');
  }
}

function confirmDeletion(message) {
  return !appState.confirmDeletes || window.confirm(message);
}

function buildDeleteMessage(title, details = []) {
  return [
    title,
    ...details.filter(Boolean),
    '',
    'Diese Aktion kann nicht automatisch rückgängig gemacht werden.'
  ].join('\n');
}

function getSpellsUsingChoice(type, slug) {
  const field = type === 'elements' ? 'elements' : 'stones';
  return (appState.admin?.spells || []).filter((spell) => (spell[field] || []).includes(slug));
}

function getUnlocksForSpell(spellId) {
  return (appState.admin?.unlocks || []).filter((unlock) => (unlock.spell_ids || []).includes(spellId));
}

function formatAdminNames(items, fallbackKey = 'id') {
  return items
    .map((item) => item.name || item.label || item.slug || item[fallbackKey])
    .filter(Boolean)
    .join(', ');
}

function deleteAdminUser(user) {
  const unlockCount = (user.unlocks || []).length;
  const message = buildDeleteMessage(`User "${user.username}" löschen?`, [
    unlockCount ? `${unlockCount} gespeicherte Unlocks werden für diesen User entfernt.` : '',
    'Alle aktiven Sessions dieses Users werden gelöscht.'
  ]);

  if (!confirmDeletion(message)) return;

  adminAction('app_admin_delete_user', {
    p_user_id: user.id
  }, 'User gelöscht.');
}

function deleteAdminSimpleItem(type, itemData) {
  const subject = type === 'elements' ? 'Element' : 'Stein';
  const connectedSpells = getSpellsUsingChoice(type, itemData.slug);
  const message = buildDeleteMessage(`${subject} "${itemData.label || itemData.slug}" löschen?`, [
    connectedSpells.length
      ? `Wird aus ${connectedSpells.length} verbundenen Spells entfernt: ${formatAdminNames(connectedSpells)}.`
      : ''
  ]);

  if (!confirmDeletion(message)) return;

  adminAction(type === 'elements' ? 'app_admin_delete_element' : 'app_admin_delete_stone', {
    p_slug: itemData.slug
  }, `${subject} gelöscht.`);
}

function deleteAdminSpell(spell) {
  const unlocks = getUnlocksForSpell(spell.id);
  const iterations = spell.iterations || [];
  const message = buildDeleteMessage(`Spell "${spell.name || spell.id}" löschen?`, [
    iterations.length ? `${iterations.length} Iterationen werden gelöscht.` : '',
    unlocks.length ? `Der Spell wird aus diesen Unlocks entfernt: ${formatAdminNames(unlocks)}.` : ''
  ]);

  if (!confirmDeletion(message)) return;

  adminAction('app_admin_delete_spell', {
    p_spell_id: spell.id
  }, 'Spell gelöscht.');
}

function deleteAdminIteration(iteration) {
  const message = buildDeleteMessage(`Iteration ab LU ${iteration.min_lu}, LP ${iteration.min_lp} löschen?`);

  if (!confirmDeletion(message)) return;

  adminAction('app_admin_delete_spell_iteration', {
    p_iteration_id: iteration.id
  }, 'Iteration gelöscht.');
}

function deleteAdminUnlock(unlock) {
  const accountCount = Number(unlock.unlocked_by_count || 0);
  const spellCount = (unlock.spell_ids || []).length;
  const message = buildDeleteMessage(`Unlock "${unlock.label || unlock.slug}" löschen?`, [
    spellCount ? `${spellCount} Spell-Verbindungen werden entfernt.` : '',
    accountCount ? `${accountCount} Accounts verlieren diesen gespeicherten Unlock.` : ''
  ]);

  if (!confirmDeletion(message)) return;

  adminAction('app_admin_delete_unlock', {
    p_unlock_id: unlock.id
  }, 'Unlock gelöscht.');
}

function renderAdmin() {
  if (!appState.admin?.success) return;
  setDeleteConfirmations(appState.confirmDeletes);
  appState.toggleTexts = appState.admin.toggle_texts || [];
  renderAdminSelectOptions();
  renderAdminUsers();
  renderAdminSimpleList('elements');
  renderAdminSimpleList('stones');
  renderAdminSpells();
  renderAdminUnlocks();
  renderRules();
  renderStateText();
  renderIterationSpellOptions();
}

function renderAdminSelectOptions() {
  fillSelectOptions(
    elements.spellStones,
    appState.admin?.stones || [],
    getSelectValues(elements.spellStones),
    (stone) => stone.slug,
    (stone) => `${stone.label || stone.slug} (${stone.slug})`
  );

  fillSelectOptions(
    elements.spellElements,
    appState.admin?.elements || [],
    getSelectValues(elements.spellElements),
    (element) => element.slug,
    (element) => `${element.label || element.slug} (${element.slug})`
  );

  fillSelectOptions(
    elements.unlockSpellIds,
    appState.admin?.spells || [],
    getSelectValues(elements.unlockSpellIds),
    (spell) => spell.id,
    (spell) => `${spell.name || spell.id} (${spell.id})`
  );

  renderUnlockSpellPicker();
  renderSpellSearchSuggestions();
}

function renderUnlockSpellPicker() {
  emptyNode(elements.unlockSpellPicker);

  const spells = appState.admin?.spells || [];
  if (!spells.length) {
    elements.unlockSpellPicker.append(createTextElement('div', 'Keine Spells verfügbar.', 'empty-state'));
    return;
  }

  const selected = new Set(getSelectValues(elements.unlockSpellIds));
  const query = elements.unlockSpellSearchInput.value.trim();
  const rows = spells
    .map((spell) => ({
      spell,
      selected: selected.has(spell.id),
      score: query ? fuzzyScore(query, [spell.id, spell.name || '']) : 0
    }))
    .filter((item) => item.selected || !query || item.score > 0)
    .sort((a, b) =>
      Number(b.selected) - Number(a.selected) ||
      b.score - a.score ||
      (a.spell.name || a.spell.id).localeCompare(b.spell.name || b.spell.id)
    );

  if (!rows.length) {
    elements.unlockSpellPicker.append(createTextElement('div', 'Keine Treffer.', 'empty-state'));
    return;
  }

  for (const { spell, selected: isSelected } of rows) {
    const label = document.createElement('label');
    label.className = 'picker-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isSelected;
    checkbox.addEventListener('change', () => {
      const option = Array.from(elements.unlockSpellIds.options).find((candidate) => candidate.value === spell.id);
      if (option) {
        option.selected = checkbox.checked;
      }
      renderUnlockSpellPicker();
    });

    const text = document.createElement('span');
    text.className = 'picker-row-text';
    text.append(createTextElement('strong', spell.name || spell.id));
    text.append(createTextElement('small', spell.id));

    label.append(checkbox, text);
    elements.unlockSpellPicker.append(label);
  }
}

function renderAdminUsers() {
  emptyNode(elements.adminUsers);

  for (const user of appState.admin.users || []) {
    const item = document.createElement('article');
    item.className = 'admin-item';

    const top = document.createElement('div');
    top.className = 'admin-item-top';
    const titleBlock = document.createElement('div');
    titleBlock.append(createTextElement('h4', user.username));
    titleBlock.append(createTextElement('div', `Rolle: ${user.role} | LU ${normalizeLuLevel(user.lu_level)}`, 'unlock-meta'));
    top.append(titleBlock);

    const topActions = document.createElement('div');
    topActions.className = 'admin-item-actions';
    const deleteButton = createIconButton('trash', 'User löschen', () => deleteAdminUser(user), 'danger');
    deleteButton.disabled = user.id === appState.user.id;
    topActions.append(deleteButton);
    top.append(topActions);
    item.append(top);

    const pills = document.createElement('div');
    pills.className = 'admin-pill-list';
    const unlocks = user.unlocks || [];
    if (!unlocks.length) {
      pills.append(createTextElement('span', 'keine Unlocks', 'admin-pill'));
    } else {
      for (const unlock of unlocks) {
        pills.append(createTextElement('span', unlock.label || unlock.slug, 'admin-pill'));
      }
    }
    item.append(pills);

    const actions = document.createElement('div');
    actions.className = 'admin-item-actions';

    const roleSelect = document.createElement('select');
    for (const role of ['user', 'admin']) {
      const option = document.createElement('option');
      option.value = role;
      option.textContent = role;
      option.selected = user.role === role;
      roleSelect.append(option);
    }

    const luInput = document.createElement('input');
    luInput.type = 'number';
    luInput.min = String(MIN_LU);
    luInput.max = String(MAX_LU);
    luInput.value = normalizeLuLevel(user.lu_level);
    luInput.placeholder = 'LU';

    const multiSelectSwitch = createSwitch(user.can_select_multiple_choices, 'Multi-Auswahl', () => {});

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = 'Speichern';
    saveButton.addEventListener('click', () =>
      adminAction('app_admin_update_user', {
        p_user_id: user.id,
        p_role: roleSelect.value,
        p_lu_level: normalizeLuLevel(luInput.value),
        p_can_select_multiple_choices: multiSelectSwitch.input.checked
      }, 'User gespeichert.')
    );

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'neues Passwort';

    const passwordButton = document.createElement('button');
    passwordButton.type = 'button';
    passwordButton.textContent = 'Passwort';
    passwordButton.addEventListener('click', () =>
      adminAction('app_admin_set_user_password', {
        p_user_id: user.id,
        p_password: passwordInput.value
      }, 'Passwort gespeichert.')
    );

    actions.append(roleSelect, luInput, multiSelectSwitch.wrapper, saveButton, passwordInput, passwordButton);
    item.append(actions);
    elements.adminUsers.append(item);
  }
}

function renderAdminSimpleList(type) {
  const listNode = type === 'elements' ? elements.adminElements : elements.adminStones;
  const source = appState.admin[type] || [];
  emptyNode(listNode);

  for (const itemData of source) {
    const item = document.createElement('article');
    item.className = 'admin-item';

    const top = document.createElement('div');
    top.className = 'admin-item-top';
    const titleBlock = document.createElement('div');
    titleBlock.append(createTextElement('h4', itemData.label || itemData.slug));
    titleBlock.append(createTextElement('div', itemData.slug, 'unlock-meta'));
    top.append(titleBlock);

    const actions = document.createElement('div');
    actions.className = 'admin-item-actions';
    actions.append(
      createIconButton('edit', 'Bearbeiten', () => {
        if (type === 'elements') {
          elements.elementSlug.value = itemData.slug;
          elements.elementLabel.value = itemData.label || itemData.slug;
        } else {
          elements.stoneSlug.value = itemData.slug;
          elements.stoneLabel.value = itemData.label || itemData.slug;
        }
      }),
      createIconButton('trash', 'Löschen', () => deleteAdminSimpleItem(type, itemData), 'danger')
    );

    top.append(actions);
    item.append(top);
    listNode.append(item);
  }
}

function renderIterationSpellOptions() {
  const selected = elements.iterationSpellId.value || elements.spellId.value;
  const bulkSelected = elements.bulkIterationSpellId?.value || selected;
  emptyNode(elements.iterationSpellId);
  if (elements.bulkIterationSpellId) emptyNode(elements.bulkIterationSpellId);

  const spells = appState.admin?.spells || [];
  if (!spells.length) {
    const option = document.createElement('option');
    option.textContent = 'Zuerst Spell erstellen';
    option.disabled = true;
    elements.iterationSpellId.append(option);
    if (elements.bulkIterationSpellId) {
      const bulkOption = option.cloneNode(true);
      elements.bulkIterationSpellId.append(bulkOption);
    }
    return;
  }

  for (const spell of spells) {
    const option = document.createElement('option');
    option.value = spell.id;
    option.textContent = `${spell.name || spell.id} (${spell.id})`;
    option.selected = spell.id === selected;
    elements.iterationSpellId.append(option);

    if (elements.bulkIterationSpellId) {
      const bulkOption = document.createElement('option');
      bulkOption.value = spell.id;
      bulkOption.textContent = `${spell.name || spell.id} (${spell.id})`;
      bulkOption.selected = spell.id === bulkSelected;
      elements.bulkIterationSpellId.append(bulkOption);
    }
  }
}

function renderAdminSpells() {
  emptyNode(elements.adminSpells);
  extractSpellFilterTokens();
  renderSpellFilters();

  const query = elements.adminSpellSearchInput.value.trim();
  const hasFilters = appState.adminSpellFilters.length > 0;
  const spells = (appState.admin.spells || [])
    .map((spell) => ({
      spell,
      score: query ? getSpellScore(spell, query, true) : 0
    }))
    .filter((item) =>
      (!query || item.score > 0) &&
      (!hasFilters || spellMatchesChoiceFilters(item.spell))
    )
    .sort((a, b) => b.score - a.score || (a.spell.name || a.spell.id).localeCompare(b.spell.name || b.spell.id));

  if (!spells.length) {
    elements.adminSpells.append(createTextElement('p', 'Keine Treffer.', 'empty-state'));
    return;
  }

  for (const { spell } of spells) {
    const item = document.createElement('article');
    item.className = 'admin-item admin-spell-item';
    const isCollapsed = isItemCollapsed(spell.id, 'admin');

    const top = document.createElement('div');
    top.className = 'admin-item-top admin-spell-head';
    const titleBlock = document.createElement('div');
    titleBlock.append(createTextElement('h4', spell.name || spell.id));
    titleBlock.append(createTextElement(
      'div',
      `${spell.id} | ${formatList(spell.stones)} | ${formatList(spell.elements)} | ${spell.active ? 'aktiv' : 'inaktiv'}`,
      'unlock-meta'
    ));
    top.append(titleBlock);

    const actions = document.createElement('div');
    actions.className = 'admin-item-actions';
    actions.append(
      createCollapseButton(spell.id, 'admin'),
      createIconButton('edit', 'Spell bearbeiten', () => fillSpellForm(spell)),
      createIconButton('edit', 'Alle Iterationen bearbeiten', () => fillBulkIterationForm(spell)),
      createIconButton('trash', 'Spell löschen', () => deleteAdminSpell(spell), 'danger')
    );

    top.append(actions);
    item.append(top);
    const body = document.createElement('div');
    body.className = 'admin-spell-body';
    body.classList.toggle('hidden', isCollapsed);
    body.append(renderIterations(spell));
    item.append(body);
    elements.adminSpells.append(item);
  }
}

function renderIterations(spell) {
  const list = document.createElement('div');
  list.className = 'iteration-list';

  const iterations = spell.iterations || [];
  if (!iterations.length) {
    list.append(createTextElement('div', 'Keine Iterationen.', 'unlock-meta'));
    return list;
  }

  for (const iteration of iterations) {
    const row = document.createElement('div');
    row.className = 'iteration-row';

    const text = document.createElement('div');
    text.append(createTextElement('strong', `ab LU ${iteration.min_lu}, LP ${iteration.min_lp}`));
    text.append(createTextElement('p', iteration.effect_template || ''));

    const actions = document.createElement('div');
    actions.className = 'admin-item-actions';
    actions.append(
      createIconButton('edit', 'Iteration bearbeiten', () => fillIterationForm(iteration)),
      createIconButton('trash', 'Iteration löschen', () => deleteAdminIteration(iteration), 'danger')
    );

    row.append(text, actions);
    list.append(row);
  }

  return list;
}

function renderAdminUnlocks() {
  emptyNode(elements.adminUnlocks);
  const query = elements.unlockSearchInput.value.trim();
  const unlocks = (appState.admin.unlocks || [])
    .map((unlock) => ({
      unlock,
      score: query ? fuzzyScore(query, [
        unlock.label,
        unlock.slug,
        ...(unlock.spell_ids || []),
        ...(unlock.spell_ids || []).map(formatSpellReference)
      ]) : 0
    }))
    .filter((item) => !query || item.score > 0)
    .sort((a, b) => b.score - a.score || (a.unlock.label || a.unlock.slug).localeCompare(b.unlock.label || b.unlock.slug));

  if (!unlocks.length) {
    elements.adminUnlocks.append(createTextElement('p', 'Keine Treffer.', 'empty-state'));
    return;
  }

  for (const { unlock } of unlocks) {
    const item = document.createElement('article');
    item.className = 'admin-item';

    const top = document.createElement('div');
    top.className = 'admin-item-top';
    const titleBlock = document.createElement('div');
    titleBlock.append(createTextElement('h4', unlock.label || unlock.slug));
    titleBlock.append(createTextElement(
      'div',
      `${unlock.slug} | ${unlock.active ? 'aktiv' : 'inaktiv'} | ${unlock.unlocked_by_count} Accounts`,
      'unlock-meta'
    ));
    titleBlock.append(createTextElement('div', `Passwort: ${unlock.password_text}`, 'unlock-meta'));
    titleBlock.append(createTextElement('div', `Spells: ${(unlock.spell_ids || []).map(formatSpellReference).join(', ') || '-'}`, 'unlock-meta'));
    top.append(titleBlock);

    const actions = document.createElement('div');
    actions.className = 'admin-item-actions';
    actions.append(
      createIconButton('edit', 'Unlock bearbeiten', () => fillUnlockForm(unlock)),
      createIconButton('trash', 'Unlock löschen', () => deleteAdminUnlock(unlock), 'danger')
    );

    top.append(actions);
    item.append(top);
    elements.adminUnlocks.append(item);
  }
}

function renderRules() {
  const body = appState.admin?.rules?.body || '';
  elements.rulesText.value = body;
  elements.rulesDisplay.innerHTML = renderMarkdown(body);
  setRulesEditorMode(false);
}

function getCurrentToggleText() {
  const learned = elements.learned.checked;
  const stoneDamaged = elements.stoneDamaged.checked;
  return (appState.toggleTexts || []).find((item) =>
    item.learned === learned &&
    item.stone_damaged === stoneDamaged
  )?.body || '';
}

function renderStateText() {
  if (appState.user?.role !== 'admin') return;
  const body = getCurrentToggleText();
  elements.stateTextInput.value = body;
  elements.stateTextDisplay.innerHTML = renderMarkdown(body);
  setStateEditorMode(false);
}

function setRulesEditorMode(isEditing) {
  elements.rulesDisplay.classList.toggle('hidden', isEditing);
  elements.rulesText.classList.toggle('hidden', !isEditing);
  elements.saveRulesButton.classList.toggle('hidden', !isEditing);
}

function setStateEditorMode(isEditing) {
  elements.stateTextDisplay.classList.toggle('hidden', isEditing);
  elements.stateTextEditor.classList.toggle('hidden', !isEditing);
}

function renderMarkdown(markdown) {
  const source = String(markdown || '').replace(/\r\n/g, '\n').trim();

  if (!source) {
    return '<p class="empty-state">Noch kein Text.</p>';
  }

  const renderState = { taskIndex: 0 };
  const lines = source.split('\n');
  const html = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      const tableLines = [lines[index], lines[index + 1]];
      index += 2;

      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }

      html.push(renderMarkdownTable(tableLines));
      continue;
    }

    const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*-{3,}\s*$/.test(line)) {
      html.push('<hr>');
      index += 1;
      continue;
    }

    if (isTaskListLine(line)) {
      const items = [];

      while (index < lines.length && isTaskListLine(lines[index])) {
        items.push(renderTaskListItem(lines[index], renderState));
        index += 1;
      }

      html.push(`<ul class="task-list">${items.join('')}</ul>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index]) && !isTaskListLine(lines[index])) {
        items.push(`<li>${renderInlineMarkdown(lines[index].replace(/^\s*[-*]\s+/, ''))}</li>`);
        index += 1;
      }

      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(`<li>${renderInlineMarkdown(lines[index].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        index += 1;
      }

      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const paragraphLines = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !isMarkdownTableStart(lines, index) &&
      !/^\s*(#{1,6})\s+(.+?)\s*$/.test(lines[index]) &&
      !/^\s*-{3,}\s*$/.test(lines[index]) &&
      !isTaskListLine(lines[index]) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    html.push(`<p>${renderInlineMarkdown(paragraphLines.join('\n')).replace(/\n/g, '<br>')}</p>`);
  }

  return html.join('');
}

function isTaskListLine(line) {
  return /^\s*(?:[-*]\s+)?\[[ xX]\]\s+/.test(line);
}

function renderTaskListItem(line, renderState) {
  const match = line.match(/^\s*(?:[-*]\s+)?\[([ xX])\]\s+(.+)$/);
  const checked = match?.[1]?.toLowerCase() === 'x';
  const label = match?.[2] || '';
  const taskIndex = renderState.taskIndex;
  renderState.taskIndex += 1;

  return [
    '<li class="task-list-item">',
    '<label>',
    `<input class="markdown-task-checkbox" type="checkbox" data-task-index="${taskIndex}" ${checked ? 'checked' : ''}>`,
    `<span>${renderInlineMarkdown(label)}</span>`,
    '</label>',
    '</li>'
  ].join('');
}

function isMarkdownTableStart(lines, index) {
  if (!lines[index]?.includes('|') || !lines[index + 1]?.includes('|')) {
    return false;
  }

  return parseTableCells(lines[index + 1]).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseTableCells(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function renderMarkdownTable(lines) {
  const headers = parseTableCells(lines[0]);
  const rows = lines.slice(2).map(parseTableCells);
  const headerHtml = headers
    .map((header) => `<th>${renderInlineMarkdown(header)}</th>`)
    .join('');
  const rowHtml = rows
    .map((row) => {
      const cells = headers.map((_, index) => `<td>${renderInlineMarkdown(row[index] || '')}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<div class="markdown-table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowHtml}</tbody></table></div>`;
}

function renderInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
      const normalizedHref = normalizeMarkdownHref(decodeHtmlEntities(href));
      if (!normalizedHref) return match;
      return `<a href="${escapeHtml(normalizedHref)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function normalizeMarkdownHref(href) {
  const trimmed = String(href || '').trim().replace(/^<(.+)>$/, '$1');

  if (!trimmed || /[\u0000-\u001f\s]/.test(trimmed)) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed) || /^(mailto|tel):/i.test(trimmed)) {
    return trimmed;
  }

  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  if (/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+(?:[/?#][^\s]*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  if (/^(#|\/|\.\/|\.\.\/)/.test(trimmed)) {
    return trimmed;
  }

  return '';
}

function decodeHtmlEntities(text) {
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function updateMarkdownTask(source, taskIndex, checked) {
  let currentTaskIndex = 0;

  return String(source || '').replace(/^(\s*(?:[-*]\s+)?\[)([ xX])(\]\s+)/gm, (match, prefix, marker, suffix) => {
    const isTarget = currentTaskIndex === taskIndex;
    currentTaskIndex += 1;

    if (!isTarget) {
      return match;
    }

    return `${prefix}${checked ? 'x' : ' '}${suffix}`;
  });
}

function setCurrentToggleTextBody(body) {
  const learned = elements.learned.checked;
  const stoneDamaged = elements.stoneDamaged.checked;
  const existing = (appState.toggleTexts || []).find((item) =>
    item.learned === learned &&
    item.stone_damaged === stoneDamaged
  );

  if (existing) {
    existing.body = body;
  } else {
    appState.toggleTexts.push({
      learned,
      stone_damaged: stoneDamaged,
      body
    });
  }

  if (appState.admin) {
    appState.admin.toggle_texts = appState.toggleTexts;
  }
}

function handleRulesTaskToggle(checkbox) {
  const nextBody = updateMarkdownTask(elements.rulesText.value, Number(checkbox.dataset.taskIndex), checkbox.checked);
  elements.rulesText.value = nextBody;

  if (appState.admin?.rules) {
    appState.admin.rules.body = nextBody;
  }

  adminAction('app_admin_save_rules', {
    p_body: nextBody
  }, 'Regeln gespeichert.');
}

function handleStateTaskToggle(checkbox) {
  const nextBody = updateMarkdownTask(elements.stateTextInput.value, Number(checkbox.dataset.taskIndex), checkbox.checked);
  elements.stateTextInput.value = nextBody;
  setCurrentToggleTextBody(nextBody);

  adminAction('app_admin_save_toggle_text', {
    p_learned: elements.learned.checked,
    p_stone_damaged: elements.stoneDamaged.checked,
    p_body: nextBody
  }, 'Text gespeichert.');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function getSelectedBulkSpell() {
  const spellId = elements.bulkIterationSpellId?.value || elements.iterationSpellId.value || elements.spellId.value;
  return (appState.admin?.spells || []).find((spell) => spell.id === spellId) || null;
}

function fillBulkIterationForm(spell) {
  if (!spell || !elements.bulkIterationForm) return;
  elements.bulkIterationSpellId.value = spell.id || '';
  const firstIteration = [...(spell.iterations || [])]
    .sort((a, b) => Number(a.min_lu) - Number(b.min_lu) || Number(a.min_lp) - Number(b.min_lp))[0];
  elements.bulkIterationEffect.value = firstIteration?.effect_template || '';
  setActiveTab('spellsTab');
  elements.bulkIterationEffect.focus();
}

function loadBulkIterationTemplate() {
  const spell = getSelectedBulkSpell();
  if (!spell) return;
  fillBulkIterationForm(spell);
}

function clearBulkIterationForm() {
  if (!elements.bulkIterationForm) return;
  elements.bulkIterationForm.reset();
  if (elements.bulkIterationSpellId?.options.length) {
    elements.bulkIterationSpellId.selectedIndex = 0;
  }
  elements.bulkIterationEffect.value = '';
}

async function saveBulkIterations() {
  const spell = getSelectedBulkSpell();
  const template = elements.bulkIterationEffect?.value ?? '';

  if (!spell) {
    setMessage(elements.adminMessage, 'Kein Spell ausgewählt.', 'error');
    return;
  }

  const iterations = spell.iterations || [];
  if (!iterations.length) {
    setMessage(elements.adminMessage, 'Dieser Spell hat keine Iterationen.', 'error');
    return;
  }

  setMessage(elements.adminMessage, '');

  try {
    for (const iteration of iterations) {
      const data = await rpc('app_admin_save_spell_iteration', {
        p_session_token: appState.sessionToken,
        p_iteration_id: iteration.id || null,
        p_spell_id: spell.id,
        p_min_lu: Number(iteration.min_lu || MIN_LU),
        p_min_lp: Number(iteration.min_lp || MIN_LP),
        p_effect_template: template
      });

      if (data?.success === false) {
        throw new Error(data.error || 'bulk_update_failed');
      }
    }

    await loadState();
    setMessage(elements.adminMessage, `Alle ${iterations.length} Iterationen von ${spell.name || spell.id} gespeichert.`, 'success');
  } catch (error) {
    console.error(error);
    setMessage(elements.adminMessage, 'Alle Iterationen konnten nicht gespeichert werden.', 'error');
  }
}

function fillSpellForm(spell) {
  elements.spellId.value = spell.id || '';
  elements.spellName.value = spell.name || '';
  setSelectValues(elements.spellStones, spell.stones);
  setSelectValues(elements.spellElements, spell.elements);
  elements.spellActive.checked = Boolean(spell.active);
  elements.iterationSpellId.value = spell.id || '';
  setActiveTab('spellsTab');
}

function clearSpellForm() {
  elements.spellForm.reset();
  setSelectValues(elements.spellStones, []);
  setSelectValues(elements.spellElements, []);
  elements.spellActive.checked = true;
}

function fillIterationForm(iteration) {
  elements.iterationId.value = iteration.id || '';
  elements.iterationSpellId.value = iteration.spell_id || '';
  elements.iterationMinLu.value = iteration.min_lu ?? 0;
  elements.iterationMinLp.value = iteration.min_lp ?? 0;
  elements.iterationEffect.value = iteration.effect_template || '';
  setActiveTab('spellsTab');
}

function clearIterationForm() {
  elements.iterationForm.reset();
  elements.iterationId.value = '';
  elements.iterationMinLu.value = String(MIN_LU);
  elements.iterationMinLp.value = String(MIN_LP);
}

function fillUnlockForm(unlock) {
  elements.unlockId.value = unlock.id || '';
  elements.unlockSlug.value = unlock.slug || '';
  elements.unlockLabel.value = unlock.label || '';
  elements.unlockPasswordAdmin.value = unlock.password_text || '';
  setSelectValues(elements.unlockSpellIds, unlock.spell_ids);
  elements.unlockSpellSearchInput.value = '';
  renderUnlockSpellPicker();
  elements.unlockActive.checked = Boolean(unlock.active);
  elements.unlockQrPreview.classList.add('hidden');
  emptyNode(elements.unlockQrPreview);
  setActiveTab('unlocksTab');
}

function clearUnlockForm() {
  elements.unlockAdminForm.reset();
  elements.unlockId.value = '';
  setSelectValues(elements.unlockSpellIds, []);
  elements.unlockSpellSearchInput.value = '';
  renderUnlockSpellPicker();
  elements.unlockActive.checked = true;
  elements.unlockQrPreview.classList.add('hidden');
  emptyNode(elements.unlockQrPreview);
}

function generateUnlockQr() {
  const password = elements.unlockPasswordAdmin.value;
  setMessage(elements.adminMessage, '');

  if (!window.qrcode) {
    setMessage(elements.adminMessage, 'QR-Bibliothek konnte nicht geladen werden.', 'error');
    return;
  }

  try {
    const qr = window.qrcode(0, 'M');
    qr.addData(password);
    qr.make();

    const image = document.createElement('img');
    image.alt = 'Unlock QR Code';
    image.src = qr.createDataURL(6, 8);

    emptyNode(elements.unlockQrPreview);
    elements.unlockQrPreview.append(image);
    elements.unlockQrPreview.append(createTextElement('div', 'QR für das aktuelle Unlock-Passwort.', 'unlock-meta'));
    elements.unlockQrPreview.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    setMessage(elements.adminMessage, 'QR-Code konnte nicht erstellt werden.', 'error');
  }
}

function bindEvents() {
  elements.loginButton.addEventListener('click', () => handleAuth('login'));
  elements.signupButton.addEventListener('click', () => handleAuth('signup'));
  elements.logoutButton.addEventListener('click', confirmLogout);
  elements.unlockToggleButton.addEventListener('click', openUnlockDialog);
  elements.closeUnlockButton.addEventListener('click', closeUnlockDialog);
  elements.unlockDialog.querySelector('[data-close-unlock]').addEventListener('click', closeUnlockDialog);
  elements.unlockButton.addEventListener('click', unlockContent);
  elements.scanQrButton.addEventListener('click', startQrScanner);
  elements.stopQrButton.addEventListener('click', stopQrScanner);
  elements.themeButton.addEventListener('click', toggleTheme);
  elements.themeButtonAuth.addEventListener('click', toggleTheme);
  elements.lpMinusButton.addEventListener('click', () => changeLp(-1));
  elements.lpPlusButton.addEventListener('click', () => changeLp(1));
  elements.deleteConfirmToggle.addEventListener('change', () => setDeleteConfirmations(elements.deleteConfirmToggle.checked));

  elements.mainTabs.addEventListener('click', (event) => {
    const button = event.target.closest('.tab-button');
    if (!button || button.classList.contains('hidden')) return;
    setActiveTab(button.dataset.tab);
  });

  elements.rulesDisplay.addEventListener('change', (event) => {
    const checkbox = event.target.closest('.markdown-task-checkbox');
    if (!checkbox) return;
    handleRulesTaskToggle(checkbox);
  });

  elements.stateTextDisplay.addEventListener('change', (event) => {
    const checkbox = event.target.closest('.markdown-task-checkbox');
    if (!checkbox) return;
    handleStateTaskToggle(checkbox);
  });

  elements.authPassword.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleAuth('login');
  });

  elements.unlockPasswordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') unlockContent();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.unlockDialog.classList.contains('hidden')) {
      closeUnlockDialog();
    }
  });

  elements.lpInput.addEventListener('input', () => {
    clampLpInput();
    refreshSpellList();
  });
  elements.adminSpellSearchInput.addEventListener('input', renderAdminSpells);
  elements.unlockSearchInput.addEventListener('input', renderAdminUnlocks);
  elements.unlockSpellSearchInput.addEventListener('input', renderUnlockSpellPicker);
  elements.learned.addEventListener('change', renderStateText);
  elements.stoneDamaged.addEventListener('change', renderStateText);
  elements.editStateTextButton.addEventListener('click', () => setStateEditorMode(true));

  elements.refreshAdminButton.addEventListener('click', loadAdminSnapshot);

  elements.createUserForm.addEventListener('submit', (event) => {
    event.preventDefault();
    adminAction('app_admin_create_user', {
      p_username: elements.newUsername.value,
      p_password: elements.newUserPassword.value,
      p_role: elements.newUserRole.value,
      p_lu_level: normalizeLuLevel(elements.newUserLu.value),
      p_can_select_multiple_choices: elements.newUserMultiSelect.checked
    }, 'User erstellt.');
    elements.createUserForm.reset();
    elements.newUserLu.value = String(MIN_LU);
  });

  elements.elementForm.addEventListener('submit', (event) => {
    event.preventDefault();
    adminAction('app_admin_save_element', {
      p_slug: elements.elementSlug.value,
      p_label: elements.elementLabel.value
    }, 'Element gespeichert.');
    elements.elementForm.reset();
  });

  elements.stoneForm.addEventListener('submit', (event) => {
    event.preventDefault();
    adminAction('app_admin_save_stone', {
      p_slug: elements.stoneSlug.value,
      p_label: elements.stoneLabel.value
    }, 'Stein gespeichert.');
    elements.stoneForm.reset();
  });

  elements.spellForm.addEventListener('submit', (event) => {
    event.preventDefault();
    adminAction('app_admin_save_spell', {
      p_spell_id: elements.spellId.value,
      p_name: elements.spellName.value,
      p_stones: getSelectValues(elements.spellStones),
      p_elements: getSelectValues(elements.spellElements),
      p_active: elements.spellActive.checked
    }, 'Spell gespeichert.');
  });

  elements.iterationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    adminAction('app_admin_save_spell_iteration', {
      p_iteration_id: elements.iterationId.value || null,
      p_spell_id: elements.iterationSpellId.value,
      p_min_lu: normalizeLuLevel(elements.iterationMinLu.value),
      p_min_lp: clampNumber(elements.iterationMinLp.value, MIN_LP, ABSOLUTE_MAX_LP),
      p_effect_template: elements.iterationEffect.value
    }, 'Iteration gespeichert.');
  });

  elements.clearSpellFormButton.addEventListener('click', clearSpellForm);
  elements.clearIterationFormButton.addEventListener('click', clearIterationForm);
  if (elements.bulkIterationForm) {
    elements.bulkIterationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveBulkIterations();
    });
  }
  if (elements.loadBulkIterationTemplateButton) {
    elements.loadBulkIterationTemplateButton.addEventListener('click', loadBulkIterationTemplate);
  }
  if (elements.clearBulkIterationFormButton) {
    elements.clearBulkIterationFormButton.addEventListener('click', clearBulkIterationForm);
  }

  elements.unlockAdminForm.addEventListener('submit', (event) => {
    event.preventDefault();
    adminAction('app_admin_save_unlock', {
      p_unlock_id: elements.unlockId.value || null,
      p_slug: elements.unlockSlug.value,
      p_label: elements.unlockLabel.value,
      p_password: elements.unlockPasswordAdmin.value,
      p_spell_ids: getSelectValues(elements.unlockSpellIds),
      p_active: elements.unlockActive.checked
    }, 'Unlock gespeichert.');
  });

  elements.generateUnlockQrButton.addEventListener('click', generateUnlockQr);
  elements.clearUnlockFormButton.addEventListener('click', clearUnlockForm);

  elements.saveRulesButton.addEventListener('click', () => {
    adminAction('app_admin_save_rules', {
      p_body: elements.rulesText.value
    }, 'Regeln gespeichert.');
  });
  elements.editRulesButton.addEventListener('click', () => setRulesEditorMode(true));

  elements.saveStateTextButton.addEventListener('click', () => {
    adminAction('app_admin_save_toggle_text', {
      p_learned: elements.learned.checked,
      p_stone_damaged: elements.stoneDamaged.checked,
      p_body: elements.stateTextInput.value
    }, 'Text gespeichert.');
  });
}

async function initialize() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  setTheme(savedTheme || 'dark');
  bindEvents();
  setActiveTab('learnedTab');

  if (!isConfigReady) {
    showLoggedOut();
    elements.loginButton.disabled = true;
    elements.signupButton.disabled = true;
    setMessage(
      elements.authMessage,
      'Bitte config.js mit Supabase URL und publishable key füllen.',
      'error'
    );
    return;
  }

  if (!appState.sessionToken) {
    showLoggedOut();
    return;
  }

  try {
    await loadState();
  } catch (error) {
    console.error(error);
    showLoggedOut();
  }
}

initialize();
