//== ШАБЛОН ЦЕЛОЕ РАНДОМНОЕ
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * max) + min;
};

export default getRandomInt;