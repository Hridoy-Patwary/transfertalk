const htmlElm = document.documentElement;
const pageLoader = htmlElm.querySelector('.page-loading');

const changeTheme = document.querySelector('.change-theme');

const signInBtnHeader = document.querySelector('header .sign-in.header-right-btn-style');
const leftMenu = document.querySelector('.left-menu-bar');
const expandableUserMenu = leftMenu.querySelector('.expandable-user-menu');
const menuList = leftMenu.querySelectorAll('.menu-container li');
const handleLeftMenu = document.querySelector('.handle-left-menu');
const userBtn = leftMenu.querySelector('.user-btn');
const themeIcon = changeTheme.querySelector('img');

const mainContentArea = document.querySelector('.main-content-area .scroll');


const serverUrl = 'http://localhost:4050/';


// all functions and event listeners

document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        pageLoader.classList.add('hide');
    }
};

const getCurrentPage = () => {
    const url = new URL(window.location.href);
    const currentPage = url.searchParams.get('pg') ? url.searchParams.get('pg') : 'home';

    return currentPage
}

changeTheme.addEventListener('click', () => {
    const currentIcon = themeIcon.dataset.currenticon;

    if (currentIcon == 'moon') {
        themeIcon.src = './assets/sun.svg';
        themeIcon.dataset.currenticon = 'sun';
        htmlElm.dataset.theme = 'dark';
    } else {
        themeIcon.src = './assets/moon.svg';
        themeIcon.dataset.currenticon = 'moon';
        htmlElm.dataset.theme = 'light';
    }
    storeInLocal('theme', htmlElm.dataset.theme)
});

const handleExpandableUserMenuHeight = (x, z) => {
    const innerMenu = expandableUserMenu.querySelector('.inner-menu');
    const innerMenuBoundingRect = innerMenu.getBoundingClientRect();
    let y = 0;

    if (x !== false) {
        leftMenu.classList.toggle('expand-user-menu');
    } else y = 69;

    if (z == false) y = -65;

    if (leftMenu.classList.contains('expand-user-menu')) {
        expandableUserMenu.style.height = innerMenuBoundingRect.height + y + 'px';
    } else {
        expandableUserMenu.style = ''
    };
}

userBtn.addEventListener('click', handleExpandableUserMenuHeight);

handleLeftMenu.addEventListener('click', () => {
    userBtn.classList.toggle('hide');
    leftMenu.classList.toggle('minimize');

    if (leftMenu.classList.contains('minimize')) {
        handleExpandableUserMenuHeight(false, true);
    } else {
        handleExpandableUserMenuHeight(false, false);
    }
});

signInBtnHeader.addEventListener('click', (e) => {
    e.preventDefault();
    const signInMenuItem = leftMenu.querySelector(`[data-page="sign-in"]`);
    signInMenuItem.click();
});

const storeInLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
}

const getFromLocal = (key) => {
    return JSON.parse(localStorage.getItem(key));
}

const loadPageContent = async (pageSrc) => {
    try {
        const response = await fetch(`${pageSrc}.html`);

        if (!response.ok) throw new Error("Page not found");

        const content = await response.text();
        return content;
    } catch (error) {
        console.error("Error loading page:", error);
        document.getElementById('content').innerHTML = "Page not found.";
    }
}

menuList.forEach((menu) => menu.addEventListener('click', () => {
    const currentUrl = new URL(window.location.href);
    const oldActiveMenu = leftMenu.querySelector('.menu-container li.active');
    const urlStateTxt = menu.innerText.toLowerCase().replaceAll(' ', '-').trim();
    const page = urlStateTxt;

    if (page === 'home') {
        window.history.replaceState({}, '', window.location.pathname);
    } else {
        currentUrl.searchParams.set('pg', urlStateTxt);
        window.history.pushState({ page }, '', `?pg=${urlStateTxt}`);
    }
    
    if(oldActiveMenu) oldActiveMenu.classList.remove('active');
    menu.classList.add('active');
    updateUIonMenuClick();
}));

const updateUIonMenuClick = async () => {
    const page = getCurrentPage();
    const oldActiveMenu = leftMenu.querySelector('li.active');
    const currentPageMenu = leftMenu.querySelector(`[data-page=${page}]`);
    const pageSrc = `./pages/${page}`;
    let pageContent = await loadPageContent(pageSrc);

    if(oldActiveMenu) oldActiveMenu.classList.remove('active');
    if(currentPageMenu) currentPageMenu.classList.add('active');
    mainContentArea.innerHTML = '';
    mainContentArea.innerHTML = pageContent;

    checkAndUpdateChangedUIeventListeners();
}

const checkAndUpdateChangedUIeventListeners = () => {
    const fileDragArea = document.querySelector('.drag-and-drop-area');
    const fileUploadInp = document.getElementById('file-upload-inp');
    const createAccSignInPage = document.querySelector('.create-account-sign-in-pg');
    const signInWithPass = document.querySelector('.login-with-pass');
    const signInSendMeMagicLink = document.querySelector('.send-magic-link');
    const loginWithPatreon = document.querySelector('.login-with-patreon');
    const faqList = document.querySelectorAll('.faq-page .faq-list .faq-box');
    const welcomeBox = document.querySelector('.welcome-box');


    if (fileDragArea) handleDragAndDrop(fileDragArea, fileUploadInp);

    if (signInWithPass) handleSignInWithPass(signInWithPass, signInSendMeMagicLink);
    if (signInSendMeMagicLink) { handleSendMagicLinkBtn(signInSendMeMagicLink) };
    if (loginWithPatreon) handleLoginWithPatreonBtn(loginWithPatreon);
    if(welcomeBox) handleWelcomBox(welcomeBox);

    if (createAccSignInPage) {
        createAccSignInPage.addEventListener('click', () => {
            leftMenu.querySelector(`[data-page='create-account']`).click();
        })
    }

    if (faqList) handleFaqList(faqList);
}

const handleWelcomBox = (welcomeBox) => {
    const wlcmBoxInner = welcomeBox.querySelector('.box-inner');
    const reduceBtn = welcomeBox.querySelector('.reduce');
    const boxBoundingRect = wlcmBoxInner.getBoundingClientRect();

    wlcmBoxInner.style.height = boxBoundingRect.height + 'px';
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
}

const handleLoginWithPatreonBtn = (btn) => {
    btn.addEventListener('click', () => {
        console.log('login with patreon btn clicked');
    })
}

const handleSignInWithPass = (btn, removeElm) => {
    const inputs = btn.parentElement.querySelectorAll('input');

    btn.addEventListener('click', () => {
        if (btn.classList.contains('just-login')) {
            const emailInp = btn.parentElement.querySelector('.sign-in-email-inp');
            const passInp = btn.parentElement.querySelector('.sign-in-pass');
            let checkEmptyInp = false;

            inputs.forEach((inp) => {
                if (inp.value === '') {
                    checkEmptyInp = true;
                    inp.style.borderColor = 'rgb(207, 8, 8)';
                } else inp.style = '';
            });

            if (checkEmptyInp === false) {
                const data = {
                    email: emailInp,
                    pass: passInp
                }

                console.log('send data to server');
                fetch(serverUrl + 'api/v1/sign-in', {
                    method: 'post',
                    body: JSON.stringify(data)
                }).then(res => res.json()).then((data) => {
                    console.log(data);
                }).catch((err) => {
                    console.log(err);
                })
            }
        } else {
            const forgotPassElm = document.createElement('button');
            const inpPassContainer = document.querySelector('.input-pass-container');

            btn.innerHTML = 'Login'
            btn.classList.add('just-login');
            forgotPassElm.innerHTML = 'I forgot my password'
            forgotPassElm.className = 'forgot-pass';
            btn.parentElement.append(forgotPassElm)
            inpPassContainer.classList.add('show');
            removeElm.remove();
        }
    })
}

const handleSendMagicLinkBtn = (btn) => {
    const emailInp = btn.parentElement.querySelector('input.sign-in-email-inp');

    btn.addEventListener('click', () => {
        if (emailInp.value === '') {
            emailInp.style.borderColor = 'rgb(207, 8, 8)';
        } else {
            const data = {
                email: emailInp.value,
                data: false
            }
            fetch(serverUrl + 'api/v1/sign-in', ({
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })).then(res => res.json()).then((data) => {
                console.log(data);
            }).catch(err => {
                console.log(err);
            });
            emailInp.style = ''
        }
    });
}

const handleFaqList = (faqElmList) => {
    faqElmList.forEach((faq) => {
        const faqBoxContent = faq.querySelector('p');
        const faqBoxBoudingRect = faq.getBoundingClientRect();
        const faqContentBoudingRect = faqBoxContent.getBoundingClientRect();

        faq.addEventListener('click', () => {
            const expandHeight = faqContentBoudingRect.height + faqBoxBoudingRect.height + 20;
            faq.classList.toggle('expanded');
            if (faq.classList.contains('expanded')) {
                faq.style.height = faqBoxBoudingRect.height + 'px';
            } else {
                faq.style.height = expandHeight + 1 + 'px';
            }
        });
    })
}


updateUIonMenuClick();

window.addEventListener('popstate', updateUIonMenuClick);

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
        htmlElm.dataset.theme = theme
    }
});


