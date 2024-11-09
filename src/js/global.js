const htmlElm = document.documentElement;
const pageLoader = htmlElm.querySelector('.page-loading');

const changeTheme = document.querySelector('.change-theme');

const signInBtnHeader = document.querySelector('header .sign-in.header-right-btn-style');
const leftMenu = document.querySelector('.left-menu-bar');
const uploadBtnLeftMenu = leftMenu.querySelector('.upload-btn');
const expandableUserMenu = leftMenu.querySelector('.expandable-user-menu');
const menuList = leftMenu.querySelectorAll('.menu-bar-main li');
const handleLeftMenu = document.querySelector('.handle-left-menu');
const userBtn = leftMenu.querySelector('.user-btn');
const themeIcon = changeTheme.querySelector('img');

const mainContentArea = document.querySelector('.main-content-area .scroll');
const URI = new URL(window.location.href);

// const serverUrl = 'http://localhost:4050/';
const serverUrl = 'http://89.110.95.63:4050/';

let UID = getCookie('userId');


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

const captureAuthCode = () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    console.log(code); // send this code to server and make post request to get access token

    // fetch(serverUrl+'api/v1/token', {
    //     method: 'post',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({code: code})
    // })
    return code;
}

const setupUser = () => {
    const checkUUID = getCookie('userId');
    const userData = {}

    if(checkUUID){
        fetch(serverUrl+'api/v1/get-user-data', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: checkUUID})
        }).then(res => res.json()).then((data) => {
            if(data.username){
                storeInLocal('user-data', data);
            }
        }).catch((err) => {
            console.log(err);
            throw err;
        });
        UID = checkUUID;
    }else{
        fetch(serverUrl+'api/v1/auto-user', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        }).then(res => res.json()).then((data) => {
            setCookie('userId', data.id, 30);
            UID = data.id;
            storeInLocal('user-data', data);
            console.log('user id set to cookie, user id is: '+ getCookie('userId'));
        }).catch((err) => {
            console.log(err);
            throw err;
        })
    }
}

const updateUiWithUserData = () => {
    const data = getFromLocal('user-data');
    const profileHeading = document.querySelector('.profile-heading');
    const hideElm = document.querySelectorAll('.hide-after-signin');
    const anonymousBtn = leftMenu.querySelector('.menu-bar-top-buttons .username-elm');
    const loginWithPatreonBtn = document.querySelector('.login.login-with-patreon');


    if(data && data.username){
        signInBtnHeader.classList.add('goto-profile');
        signInBtnHeader.innerHTML = data.username;
        anonymousBtn.innerHTML = data.username;

        if(profileHeading) {
            const logOutBtn = profileHeading.querySelector('.log-out-btn');

            logOutBtn.classList.remove('hide');
            logOutBtn.addEventListener('click', () => {
                localStorage.clear();
                document.cookie = `userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                window.location.href = '/'
            })
        };
        if(loginWithPatreonBtn) loginWithPatreonBtn.innerHTML = 'Connect with Patreon';

        hideElm.forEach((elm) => {
            elm.remove();
        });
    }
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
    const profilePage = leftMenu.querySelector('[data-page="profile"]');

    if(signInBtnHeader.classList.contains('goto-profile')){
        profilePage.click();
    }else{
        signInMenuItem.click();
    }
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
    if(!menu.dataset.page) return;
    const currentUrl = new URL(window.location.href);
    const oldActiveMenu = leftMenu.querySelector('.menu-bar-main li.active');
    const urlStateTxt = menu.dataset.page;
    const page = urlStateTxt;

    if (page === 'home') {
        window.history.replaceState({}, '', window.location.pathname);
    } else {
        currentUrl.searchParams.set('pg', urlStateTxt);
        window.history.pushState({ page }, '', `?pg=${urlStateTxt}`);
    }

    if (oldActiveMenu) oldActiveMenu.classList.remove('active');
    menu.classList.add('active');
    updateUIonMenuClick();
}));

const updateUIonMenuClick = async () => {
    const page = getCurrentPage();
    const oldActiveMenu = leftMenu.querySelector('li.active');
    const currentPageMenu = leftMenu.querySelector(`[data-page=${page}]`);
    const pageSrc = `./pages/${page}`;
    let pageContent = await loadPageContent(pageSrc);

    if (oldActiveMenu) oldActiveMenu.classList.remove('active');
    if (currentPageMenu) currentPageMenu.classList.add('active');
    mainContentArea.innerHTML = '';
    mainContentArea.innerHTML = pageContent;

    checkAndUpdateChangedUIeventListeners();
}

const checkAndUpdateChangedUIeventListeners = () => {
    const fileDragArea = document.querySelector('.drag-and-drop-area');
    const fileUploadInp = document.getElementById('file-upload-inp');
    const createAccSignInPage = document.querySelector('.create-account-sign-in-pg');
    const createAccPage = document.querySelector('.create-account-ui-outer');
    const subscribeViaPatreon = document.querySelector('.subscribe-via-patreon');
    const signInWithPass = document.querySelector('.login-with-pass');
    const signInSendMeMagicLink = document.querySelector('.send-magic-link');
    const loginWithPatreon = document.querySelector('.login-with-patreon');
    const faqList = document.querySelectorAll('.faq-page .faq-list .faq-box');
    const welcomeBox = document.querySelector('.welcome-box');

    const profileUI = document.querySelector('.profile-ui');
    const fileViewMain = document.querySelector('.file-view-ui');


    updateUiWithUserData();
    if (fileDragArea) handleDragAndDrop(fileDragArea, fileUploadInp);

    if (signInWithPass) handleSignInWithPass(signInWithPass, signInSendMeMagicLink);
    if (signInSendMeMagicLink) { handleSendMagicLinkBtn(signInSendMeMagicLink) };
    if (loginWithPatreon) handleLoginWithPatreonBtn(loginWithPatreon);
    if (welcomeBox) handleWelcomBox(welcomeBox);

    if (createAccSignInPage) {
        createAccSignInPage.addEventListener('click', () => {
            leftMenu.querySelector(`[data-page='create-account']`).click();
        });
    }
    if(subscribeViaPatreon) subscribeViaPatreon.addEventListener('click', subscribeViaPatreonHandler);

    if (faqList) handleFaqList(faqList);

    if(profileUI) profileUiInteractions(profileUI);
    if(fileViewMain) handleFileViewInteractions(fileViewMain);

    createAcccountHandler(createAccPage);
}

const subscribeViaPatreonHandler = () => {
    const checkForPopupElm = document.querySelector('.popup-alert-outer');
    let showPopupAlert = document.createElement('div');
    
    showPopupAlert.className = 'popup-alert-outer';
    showPopupAlert.innerHTML = `<div class="popup-alert-inner">
                                    <div class="content">
                                    <h3>Login with Patreon first</h3>
                                        <p>In order to subscribe via Patreon you need to login with Patreon first</p>
                                    </div>
                                    <div class="popup-buttons">
                                        <button class="continue-login">Login with Patreon</button>
                                        <Button class="popup-cancel">Cancel</button>
                                    </div>
                                </div>`;
    
    if(checkForPopupElm){
        showPopupAlert = checkForPopupElm;
        showPopupAlert.classList.remove('hide');
    }else{
        document.body.append(showPopupAlert);
    }
    showPopupAlert.querySelector('.continue-login').addEventListener('click', () => {
        console.log('continue login')
    })
    showPopupAlert.querySelector('.popup-cancel').addEventListener('click', () => {
        showPopupAlert.classList.add('hide');
    });
}

const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

const createAcccountHandler = (UI) => {
    if(!UI) return;

    const singUpBtn = UI.querySelector('.sign-in-submit');
    const inputs = UI.querySelectorAll('.create-account-inp-box input');
    const confirmPassInp = UI.querySelector('.create-account-inp-box input.conf-pass');

    if(singUpBtn) singUpBtn.addEventListener('click', () => {
        singUpBtn.disabled = true;

        let everyThingValid = true,
            inpDataObj = {};
        
        inputs.forEach((inp) => {
            if(inp.value == ''){
                everyThingValid = false;
                inp.style.borderColor = 'rgb(199, 78, 78)';
            }else{
                if(inp.name == 'email'){
                    if(!isValidEmail(inp.value)){
                        everyThingValid = false;
                        inp.style.borderColor = 'rgb(199, 78, 78)';
                    }else{
                        inp.style = ''
                    }
                }else{
                    inp.style = ''
                }
            }
            inpDataObj[inp.name] = inp.value;
        });

        if(everyThingValid) {
            if(inpDataObj.password === inpDataObj['cf-pass']){
                confirmPassInp.style = '';
                const userData = {
                    username: inpDataObj['name'],
                    email: inpDataObj['email'],
                    password: inpDataObj['password'],
                    uid: UID
                }

                fetch(serverUrl+'api/v1/sign-up', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                }).then(res => res.json()).then((data) => {
                    if(data.username){
                        gotoHome();
                        singUpBtn.disabled = false;
                        storeInLocal('user-data', data);
                        updateUiWithUserData();
                    }else{
                        window.location.reload();
                    }
                }).catch((err) => {
                    console.log(err);
                    throw err;
                })
            }else{
                confirmPassInp.style.borderColor = 'rgb(199, 78, 78)';
            }
        }
    });
}

const gotoHome = () => {
    const homeMenuItem = document.querySelector(`[data-page='home']`);
    homeMenuItem.click();
}

const handleFileViewInteractions = (fileView) => {
    const fileViewSearchClearInp = fileView.querySelector('.clear-search-inp');
    const fileViewSearchInp = fileView.querySelector('.search-inp-container input');
    const selectAllFiles = fileView.querySelector('#select-all-files');
    const fileViewList = fileView.querySelector('.file-view-list');
    const fileViewManager = fileView.querySelector('.file-manager-view');

    fetch(serverUrl+'api/v1/get-user-files', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({uid: UID})
    }).then(res => res.json()).then((data) => {
        if(data){
            fileViewList.innerHTML = ''
            data.forEach((file) => {
                const fileViewRowElm = document.createElement('div');
                fileViewRowElm.className = 'file-list-item';

                fileViewRowElm.innerHTML = `
                    <div class="select">
                        <input type="checkbox" name="select">
                    </div>
                    <div class="names" data-filename=${file.filename}>
                        <span>${shortenFilename(file.filename)}</span>
                    </div>
                    <div class="sizes">
                        <span>${formatBytes(file.size)}</span>
                    </div>
                    <div class="modified-on">
                        <span>${file.lastModified}</span>
                    </div>
                    <div class="file-options" data-download="${serverUrl+'uploads/'+UID+'/'+file.filename}">
                        <div class="file-view-icon">
                            <img src="../assets/file-view-icon.svg" alt="icon">
                        </div>
                        <span class="download-icon">
                            <img src="../assets/download-icon.svg" alt="">
                        </span>
                    </div>
                `;

                fileViewList.append(fileViewRowElm);
            });
            handleFileView(fileViewList);
        }else{
            fileViewManager.innerHTML = '<p class="no-files-uploaded">No files uploaded</p>'
        }
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    fileViewSearchInp.addEventListener('keyup', () => {
        console.log(fileViewSearchInp.value);
    });

    selectAllFiles.addEventListener('click', () => {
        const selectFileCheckboxes = fileView.querySelectorAll('.file-list-item .select input');
        selectFileCheckboxes.forEach((inp) => {
            inp.checked = selectAllFiles.checked;
        });
    });

    fileViewSearchClearInp.addEventListener('click', () => {
        fileViewSearchInp.value = '';
    });
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

                if(inp.type == 'email'){
                    if(!isValidEmail(inp.value)){
                        checkEmptyInp = true;
                        inp.style.borderColor = 'rgb(207, 8, 8)';
                    }else inp.style = '';
                }
            });

            if (checkEmptyInp === false) {
                const data = {
                    email: emailInp.value,
                    pass: passInp.value
                }
                fetch(serverUrl + 'api/v1/sign-in', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).then(res => res.json()).then((data) => {
                    if(data.message){
                        // show message
                    }else{
                        storeInLocal('user-data', data);
                        gotoHome();
                        updateUiWithUserData();
                    }
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

const generateMediaTag = (url) => {
    const extension = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
        // If it's a video file, return a <video> tag
        return `<video controls data-download="${url}">
                    <source src="${url}" type="video/${extension}">
                    Your browser does not support the video tag.
                </video>`;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic'].includes(extension)) {
        // If it's an image file, return an <img> tag
        return `<img src="${url}" alt="Media" data-download="${url}" />`;
    } else {
        return `<p>Unsupported file type</p>`;
    }
};

const handleFileView = (itemsContainer) => {
    const allFileViewBtns = itemsContainer.querySelectorAll('.file-options .file-view-icon');
    const allFileDownloadBtns = itemsContainer.querySelectorAll('.file-options .download-icon');
    let mediaSlideItems = '';

    allFileViewBtns.forEach((btn, i) => {
        const listItem = btn.closest('.file-list-item');
        const fileName = listItem.querySelector('.names').dataset.filename;
        const fileURL = serverUrl+'uploads/'+UID+'/'+fileName;
        const mediaTag = generateMediaTag(fileURL);
        mediaSlideItems += `<div class="media-item-container" data-index=${i}>
                                ${mediaTag}
                            </div>`;

        btn.addEventListener('click', () => {
            const checkForFileViewer = document.querySelector('.file-viewer-elm-outer');
            const fileViewerElm = document.createElement('div');
            const fileViewerMainContent = `<div class="media-items-slider">
                                                ${mediaSlideItems}
                                            </div>
                                            <span class="arrow-left arrow">
                                                <img src="../../assets/arrow-black.svg" alt="arrow">
                                            </span>
                                            <span class="arrow-right arrow">
                                                <img src="../../assets/arrow-black.svg" alt="arrow">
                                            </span>`;
            
            fileViewerElm.className = 'file-viewer-elm-outer hide';
            fileViewerElm.innerHTML = `<div class="file-viewer-elm">
                                            <div class="file-viewer-header">
                                                <span class="current-file">${i+1}/${allFileViewBtns.length}</span>
                                                <div class="viewer-options">
                                                    <span class="file-download" title="Download">
                                                        <img src="../../assets/download-icon.svg" alt="icon"/>
                                                    </span>
                                                    <span class="file-viewer-close" title="Close">
                                                        <img src="../../assets/cross-icon.svg" alt="icon" />
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="file-viewer-main">
                                                ${fileViewerMainContent}
                                            </div>
                                        </div>`;
            if(!checkForFileViewer){
                document.body.append(fileViewerElm);
                const activeElm = fileViewerElm.querySelector(`[data-index='${i}']`);
                activeElm.classList.add('active');
                fileViewerOptionsInteractions(fileViewerElm);
            }else{
                const oldActive = checkForFileViewer.querySelector('.active');
                const makeActive = checkForFileViewer.querySelector(`[data-index='${i}']`);
                const mediaSlider = checkForFileViewer.querySelector('.media-items-slider');
                makeActive.classList.add('active');

                mediaSlider.style.transform = `translateX(-${i}00%)`;
                if(oldActive) oldActive.classList.remove('active');
                checkForFileViewer.classList.remove('hide');
            }
        });
    });

    allFileDownloadBtns.forEach((btn) => btn.addEventListener('click', () => {
        const downloadLink = btn.parentElement.dataset.download;
        fileDownloader(downloadLink)
    }));
}

const fileDownloader = (url) => {
    const a = document.createElement('a');

    a.href = url;
    a.download = '';
    document.body.append(a);
    a.click();
}

const getActiveElmIndex = (viewer) => {
    const activeSlider = viewer.querySelector('.active');
    const sliderIndex = activeSlider.dataset.index;
    return parseInt(sliderIndex);
}

const changeActiveElmWithIndex = (viewer, index) => {
    const activeSlider = viewer.querySelector('.active');

    if(index >= 0){
        activeSlider.classList.remove('active');
        const newActiveSlider = viewer.querySelector(`[data-index='${index}']`);
        newActiveSlider.classList.add('active');
    }
}

const fileViewerOptionsInteractions = (viewer) => {
    const mediaSlider = viewer.querySelector('.media-items-slider');
    const sliderIndex = getActiveElmIndex(viewer);
    const rightArrow = viewer.querySelector('.arrow-right');
    const leftArrow = viewer.querySelector('.arrow-left');

    const showCurrentSlideNum = viewer.querySelector('.current-file')
    const downloadBtn = viewer.querySelector('.file-download');
    const closeViewerBtn = viewer.querySelector('.file-viewer-close');

    mediaSlider.style.transform = `translateX(-${sliderIndex}00%)`;
    setTimeout(() => {
        viewer.classList.remove('hide');
    }, 10);

    downloadBtn.addEventListener('click', () => {
        const activeElm = document.querySelector('.media-items-slider').querySelector('.active');
        console.log(activeElm.children[0].dataset.download);
    })

    closeViewerBtn.addEventListener('click', () => {
        const activeElm = document.querySelector('.media-items-slider').querySelector('.active');
        if(activeElm) activeElm.classList.remove('active');
        viewer.classList.add('hide');
    });

    // media viewer slider
    rightArrow.addEventListener('click', () => {
        const index = getActiveElmIndex(viewer);
        const mediaSliderChildCount = mediaSlider.childElementCount;
        if(index+1 < mediaSliderChildCount) changeActiveElmWithIndex(viewer, index+1);
        showCurrentSlideNum.innerHTML = (index+2 <= mediaSliderChildCount ? index+2 : index+1) + '/' + mediaSliderChildCount
        mediaSlider.style.transform = `translateX(-${index+1 < mediaSliderChildCount ? index + 1 : index}00%)`;
    });
    leftArrow.addEventListener('click', () => {
        const index = getActiveElmIndex(viewer);
        const mediaSliderChildCount = mediaSlider.childElementCount;

        changeActiveElmWithIndex(viewer, index-1)
        showCurrentSlideNum.innerHTML = (index-1 < 0 ? 1 : index) + '/' + mediaSliderChildCount
        mediaSlider.style.transform = `translateX(-${index-1 < 0 ? 0 : index-1}00%)`;
    });
}



uploadBtnLeftMenu.addEventListener('click', () => leftMenu.querySelector(`[data-page='upload-files']`).click());


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
    if(URI.searchParams.get('code')){
        captureAuthCode();
        // getAccessToken();
    }
    updateUiWithUserData();
    setupUser();
});


