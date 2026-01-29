// DOM Elements
const elements = {
  result: document.getElementById('result'),
  timezoneInput: document.getElementById('timezoneInput'),
  timezoneDropdown: document.getElementById('timezoneDropdown'),
  timestampInput: document.getElementById('timestampInput'),
  btnNow: document.getElementById('btn-now'),
  btnCopy: document.getElementById('btn-copy'),
};

// State
let allTimezones = [];

/**
 * Initialize Timezones
 * Uses Intl.supportedValuesOf for instant, no-fetch timezone list
 */
function initTimezones() {
  try {
    if (Intl && Intl.supportedValuesOf) {
      allTimezones = Intl.supportedValuesOf('timeZone');
    } else {
      // Fallback fallback if browser is very old
      allTimezones = ['UTC', 'Asia/Taipei', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
    }
  } catch (e) {
    console.error('Intl API not supported', e);
    allTimezones = ['UTC', 'Asia/Taipei'];
  }

  // Set default timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  elements.timezoneInput.value = userTimeZone;

  // Render initial list (hidden)
  renderDropdownList(allTimezones);

  // Initial update
  updateResult();
}

/**
 * Render dropdown items
 */
function renderDropdownList(list) {
  const currentVal = elements.timezoneInput.value;
  elements.timezoneDropdown.innerHTML = '';

  if (list.length === 0) {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.textContent = 'No results found';
    div.style.color = 'var(--text-muted)';
    div.style.cursor = 'default';
    elements.timezoneDropdown.appendChild(div);
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach(tz => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    if (tz === currentVal) {
      div.classList.add('selected');
    }
    div.textContent = tz;

    div.addEventListener('mousedown', (e) => { // mousedown happens before blur
      e.preventDefault(); // Prevent input blur
      selectTimezone(tz);
    });

    fragment.appendChild(div);
  });
  elements.timezoneDropdown.appendChild(fragment);
}

function selectTimezone(tz) {
  elements.timezoneInput.value = tz;
  elements.timezoneDropdown.classList.remove('active');
  updateResult();
}

/**
 * Filter and Show Dropdown
 */
function handleInputSearch() {
  const query = elements.timezoneInput.value.toLowerCase();
  const filtered = allTimezones.filter(tz => tz.toLowerCase().includes(query));
  renderDropdownList(filtered);
  elements.timezoneDropdown.classList.add('active'); // Ensure visible when typing
}

function showDropdown() {
  // Reset list to full if query matches current value (user just clicked to open)
  // Or keep filtering? Better UX: if user focuses, show full list unless they are typing.
  // Actually, standard behavior: leave text as is.
  // We can select the text to make replacement easy.
  elements.timezoneInput.select();

  renderDropdownList(allTimezones);

  // Scroll to selected
  const selected = elements.timezoneDropdown.querySelector('.selected');
  elements.timezoneDropdown.classList.add('active');
  if (selected) {
    selected.scrollIntoView({ block: 'nearest' });
  }
}

function hideDropdown() {
  // Delay hide to allow click event to register (handled by mousedown preventDefault, but safer to have small timeout if needed)
  // Since we use mousedown on items, we can hide immediately on blur.
  elements.timezoneDropdown.classList.remove('active');

  // Validate selection? 
  // If user typed garbage, revert or keep?
  // Let's keep, convertTimestampToTimezone handles invalid anyway.
  updateResult();
}


/**
 * Format timestamp to specific timezone
 */
function convertTimestampToTimezone(timestamp, timezone) {
  try {
    const date = new Date(parseInt(timestamp) * 1000);

    if (isNaN(date.getTime())) {
      return 'Invalid Timestamp';
    }

    // Modern format with Intl
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date).replace(/, /g, ' ');
  } catch (e) {
    return 'Invalid Timezone';
  }
}

/**
 * Update the result display
 */
function updateResult() {
  const timezone = elements.timezoneInput.value;
  let timestamp = elements.timestampInput.value;

  if (!timestamp) {
    timestamp = Math.floor(Date.now() / 1000);
  }

  const formatted = convertTimestampToTimezone(timestamp, timezone);
  elements.result.textContent = formatted;
}

function setNow() {
  elements.timestampInput.value = Math.floor(Date.now() / 1000);
  updateResult();
}

function copyResult() {
  const text = elements.result.textContent;
  if (!text || text === 'Enter a timestamp...' || text.startsWith('Invalid')) return;

  navigator.clipboard.writeText(text).then(() => {
    const originalIcon = elements.btnCopy.innerHTML;
    elements.btnCopy.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="color: var(--primary);" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    setTimeout(() => {
      elements.btnCopy.innerHTML = originalIcon;
    }, 1500);
  });
}

// Event Listeners
if (elements.timezoneInput) {
  elements.timezoneInput.addEventListener('focus', showDropdown);
  elements.timezoneInput.addEventListener('blur', hideDropdown);
  elements.timezoneInput.addEventListener('input', handleInputSearch);
}

if (elements.btnNow) elements.btnNow.addEventListener('click', setNow);
if (elements.timestampInput) elements.timestampInput.addEventListener('input', updateResult);
if (elements.btnCopy) elements.btnCopy.addEventListener('click', copyResult);

// Initialize
initTimezones();
