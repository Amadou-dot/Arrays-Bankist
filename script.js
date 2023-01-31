'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Amadou Mactar Seck',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2021-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2022-05-27T17:01:17.194Z',
    '2023-01-30T10:10:03.728Z',
    '2023-01-31T10:10:03.728Z',
  ],
  currency: 'EUR',
  locale: 'fr-fr', //
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// #region Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
let currentAccount, timer, sorted;
// #endregion
/////////////////////////////////////////////////
//#region FUNCTIONS

const calcDaysPassed = (date1, date2) =>
  Math.round((date2 - date1) / (1000 * 60 * 60 * 24));

const formatMovementsDate = (date, locale) => {
  const daysPassed = calcDaysPassed(date, new Date());
  switch (daysPassed) {
    case 0:
      return `Today`;
    case 1:
      return 'Yesterday';

    default:
      return new Intl.DateTimeFormat(locale).format(date);
  }
};

const displayMovements = function (acc, sort = false) {
  const movementAndDates = acc.movementsDates.map((date, i) => [
    acc.movements[i],
    date,
  ]);
  sorted = sort;
  sort ? movementAndDates.sort((a, b) => a[0] - b[0]) : acc.movements;

  movementAndDates.forEach(([mov, date_], i) => {
    const date = formatMovementsDate(new Date(date_), acc.locale);
    const formattedMov = new Intl.NumberFormat(acc.locale, {
      style: 'currency',
      currency: acc.currency,
    }).format(Math.abs(mov));
    const movType = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${movType}">
        ${i + 1} ${movType}
      </div>
      <div class="movements__date">${date}</div>
      <div class="movements__value">${formattedMov}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const setAllUsernames = accounts => {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .split(' ')
      .map(letter => letter[0].toLowerCase())
      .join('');
  });
};

const pushNewDate = acc => acc.movementsDates.push(new Date().toISOString());

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const startLogoutTimer = () => {
  let time = 60 * 10;
  const tick = function () {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${Math.trunc(time % 60)}`.padStart(2, 0);
    // print timer result to the ui
    labelTimer.textContent = `${min}:${sec}`;
    // if timer reaches 0, logout the user
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      containerApp.style.visibility = 'none';
      containerApp.style.pointerEvents = 'none';
      displayMessage('You have been logged out');
      currentAccount = null;
    }
    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

const formatCurrency = (value, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);

const calcDisplayStatistics = acc => {
  const mov = acc.movements;
  const deposits = mov.filter(mov => mov > 0).reduce((acc, cur) => acc + cur);
  const withdraws = mov.filter(mov => mov < 0).reduce((acc, cur) => acc + cur);
  const interest = mov
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, cur) => acc + cur);

  labelSumIn.textContent = formatCurrency(deposits, acc.locale, acc.currency);
  labelSumOut.textContent = formatCurrency(
    Math.abs(withdraws),
    acc.locale,
    acc.currency
  );
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const displayMessage = message => (labelWelcome.textContent = message);

const updateUI = function (account) {
  containerApp.classList.remove('app--hidden');

  //? Update UI Data
  displayMovements(account);

  calcDisplayStatistics(account);

  calcDisplayBalance(account);

  displayMessage(`Welcome back ${account.owner.split(' ')[0]}`);

  //? Update UI Date
  const locale = currentAccount.locale;
  labelDate.textContent = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date());

  //? Clear input fields
  inputLoginPin.value =
    inputLoginUsername.value =
    inputTransferAmount.value =
    inputTransferTo.value =
    inputClosePin.value =
    inputCloseUsername.value =
    inputLoanAmount.value =
      '';
  inputLoginPin.blur();
  inputLoginUsername.blur();
  inputTransferAmount.blur();
  inputTransferTo.blur();
  inputClosePin.blur();
  inputCloseUsername.blur();
  inputLoanAmount.blur();
};
setAllUsernames(accounts);
// #endregion
// #region LOGIN
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    user =>
      user.username === inputLoginUsername.value &&
      user.pin === Number(inputLoginPin.value)
  );
  if (!currentAccount) {
    containerApp.classList.add('app--hidden');
    displayMessage('Log in to get started');
    return;
  }
  //? Account exists
  timer ? clearInterval(timer) : null; // clear any existing timer
  timer = startLogoutTimer();
  updateUI(currentAccount);
});

// #region TRANSFER
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    user => user.username === inputTransferTo.value
  );
  if (
    !amount ||
    amount <= 0 ||
    amount > currentAccount.balance ||
    !receiverAcc ||
    currentAccount === receiverAcc
  )
    return;
  currentAccount.movements.push(-amount);
  receiverAcc.movements.push(amount);
  // add transfer date

  pushNewDate(currentAccount);
  pushNewDate(receiverAcc);
  clearInterval(timer); // restart timer
  timer = startLogoutTimer();
  updateUI(currentAccount);
});

// #region CLOSE ACCOUNT
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const toDelete = accounts.find(
    user =>
      user.username === inputCloseUsername.value &&
      user.pin === Number(inputClosePin.value)
  );

  if (toDelete !== currentAccount) return;
  accounts.splice(
    accounts.findIndex(_ => toDelete === currentAccount),
    1
  );
  containerApp.classList.add('app--hidden');
});

// #region LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const reqAmount = Math.floor(inputLoanAmount.value);
  if (!reqAmount || reqAmount <= 0) return;
  if (currentAccount.movements.some(mov => mov >= reqAmount * 0.5))
    currentAccount.movements.push(reqAmount);
  setTimeout(() => {
    pushNewDate(currentAccount);
    clearInterval(timer); // restart timer
    timer = startLogoutTimer();
    updateUI(currentAccount);
  }, 2000);
});

// #region SORTING MOVEMENTS
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
});
