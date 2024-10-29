const documentElm = document.documentElement;

const changeTheme = document.querySelector('.change-theme');

const leftMenu = document.querySelector('.left-menu-bar');
const handleLeftMenu = document.querySelector('.handle-left-menu');
const userBtn = leftMenu.querySelector('.user-btn');
const themeIcon = changeTheme.querySelector('img');


// all functions and event listeners

changeTheme.addEventListener('click', () => {
    const currentIcon = themeIcon.dataset.currenticon;


    if(currentIcon == 'moon'){
        themeIcon.src = './assets/sun.svg';
        themeIcon.dataset.currenticon = 'sun';
        documentElm.dataset.theme = 'dark';
    } else {
        themeIcon.src = './assets/moon.svg';
        themeIcon.dataset.currenticon = 'moon';
        documentElm.dataset.theme = 'light';
    }

    storeInLocal('theme', documentElm.dataset.theme)
});


handleLeftMenu.addEventListener('click', () => {
    userBtn.classList.toggle('hide');
    leftMenu.classList.toggle('minimize');
});


const storeInLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
}

const getFromLocal = (key) => {
    return JSON.parse(localStorage.getItem(key));
}

window.addEventListener('load', () => {
    const theme = getFromLocal('theme');
    if(theme){
        if(theme == 'dark'){
            themeIcon.src = './assets/sun.svg';
            themeIcon.dataset.currenticon = 'dark';
        }else{
            themeIcon.src = './assets/moon.svg';
            themeIcon.dataset.currenticon = 'light';
        }
        documentElm.dataset.theme = theme
    }
})