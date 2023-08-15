import autoAnimate from 'https://cdn.jsdelivr.net/npm/@formkit/auto-animate@1.0.0-beta.1/index.min.js';

const resultsNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const saveConfirmed = document.querySelector('.save-confirmed');
const loader = document.querySelector('.loader');

// NASA API
const apiKey = "DEMO_KEY";
const apiCount = 10;
const apiURL = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${apiCount}`;

let resultsArray = [];
let favorites = {};

// Utility functions
function createElement(element = "") {
    return document.createElement(element);
}

function classListOperation(element, operation, class1, class2) {
    if (element && element.classList) {
      switch (operation) {
        case 'add':
          element.classList.add(class1);
          break;
        case 'remove':
          element.classList.remove(class1);
          break;
        case 'toggle':
          element.classList.toggle(class1);
          break;
        case 'replace':
          element.classList.replace(class1, class2);
          break;
        default:
          console.error(`Invalid operation: ${operation}`);
          break;
      }
    } else {
      console.error('Invalid element');
    }
  }

function setAttributeDot(element, attr, value) {
    element[attr] = value;
}

// END of Utils

// Scroll To Top, Remove Loader, Show Content
function showContent(page) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    classListOperation(loader,'add','hidden')

    if (page === 'results') {
        classListOperation(resultsNav,'remove','hidden')
        classListOperation(favoritesNav,'add','hidden')
    } else {
        classListOperation(favoritesNav,'remove','hidden')
        classListOperation(resultsNav,'add','hidden')

    }
}

function createDOMNodes(page) {
    // Load ResultsArray or Favorites
    const currentArray = page === 'results' ? resultsArray : Object.values(favorites);
    currentArray.forEach(result => {
        // Card Container
        const card = createElement('div');
        classListOperation(card,'add','card');
        // Link Wrapper
        const link = createElement('a');
        // link.href = result.hdurl;
        setAttributeDot(link, 'href', result.hdurl);
        setAttributeDot(link, 'title', "View Full Image");
        setAttributeDot(link, 'target', "_blank");
        // Image
        const image = createElement('img');
        setAttributeDot(image, 'src', result.url);
        setAttributeDot(image, 'alt', 'Nasa Picture of the Day');
        setAttributeDot(image, 'loading', 'lazy');
        classListOperation(image, 'add','card-img-top')
        // Card Body
        const cardBody = createElement('div');
        classListOperation(cardBody,'add','card-body');
        // Card Title
        const cardTitle = createElement('h5');
        setAttributeDot(cardTitle, 'textContent', result.title);
        classListOperation(cardTitle, 'add','card-title');
        // Save Text
        const saveText = createElement('p');
        classListOperation(saveText, 'add', 'clickable');
        if (page === 'results') {
            setAttributeDot(saveText, 'textContent', 'Add To Favourites');
            saveText.setAttribute('onclick', `saveFavorite('${result.url}')`);
          } else {
            setAttributeDot(saveText, 'textContent', 'Remove Favorite');
            saveText.setAttribute('onclick', `removeFavorite('${result.url}')`);
          }
        // Card Text
        const cardText = createElement('p');
        setAttributeDot(cardText, 'textContent', result.explanation);
        // Footer Container
        const footer = createElement('small');
        classListOperation(footer, 'add','text-muted');
        // Date
        const date = createElement('strong');
        setAttributeDot(date, 'textContent', result.date)
        // Copyright
        const copyright = createElement('span');
        setAttributeDot(copyright, 'textContent', ` ${result.copyright === undefined ? 'Unknown' : result.copyright}`)
        
        // Append from Bottom to Top
        footer.append(date, copyright);
        cardBody.append(cardTitle, saveText, cardText, footer);
        link.appendChild(image);
        card.append(link, cardBody);
        imagesContainer.appendChild(card);
    });
}
  

// Update the DOM
function updateDOM(page) {
    classListOperation(loader,'remove','hidden')
    // Get Favorites from localStorage
    const item = localStorage.getItem('nasaFavorites')
    if (item) {
        favorites = JSON.parse(item);
    }
    // Reset DOM, Create DOM Nodes, Show Content
    imagesContainer.textContent = '';
    createDOMNodes(page);
    showContent(page);
}

window.updateDOM = updateDOM;


// Get X Images from NASA API
async function getNasaPictures() {
    // Show Loader
    classListOperation(loader,'remove','hidden')
    try {
        resultsArray = await (await fetch(apiURL)).json();
        updateDOM('results');
    } catch (error) {
        // Catch Error Here
    }
}

window.getNasaPictures = getNasaPictures;

// Add result to Favorites
function saveFavorite(itemUrl) {
    // Loop through Results Array to select Favorite
    resultsArray.forEach((item) => {
      if (item.url.includes(itemUrl) && !favorites[itemUrl]) {
        favorites[itemUrl] = item;
        // Show Save Confirmation for 2 seconds
        saveConfirmed.hidden = false;
        setTimeout(() => {
          saveConfirmed.hidden = true;
        }, 2000);
        // Set Favorites in localStorage
        localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
      }
    });
  }
  
  // Remove item from Favorites
  function removeFavorite(itemUrl) {
    if (favorites[itemUrl]) {
      delete favorites[itemUrl];
      // Set Favorites in localStorage
      localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
      updateDOM('favorites');
    }
  }

  window.saveFavorite = saveFavorite;
  window.removeFavorite = removeFavorite;


// On Load
autoAnimate(imagesContainer);
getNasaPictures();