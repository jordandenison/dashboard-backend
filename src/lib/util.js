const delay = async time => new Promise((resolve) => setTimeout(resolve, time))

const getRandomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

module.exports = {
  delay,
  getRandomBetween
}
