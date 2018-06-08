/*USERS APARTMENTS BUILDINGS
Users are: 'Moe', 'Larry', and 'Curly'.
Buildings are: '382 CPW', '666 Fifth Ave', and 'Faulty Towers'.
A user has a name and a building has a name.
A user can have an apartment in one or more buildings.
An apartment has a number.
Moe has Apt. 6K at 382 CPW
Moe also has Penthouse at 666 5th Ave.
Larry has Apt. 1C in Faulty Towers.
*/

const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/my_db');

const Building = conn.define('building', {
  name: Sequelize.STRING
});

const Apartment = conn.define('apartment', {
  name: Sequelize.STRING
});

const User = conn.define('user', {
  name: Sequelize.STRING,
});

const usernames = ['Moe', 'Larry', 'Curly'];
const buildingnames = ['382 CPW', '666 Fifth Ave', 'Faulty Towers'];
const apartmentnames = ['6K', 'penthouse', '1C'];

Apartment.belongsTo(Building);  //apartment has buildingId
Building.hasMany(Apartment, {as: 'building_of', foreignKey: 'buildingId'});
Apartment.belongsTo(User);      //apartment has userId
User.hasMany(Apartment);

const seed = () => { 
  const buildingPromises = Promise.all(buildingnames.map(name => Building.create({ name })));
  const userPromises = Promise.all(usernames.map(name => User.create({ name })));
  const apartmentPromises = Promise.all(apartmentnames.map(name => Apartment.create({ name })));
  
  return Promise.all([buildingPromises, userPromises, apartmentPromises])
    .then(([buildings, users, apartments]) => {
      const [cpw, fifthAve, faulty] = buildings;
      const [moe, larry, curly] = users;
      const [sixK, ph, oneC] = apartments;
      return Promise.all([
        sixK.setUser(moe),
        ph.setUser(moe),
        oneC.setUser(larry),
        sixK.setBuilding(cpw),
        ph.setBuilding(fifthAve),
        oneC.setBuilding(faulty)
      ]);
    });
  }

//FIND LARRY'S APARTMENT AND BUILDING
conn.sync({ force: true })
  .then(() => seed())
  .then(()=> User.findOne({
    where: {
      name: 'Larry'
    }
  }))
  .then(user => {
    const _user = user;
    return Apartment.findOne({
      where: {
        userId: user.id
      }
    })
  })
  .then(apt => {
    const _apt = apt;
    return Building.findById(apt.buildingId)
  })
  .then(building => console.log(`${_user.name} lives in apartment ${_apt.name} in ${building.name}`));

//FIND ALL OF MOE'S BUILDINGS
conn.sync({ force: true })
  .then(() => seed())
  .then(()=> User.findOne({
    where: {
      name: 'Moe'
    }
  }))
  .then(user => {
    const _user = user;
    return Apartment.findAll({
      where: {
        userId: user.id
      }
    })
  })
  .then(apts => {
    const _apts = apts;
    apts.forEach( apt => Building.findAll({
      where: {
        id: apt.buildingId
      }
    })
    .then(buildings => buildings.forEach(building => console.log(building.name))))
  });
