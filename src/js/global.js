const changeTheme = document.querySelector('.change-theme');

const leftMenu = document.querySelector('.left-menu-bar');
const handleLeftMenu = document.querySelector('.handle-left-menu');
const userBtn = leftMenu.querySelector('.user-btn');


// all functions and event listeners

changeTheme.addEventListener('click', () => {
    const themeIcon = changeTheme.querySelector('img');
    const currentIcon = themeIcon.dataset.currenticon;


    if(currentIcon == 'moon'){
        themeIcon.src = './assets/sun.svg';
        themeIcon.dataset.currenticon = 'sun';
        document.documentElement.dataset.theme = 'dark';
    } else {
        themeIcon.src = './assets/moon.svg';
        themeIcon.dataset.currenticon = 'moon';
        document.documentElement.dataset.theme = 'light';
    }
});


handleLeftMenu.addEventListener('click', () => {
    userBtn.classList.toggle('hide');
    leftMenu.classList.toggle('minimize');
});