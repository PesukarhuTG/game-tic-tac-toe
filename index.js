import getRandomInt from './modules/randomInteger.js';
import { getLocalStorage, setLocalStorage } from './modules/localStorage.js';
import { addZero } from './modules/addZero.js';

const modal = document.querySelector('.modal');
const startBtns = document.querySelector('.start-btns');
const area = document.querySelector('.area');
const cells = document.querySelectorAll('.cell');
const userScoreX = document.querySelector('.score-x');
const userScoreO = document.querySelector('.score-o');
const messageText = document.querySelector('.message-text');
const restartBtns = document.querySelector('.restart-btns');
const statInfo = document.querySelector('.stat-info');
const statTable = document.querySelector('.stat-table');
const statInfoMain = document.querySelector('.stat-info-main');
const statTableMain = document.querySelector('.stat-table-main');
const btnContinue = document.querySelector('.btn-continue');
const btnStat = document.querySelector('.btn-stat');
const iconClose = document.querySelector('.icon-close');
const iconSound = document.querySelector('.icon-sound');
const audio = new Audio('assets/audio/skyfall.mp3');

let step = 0;
let scoreX = 0;
let scoreO = 0;
let result = '';
let games = getLocalStorage('gameList') ? getLocalStorage('gameList') : [];


//== ШАБЛОН ОБЪЕКТА С РЕЗУЛЬТАТАМИ
function Obj(time, winner, steps) {
  this.time = time;
  this.winner = winner;
  this.steps = steps;
}

//2 ОПИСЫВАЕМ ПЕРВЫЙ ХОД КРЕСТОМ
const makeFirstStep = () => {
  const randomNum = getRandomInt(0, cells.length);
  cells[randomNum].classList.add('cross');
  cells[randomNum].textContent = 'X';
  cells[randomNum].setAttribute('data-status', 'checked');
  scoreX++;
  userScoreX.textContent = scoreX;
};

//5 ПОКАЗЫВАЕМ ОКНО С РЕЗУЛЬТАТОМ ПОБЕДИТЕЛЯ
const showResult = (winner, type) => {
  let data = new Date();
  let time = `${addZero(data.getHours())}:${addZero(data.getMinutes())}:${addZero(data.getSeconds())}`

  if (type == 'x') {
    messageText.textContent = `Победитель: «${winner}». Количество ходов: ${scoreX}`;
    let res = new Obj(time, winner, scoreX);
    games.push(res); //результат направляем в массив
  }

  if (type == 'o') {
    messageText.textContent = `Победитель: «${winner}». Количество ходов: ${scoreO}`;
    let res = new Obj(time, winner, scoreO);
    games.push(res); //результат направляем в массив
  }

  if (type == '-') {
    messageText.textContent = `Победила «${winner}». Всего ходов: ${scoreO + scoreX + 1}`;
    let res = new Obj(time, winner, scoreO + scoreX + 1);
    games.push(res); //результат направляем в массив
  }

  checkGameCount();//проверяем длину массива...

  setLocalStorage('gameList', games); // отправляем данные в LS

  startBtns.classList.add('hidden'); //скрываем кнопки 'выберите за кого играть'
  statInfoMain.classList.add('hidden'); //скрываем окно статистики
  restartBtns.classList.remove('hidden'); //показываем кнопки 'продолжить/статистика'
  modal.classList.remove('hidden'); // выводим модальное пользователю
}

const checkGameCount = () => {
  //если длина массива > 10, то удаляем первую строчку
  if (games.length > 10) {
    games.shift();
    games.length = 10;
  }
}

//4 ФУНКЦИЯ ПРОВЕРКИ РЕЗУЛЬТАТОВ
const checkTable = () => {
  //выйгрышные комбинации
  const winIndexes = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < winIndexes.length; i++) {
    if (cells[winIndexes[i][0]].textContent == 'X' &&
      cells[winIndexes[i][1]].textContent == 'X' &&
      cells[winIndexes[i][2]].textContent == 'X') {
      result = 'крестики';
      showResult(result, 'x'); //показываем победителя - Х
    } else if (cells[winIndexes[i][0]].textContent == 'O' &&
      cells[winIndexes[i][1]].textContent == 'O' &&
      cells[winIndexes[i][2]].textContent == 'O') {
      result = 'нолики';
      showResult(result, 'o'); //показываем победителя - О
    }
  }
};

//6.1 ФУНКЦИЯ ОЧИСТКИ ПОЛЯ ДЛЯ СЛЕДУЮЩЕЙ ИГРЫ
const clearCell = () => {
  cells.forEach(cell => {
    cell.textContent = '';
    cell.removeAttribute('data-status');
    cell.classList.remove('zero', 'cross');
  });

  scoreX = 0;
  scoreO = 0;

  userScoreX.textContent = '0';
  userScoreO.textContent = '0';
  statTable.textContent = '';
  statTableMain.textContent = '';
};

//ФУНКЦИЯ ПОКАЗА БЛОКА СТАТИСТИКИ
const showScoreList = (appendElement) => {
  let arr = getLocalStorage('gameList'); //получение данных из LS

  for (let i = 0; i < arr.length; i++) { //пробегаемся по массиву, генерируем строчки и вставляем в таблицу
    const li = document.createElement('li');
    li.className = 'game-item';
    li.innerHTML = `
        <div class="game-item-num">${arr[i].time}</div>
        <div class="game-item-winner">Победили: <span class="game-win">«${arr[i].winner}»</span></div>
        <div class="game-item-score">Количество шагов: <span class="game-steps">${arr[i].steps}</span></div>
    `;
    appendElement.append(li);
  }
};

//1 НАЧАЛО ИГРЫ
startBtns.addEventListener('click', e => {
  audio.play();
  step = 0;

  //ОПРЕДЕЛЯЕМ СИМВОЛ ИГРОКА
  if (e.target.classList.contains('btn-x')) { //если выбрали Х, скрываем окно и начинаем игру
    modal.classList.add('hidden');
  }

  if (e.target.classList.contains('btn-o')) { //если выбрали О, указываем шаг нечетное
    step = 1;
    modal.classList.add('hidden');
    setTimeout(makeFirstStep, 300); //запускаем простановку первым Х
  }

  clearCell();
});

// 3 ПОСЛЕ НАЧАЛА ИГРЫ КЛИКИ ПО КЛЕТОЧКАМ
area.addEventListener('click', e => {
  const target = e.target;

  //если в поле кликнули по ячейке
  if (target.classList.contains('cell')) {

    //...если всё откликали и выйгрыш не сработал
    if ((scoreX + scoreO) === 8) {
      result = 'ничья!';
      showResult(result, '-');
    }

    //...если ячейка уже кликнута, то ничего не делаем
    if (target.hasAttribute('data-status')) return;

    //...если играем за Х - то дизайн для Х
    if (step % 2 === 0 || step === 0) {
      target.classList.add('cross');
      target.textContent = 'X';
      target.setAttribute('data-status', 'checked');
      scoreX++;
      userScoreX.textContent = scoreX;
    } else { //если играем за О - то дазайн для О
      target.classList.add('zero');
      target.textContent = 'O';
      target.setAttribute('data-status', 'checked');
      scoreO++;
      userScoreO.textContent = scoreO;
    }

    step++;

    checkTable(); //проверка комбинаций при каждом клике
  }
});

//6 ВЫБОР ДАЛЬНЕЙШИХ ДЕЙСТВИЙ
restartBtns.addEventListener('click', e => {

  //если выбрали 'продолжить'
  if (e.target.classList.contains('btn-restar')) {
    messageText.textContent = 'Выберите фигуру:';
    restartBtns.classList.add('hidden');
    startBtns.classList.remove('hidden');
  }

  //если выбрали 'показать статистику'
  if (e.target.classList.contains('btn-list')) {
    messageText.textContent = 'Статистика последних 10 игр:';
    showScoreList(statTable); //олучаем данные из LS
    restartBtns.classList.add('hidden'); //скрываем кнопки 'продалжить/статистика'

    statInfo.classList.remove('hidden'); //показываем таблицу статистики
    btnContinue.classList.remove('hidden'); //показать кнопку продолжить
  }
});

//7 ПОСЛЕ СТАТИСТИКИ ПРОДОЛЖАЕМ ИГРАТЬ
btnContinue.addEventListener('click', () => {
  statInfo.classList.add('hidden'); //скрываем таблицу статистики

  messageText.textContent = 'Выберите фигуру:';
  startBtns.classList.remove('hidden'); //показываем кнопки выбора символов
});

//КЛИК НА КНОПКУ СТАТИСТИКИ НА ГЛАВНОМ ЭКРАНЕ
btnStat.addEventListener('click', () => {
  statTableMain.textContent = ''; //очистить предыдущую инфу
  messageText.textContent = 'Статистика ваших 10 игр:';
  showScoreList(statTableMain); //получить данные из LS

  startBtns.classList.add('hidden'); //скрыть кнопки старта
  btnContinue.classList.add('hidden'); //скрыть кнопку продолжить
  statInfo.classList.remove('hidden'); //скрыть инфо результата

  statInfoMain.classList.remove('hidden'); //показать таблицу результатов
  modal.classList.remove('hidden'); //отразить модальное окно пользователю
});

iconClose.addEventListener('click', () => {
  modal.classList.add('hidden');
  statInfoMain.classList.add('hidden');
});

iconSound.addEventListener('click', () => {
  if (!iconSound.classList.contains('mute')) {
    iconSound.classList.add('mute');
    iconSound.src = 'assets/img/mute.png';
    audio.muted = true;
  } else {
    iconSound.classList.remove('mute');
    iconSound.src = 'assets/img/volume.png';
    audio.muted = false;
  }
});

audio.addEventListener('ended', () => {
  audio.currentTime = 0;
  audio.play();
});