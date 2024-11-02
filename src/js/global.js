const htmlElm = document.documentElement;
const pageLoader = htmlElm.querySelector('.page-loading');

const changeTheme = document.querySelector('.change-theme');

const leftMenu = document.querySelector('.left-menu-bar');
const expandableUserMenu = leftMenu.querySelector('.expandable-user-menu');
const menuList = leftMenu.querySelectorAll('.menu-container li');
const innerMenu = expandableUserMenu.querySelector('.inner-menu');
const handleLeftMenu = document.querySelector('.handle-left-menu');
const userBtn = leftMenu.querySelector('.user-btn');
const themeIcon = changeTheme.querySelector('img');

const mainContentArea = document.querySelector('.main-content-area .scroll');
const welcomeBox = document.querySelector('.welcome-box');
const wlcmBoxInner = welcomeBox.querySelector('.box-inner');
const reduceBtn = welcomeBox.querySelector('.reduce');

const boxBoundingRect = wlcmBoxInner.getBoundingClientRect();

const serverUrl = 'localhost:4050/api/v1/upload';

// all functions and event listeners

document.onreadystatechange = function(){
    if(document.readyState == 'complete'){
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

const loadPageContent = async (pageName, pageSrc) => {
    try {
        const response = await fetch(`${pageSrc}.html`);

        if (!response.ok) throw new Error("Page not found");

        const content = await response.text();
        window.history.pushState({ pageName }, '', `?pg=${pageName}`);
        return content;
    } catch (error) {
        console.error("Error loading page:", error);
        document.getElementById('content').innerHTML = "Page not found.";
    }
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
        htmlElm.dataset.theme = theme
    }
    wlcmBoxInner.style.height = boxBoundingRect.height + 'px';
});

menuList.forEach((menu) => menu.addEventListener('click', () => {
    const currentUrl = new URL(window.location.href);
    const oldActiveMenu = leftMenu.querySelector('.menu-container li.active');
    const urlStateTxt = menu.innerText.toLowerCase().replaceAll(' ', '-').trim();

    currentUrl.searchParams.set('pg', urlStateTxt);
    window.history.pushState({}, '', currentUrl);
    oldActiveMenu.classList.remove('active');
    menu.classList.add('active');
    updateUIonMenuClick();
}));

const updateUIonMenuClick = async () => {
    const page = getCurrentPage();
    const oldActiveMenu = leftMenu.querySelector('li.active');
    const currentPageMenu = leftMenu.querySelector(`[data-page=${page}]`);
    const pageSrc = `./pages/${page}`;
    let pageContent = '';

    oldActiveMenu.classList.remove('active');
    currentPageMenu.classList.add('active');
    pageContent = await loadPageContent(page, pageSrc);

    mainContentArea.innerHTML = '';
    mainContentArea.innerHTML = pageContent;

    checkAndUpdateChangedUIeventListeners();
}

const checkAndUpdateChangedUIeventListeners = () => {
    const fileDragArea = document.querySelector('.drag-and-drop-area');
    const fileUploadInp = document.getElementById('file-upload-inp');
    const createAccSignInPage = document.querySelector('.create-account-sign-in-pg');
    const faqList = document.querySelectorAll('.faq-page .faq-list .faq-box');

    if(fileDragArea) handleDragAndDrop(fileDragArea, fileUploadInp);
    
    if(createAccSignInPage) {
        createAccSignInPage.addEventListener('click', () => {
            leftMenu.querySelector(`[data-page='create-account']`).click();
        })
    }

    if(faqList) handleFaqList(faqList);
}

const handleDragAndDrop = (dragArea, fileInp) => {
    const dragAreaContent = dragArea.querySelector('.content');

    dragArea.addEventListener('click', (e) => {
        const target = e.target;
        if(target.className !== 'validate-and-upload'){
            fileInp.click()
        }
    })

    dragArea.addEventListener('dragover', (e) => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        dragArea.classList.add('dragging-over');
    });

    dragArea.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        e.preventDefault();
        dragArea.classList.remove('dragging-over');
    });
    
    dragArea.addEventListener('drop', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const droppedFiles = e.dataTransfer.files;

        if(droppedFiles.length > 0){
            sendFilesToServer(droppedFiles, dragAreaContent);
        }else console.log('No file chosen');
        dragArea.classList.remove('dragging-over');
    });

    fileInp.addEventListener('change', () => {
        const files = fileInp.files;
        sendFilesToServer(files, dragAreaContent);
    });
}

const sendFilesToServer = (fileList, contentArea) => {
    const contentAreaTitle = contentArea.querySelector('p');
    const addFilesBtn = contentArea.querySelector('button');
    const addMoreOrSendContainer = document.createElement('div');
    const filesOrFile = fileList.length == 1 ? 'file' : 'files';

    addMoreOrSendContainer.innerHTML = `<button class="add-more-files">Add more files</button>
                                        <button class="validate-and-upload">Validate and upload</button>`;

    addFilesBtn.remove();
    addMoreOrSendContainer.className = 'add-more-or-send';
    contentArea.append(addMoreOrSendContainer);
    contentAreaTitle.innerHTML = fileList.length + ` selected ${filesOrFile} ready to send`;

    // validate and upload to server
    const validateAndUploadBtn = contentArea.querySelector('.validate-and-upload');
    validateAndUploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const formData = new FormData();

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];

            formData.append('files', file);
            fetch(serverUrl, {
                method: 'post',
                body: formData
            }).then((res) => res.json()).then((data) => {
                console.log(data)
            }).catch((err) => {
                console.log(err);
            });
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
            if(faq.classList.contains('expanded')){
                faq.style.height = faqBoxBoudingRect.height + 'px';
            }else{
                faq.style.height = expandHeight + 1 + 'px';
            }
        });
    })
}

updateUIonMenuClick();