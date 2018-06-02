// three users ‘moe’, ‘larry’, and ‘curly’
// cities nyc, la, chicago
// moe is the mayor of la and larry is the mayor of chicago…
// but.. also each lives in a city and of course a city can have many users…
// it makes sense that moe lives in la and larry lives in chicago…
// give it a shot… it’s not too different from my solution… but try it from scratch…
// when we are done we are going to make it a requirement that you can’t become mayor of a city unless you live there…
// but don’t worry about that now…

const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/my_db');

const User = conn.define('user', {
  name: Sequelize.STRING
}, {
  hooks: {
    beforeValidate: function(user) {
      if (user.cityId !== user.mayorId) {
        user.mayorId = null;
      }
    }
  }
});

const City = conn.define('city', {
  name: Sequelize.STRING
});

const usernames = ['Moe', 'Larry', 'Curly'];
const citynames = ['New York City', 'Los Angeles', 'Chicago'];

User.belongsTo(City);
User.belongsTo(City, { as: 'mayor' });
City.hasMany(User);
City.hasOne(User, { as: 'mayor_of', foreignKey: 'mayorId'});

conn.sync({ force: true })
  .then(() => {
    const userPromises = Promise.all(usernames.map(name => User.create({ name })));
    const cityPromises = Promise.all(citynames.map(name => City.create({ name })));
    return Promise.all([userPromises, cityPromises]);
  })
  .then(([users, cities]) => {
    const [moe, larry, curly] = users;
    const [nyc, la, chicago] = cities;
    return Promise.all([
      moe.setCity(la),
      larry.setCity(chicago),
      curly.setCity(nyc),
      moe.setMayor(nyc),
      larry.setMayor(chicago)
    ]);
  });
