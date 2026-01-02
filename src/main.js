const API_URL = 'https://interview.switcheo.com/prices.json';
const ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';

const form = document.getElementById('converter-form');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error-msg');

const inputAmount = document.getElementById('input-amount');
const outputAmount = document.getElementById('output-amount');
const fromSelect = document.getElementById('from-currency');
const toSelect = document.getElementById('to-currency');
const fromIcon = document.getElementById('from-icon');
const toIcon = document.getElementById('to-icon');
const swapBtn = document.getElementById('swap-btn');
const rateDisplay = document.getElementById('exchange-rate-display');

let prices = {};

async function init() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    const processedData = {};
    data.forEach(item => {
      const { currency, price, date } = item;
      if (!processedData[currency] || new Date(date) > new Date(processedData[currency].date)) {
        processedData[currency] = { price, date };
      }
    });

    prices = processedData;
    populateDropdowns(Object.keys(prices));

    // Set Defaults
    if (prices['ETH']) fromSelect.value = 'ETH';
    if (prices['USD']) toSelect.value = 'USD';

    loading.classList.add('hidden');
    form.classList.remove('hidden');
    updateConversion();

  } catch (error) {
    console.error('Error fetching prices:', error);
    loading.classList.add('hidden');
    errorMsg.classList.remove('hidden');
  }
}

function populateDropdowns(currencies) {
  currencies.sort();
  const createOption = (currency) => {
    const option = document.createElement('option');
    option.value = currency;
    option.textContent = currency;
    return option;
  };
  currencies.forEach(currency => {
    fromSelect.appendChild(createOption(currency));
    toSelect.appendChild(createOption(currency));
  });
}

function updateIcons() {
  const fromCurr = fromSelect.value;
  const toCurr = toSelect.value;

  // Set SVG path
  if (fromCurr) fromIcon.src = `${ICON_BASE_URL}${fromCurr}.svg`;
  if (toCurr) toIcon.src = `${ICON_BASE_URL}${toCurr}.svg`;
}

function calculate() {
  const amount = parseFloat(inputAmount.value);
  const fromCurrency = fromSelect.value;
  const toCurrency = toSelect.value;

  if (isNaN(amount) || !fromCurrency || !toCurrency || !prices[fromCurrency] || !prices[toCurrency]) {
    outputAmount.value = '';
    rateDisplay.textContent = '--';
    return;
  }

  const fromPrice = prices[fromCurrency].price;
  const toPrice = prices[toCurrency].price;
  const result = (amount * fromPrice) / toPrice;

  outputAmount.value = result < 0.000001 ? result.toExponential(4) : result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });

  const rate = fromPrice / toPrice;
  rateDisplay.textContent = `1 ${fromCurrency} = ${rate < 0.000001 ? rate.toExponential(4) : rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toCurrency}`;
}

function updateConversion() {
  updateIcons();
  calculate();
}

inputAmount.addEventListener('input', calculate);
fromSelect.addEventListener('change', updateConversion);
toSelect.addEventListener('change', updateConversion);

swapBtn.addEventListener('click', () => {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  updateConversion();
});

init();