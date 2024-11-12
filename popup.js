const result = document.getElementById('result');
const convertButton = document.getElementById('convertButton');
const timezoneSelect = document.getElementById('timezone-select');
const timestampInput = document.getElementById('timestampInput');

async function fetchTimezones() {
  try {
    const res = await fetch('https://www.timeapi.io/api/timezone/availabletimezones');
    const timezones = await res.json();
    const userTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

    timezones.forEach(timezone => {
      const option = document.createElement('option');
      option.value = timezone;
      option.textContent = timezone;
      if (timezone === userTimeZone) {
        option.selected = true;
      }
      timezoneSelect.appendChild(option);
    });
    $(timezoneSelect).select2();

    // 初始顯示當前時間
    updateResult();

    // 監聽 select2 的選擇變更事件
    $(timezoneSelect).on('select2:select', updateResult);
  } catch (error) {
    console.error('Error fetching timezones:', error);
  }
}

function convertTimestampToTimezone(timestamp, timezone) {
  const date = new Date(parseInt(timestamp) * 1000);

  const year = date.toLocaleString('en-US', { timeZone: timezone, year: 'numeric' });
  const month = ('0' + (date.toLocaleString('en-US', { timeZone: timezone, month: '2-digit' }) || '')).slice(-2);
  const day = ('0' + (date.toLocaleString('en-US', { timeZone: timezone, day: '2-digit' }) || '')).slice(-2);
  const hours = ('0' + (date.toLocaleString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }) || '')).slice(-2);
  const minutes = ('0' + (date.toLocaleString('en-US', { timeZone: timezone, minute: '2-digit' }) || '')).slice(-2);
  const seconds = ('0' + (date.toLocaleString('en-US', { timeZone: timezone, second: '2-digit' }) || '')).slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function updateResult() {
  const selectedTimezone = timezoneSelect.value;
  const timestamp = timestampInput.value || Math.floor(Date.now() / 1000); // 若未輸入時間戳則使用當前時間戳
  const formattedDate = convertTimestampToTimezone(timestamp, selectedTimezone);
  result.textContent = formattedDate;
}

convertButton.addEventListener('click', updateResult);

// 當用戶輸入時間戳時，監聽輸入框的變更事件
timestampInput.addEventListener('input', updateResult);

fetchTimezones();
