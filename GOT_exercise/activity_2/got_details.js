// DOM #main div element
var main = document.getElementById('main');

// **** Your JavaScript code goes here ****
characters = [{
    "name": "Bran Stark",
    "status": "Alive",
    "current_location": "Fleeing White Walkers",
    "power_ranking": 7,
    "house": "stark",
    "probability_of_survival": 98
},
{
    "name": "Arya Stark",
    "status": "Alive",
    "current_location": "Back in Westeros",
    "power_ranking": 8,
    "house": "stark",
    "probability_of_survival": 99
},
{
    "name": "Sansa Stark",
    "status": "Alive",
    "current_location": "Winterfell",
    "power_ranking": 10,
    "house": "stark",
    "probability_of_survival": 83
},
{
    "name": "Robb Stark",
    "status": "Dead - Red Wedding S3E9",
    "current_location": "-",
    "power_ranking": -1,
    "house": "stark",
    "probability_of_survival": 0
}]

function halfSurvival(favoriteName) {
    for (let i = 0; i < characters.length; i++) {
        if (characters[i].name == favoriteName) {
            continue;
        }
        else {
            characters[i].probability_of_survival = characters[i].probability_of_survival / 2;
        }
    }
    return;
}

function debugCharacters() {
    for (let i = 0; i < characters.length; i++) {
        console.log(characters[i].name);
        console.log(characters[i].probability_of_survival);
    }
}

// Create a new DOM element
var header = document.createElement("h3");
// Append the newly created <h3> element to #main
main.appendChild(header);
// Set the textContent to:
header.textContent = "My Favorite GoT Characters";

function newDiv(character) {
    // Create a new <div> element	
    var div1 = document.createElement("div");
    // Append the newly created <div> element to #main
    main.appendChild(div1);

    // Create a new <h5> element
    var name1 = document.createElement("h5");
    // Append the newly created <h5> element to your new div
    div1.appendChild(name1);
    // Set the textContent to the first characters name
    name1.textContent = character.name;

    // House
    var house1 = document.createElement("p");
    div1.appendChild(house1);
    house1.textContent = "House: " + character.house;

    // Survival %
    var survival1 = document.createElement("p");
    div1.appendChild(survival1);
    survival1.textContent = "Survival %: " + character.probability_of_survival + "%";

    // Status
    var status1 = document.createElement("p");
    div1.appendChild(status1);
    status1.textContent = "Status: " + character.status;
}

for (let i = 0; i < characters.length; i++) {
    newDiv(characters[i]);
}
