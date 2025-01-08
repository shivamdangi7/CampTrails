const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/camp-trails' )

const db = mongoose.connection;
db.on("error" , console.error.bind(console, "connection error:"))
db.once("open" , () =>{
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i=0 ; i< 50 ; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const randomPrice = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: '677038706ceae269637778ce',
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry : {
              type: "Point",
              coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dllcqqxkf/image/upload/v1736008833/CampTrails/d2ws4ht3pfw8b9hk0avd.jpg',
                  filename: 'CampTrails/d2ws4ht3pfw8b9hk0avd',
                },
                {
                  url: 'https://res.cloudinary.com/dllcqqxkf/image/upload/v1736008835/CampTrails/wsfuqohggucpef00hewd.jpg',
                  filename: 'CampTrails/wsfuqohggucpef00hewd',
                },
                {
                  url: 'https://res.cloudinary.com/dllcqqxkf/image/upload/v1736008835/CampTrails/jpodkxel5mhgg0voecto.jpg',
                  filename: 'CampTrails/jpodkxel5mhgg0voecto',
                }
              ],
             description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            price: randomPrice
        })
        await camp.save();

    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
