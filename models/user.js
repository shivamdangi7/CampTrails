const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String, 
        required : true,
        unique : true
    }
})

UserSchema.plugin(passportLocalMongoose);
// This is going to add a field for Username, password, and it's make sure those usernames are unique also give me some methods i can use.

module.exports = mongoose.model('User' , UserSchema)
