'use strict';

/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Amadou Mactar Seck',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
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
let currentAccount;
let sorted;

//#region FUNCTIONS
const displayMovements = function (movements, sort = false) {
  sorted = sort;
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  containerMovements.innerHTML = '';
  movs.forEach((mov, i) => {
    const movType = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${movType}">
        ${i + 1} ${movType}
      </div>
      <div class="movements__date">3 days ago</div>
      <div class="movements__value">${mov}€</div>
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

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplayStatistics = acc => {
  const mov = acc.movements;
  const deposits = mov.filter(mov => mov > 0).reduce((acc, cur) => acc + cur);
  const withdraws = mov.filter(mov => mov < 0).reduce((acc, cur) => acc + cur);
  const interest = mov
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, cur) => acc + cur);
  labelSumIn.textContent = `${deposits}€`;
  labelSumOut.textContent = `${Math.abs(withdraws)}€`;
  labelSumInterest.textContent = `${interest}€`;
};

const displayMessage = message => (labelWelcome.textContent = message);

const updateUI = function (account) {
  const movements = account.movements;
  containerApp.style.opacity = 1;
  //? Update UI Data
  displayMovements(movements);
  calcDisplayStatistics(account);
  calcDisplayBalance(account);
  displayMessage(`Welcome back ${account.owner.split(' ')[0]}`);
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
    containerApp.style.opacity = 0;
    displayMessage('Log in to get started');
    return;
  }
  //? Account exists
  updateUI(currentAccount);
});
// #endregion
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
  updateUI(currentAccount);
});
// #endregion
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
  containerApp.style.opacity = 0;
});

// #region
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const reqAmount = Number(inputLoanAmount.value);
  if (!reqAmount || reqAmount <= 0) return;
  if (currentAccount.movements.some(mov => mov >= reqAmount * 0.5))
    currentAccount.movements.push(reqAmount);
  updateUI(currentAccount);
});

// #region SORTING MOVEMENTS
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
});
