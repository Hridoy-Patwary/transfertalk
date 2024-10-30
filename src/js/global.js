const documentElm = document.documentElement;

const changeTheme = document.querySelector('.change-theme');

const leftMenu = document.querySelector('.left-menu-bar');
const expandableUserMenu = leftMenu.querySelector('.expandable-user-menu');
const innerMenu = expandableUserMenu.querySelector('.inner-menu');
const handleLeftMenu = document.querySelector('.handle-left-menu');
const userBtn = leftMenu.querySelector('.user-btn');
const themeIcon = changeTheme.querySelector('img');

const welcomeBox = document.querySelector('.welcome-box');
const wlcmBoxInner = welcomeBox.querySelector('.box-inner');
const reduceBtn = welcomeBox.querySelector('.reduce');

const boxBoundingRect = wlcmBoxInner.getBoundingClientRect();


// all functions and event listeners

changeTheme.addEventListener('click', () => {
    const currentIcon = themeIcon.dataset.currenticon;

    if (currentIcon == 'moon') {
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

userBtn.addEventListener('click', () => {
    leftMenu.classList.toggle('expand-user-menu');
    const innerMenuBoundingRect = innerMenu.getBoundingClientRect();

    if(leftMenu.classList.contains('expand-user-menu')){
        expandableUserMenu.style.height = innerMenuBoundingRect.height + 'px';
    }else expandableUserMenu.style = '';
});

handleLeftMenu.addEventListener('click', () => {
    userBtn.classList.toggle('hide');
    leftMenu.classList.toggle('minimize');
});

reduceBtn.addEventListener('click', () => {
    if (reduceBtn.classList.contains('show-more')) {
        wlcmBoxInner.style.height = boxBoundingRect.height + 'px';
        reduceBtn.innerHTML = 'Reduce';
        reduceBtn.classList.remove('show-more');
    } else {
        wlcmBoxInner.style.height = (boxBoundingRect.height - 105) + 'px';
        reduceBtn.innerHTML = 'Show more';
        reduceBtn.classList.add('show-more');
    }
})


const storeInLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
}

const getFromLocal = (key) => {
    return JSON.parse(localStorage.getItem(key));
}

window.addEventListener('load', () => {
    const theme = getFromLocal('theme');
    if (theme) {
        if (theme == 'dark') {
            themeIcon.src = './assets/sun.svg';
            themeIcon.dataset.currenticon = 'dark';
        } else {
            themeIcon.src = './assets/moon.svg';
            themeIcon.dataset.currenticon = 'light';
        }
        documentElm.dataset.theme = theme
    }
    wlcmBoxInner.style.height = boxBoundingRect.height + 'px';
});