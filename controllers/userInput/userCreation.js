const googleProfanityWords = require('google-profanity-words');
const db = require("../../models");
const mongoose = require("mongoose");
const newPlayerObject = require("./newPlayerObject.json");
const { generateBaseStats, roll } = require("./characterLeveling");

profanityArray = googleProfanityWords.list();


function allLetter(inputtxt) {
    var letters = /^[A-Za-z]+$/;
    if (inputtxt.value.match(letters)) {
        return true;
    }
    else {
        alert("message");
        return false;
    }
}



function checkNameWords(userInputTrimmed) {
    let spaces = 0;
    for (const letter of userInputTrimmed) {
        (letter === " ") && spaces++;
    }
    return spaces;
}


function characterFactory(name, email, password="Auth0isHandlingIt") {
    let thisPlayer = newPlayerObject;
    const stats = generateBaseStats();
    thisPlayer = {
        ...thisPlayer,
        characterName: name,
        characterNameLowerCase: name.toLowerCase(),
        email,
        password,
        description: `a Human Sandwich-maker`,
    }
    thisPlayer.stats = {
        ...thisPlayer.stats,
        ...stats,
        maxHP: stats.HP
    }
    return thisPlayer
}

function checkVersusProfanity(userInputTrimmed) {
    let userWordArray = userInputTrimmed.split(" ");
    for (const word of userWordArray) {
        for (const badWord of profanityArray) {
            if (word.toLowerCase() === badWord.toLowerCase()) {
                return false;
            } else if ((word.indexOf(badWord) > 0) && !(allLetter(badWord) && (badWord.length < 5))) {
                return false;
            }
        }
    }
    return true;
}

function validateName(io, socket, userInput) {
    return new Promise(function (resolve, reject) {
        userInput = userInput.trim();
        if (checkNameWords(userInput) > 2) {
            io.to(socket.id).emit('failure', "Please make sure your name is no more than three words long.")
            resolve(false);
        } else if (!checkVersusProfanity(userInput)) {
            io.to(socket.id).emit('failure', "I'm sorry, that name won't work.")
            resolve(false);
        } else {
            console.log(userInput);
            db.Player.find({ characterNameLowerCase: userInput.toLowerCase() }).then(data => {
                if (data.length === 0) {
                    console.log('send create character');
                    resolve(true);
                } else {
                    console.log(data);
                    io.to(socket.id).emit('failure', "I'm sorry, that character name is taken.")
                    resolve(false);
                }
            })
        }
    });
}

function createCharacter(characterName, email){
    const character = characterFactory(characterName, email);
    db.Player.create(character);
}


module.exports = {
    validateName,
    createCharacter
}