const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

const getCookie = (name) => {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name + '=') === 0) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

const runAnimation = (circle, uploadPercentage) => {
    const startOffset = 450; // Starting offset
    const endOffset = 205; // Ending offset
    const totalChange = startOffset - endOffset; // Total change in offset

    const offset = startOffset - (uploadPercentage / 100) * totalChange;
    circle.style.strokeDashoffset = offset;

    if (uploadPercentage >= 100) {
        showAllDonePage();
    }
};

const showAllDonePage = async () => {
    const allDonePage = await loadPageContent(`./pages/all-done`);

    mainContentArea.innerHTML = '';
    mainContentArea.innerHTML = allDonePage;


    const allDone = document.querySelector('.all-done');
    const filesUploadedMsgBar = allDone.querySelector('.all-files-uploaded-msg');
    interactionInAllDonePage();
}

const interactionInAllDonePage = () => {
    const allDone = document.querySelector('.all-done');
    const linkCopyBtns = allDone.querySelectorAll('.link-copy-box span');

    linkCopyBtns.forEach((btn) => btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.previousElementSibling.innerText).catch((err) => {
            if (err) {
                console.log(err);
            }
        })
    }))
}


const handleDragAndDrop = (dragArea, fileInp) => {
    const dragAreaContent = dragArea.querySelector('.content');

    dragArea.addEventListener('click', (e) => {
        const target = e.target;
        if (target.className !== 'validate-and-upload' && target.className != 'close-selected-files') {
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

        if (droppedFiles.length > 0) {
            sendFilesToServer(droppedFiles, dragAreaContent);
        } else console.log('No file chosen');
        dragArea.classList.remove('dragging-over');
    });

    fileInp.addEventListener('change', () => {
        const files = fileInp.files;
        sendFilesToServer(files, dragAreaContent);
    });
}

const sendFilesToServer = (fileList, contentArea) => {
    const selectUploadBox = contentArea.closest('.select-upload-box');
    const boxTitle = selectUploadBox.querySelector('.area-title');
    const uploadBoxInner = selectUploadBox.querySelector('.upload-box-inner');

    const uploadProgressContainer = document.querySelector('.upload-in-progress-box');
    const sendingFiles = uploadProgressContainer.querySelector('.sending-files');
    const uploadedFiles = uploadProgressContainer.querySelector('.uploaded-files');
    const uploadSpeed = uploadProgressContainer.querySelector('.upload-speed span');
    const estimatedTime = uploadProgressContainer.querySelector('.estimated-time span');
    const progressSvg = uploadProgressContainer.querySelector('svg circle');
    const progressPercentage = document.getElementById('progress-circle-number');


    const contentAreaTitle = contentArea.querySelector('p');
    const dragDropArea = contentArea.closest('.drag-and-drop-area');
    const selectedFilesClose = dragDropArea.querySelector('.close-selected-files');
    const addFilesBtn = contentArea.querySelector('button');
    const addMoreOrSendContainer = document.createElement('div');
    const filesOrFile = fileList.length == 1 ? 'file' : 'files';
    const addFilesCopy = addFilesBtn.cloneNode(true);


    addMoreOrSendContainer.innerHTML = `<button class="add-more-files">Add more files</button>
    <button class="validate-and-upload" type="button">Validate and upload</button>`;

    addFilesBtn.remove();
    boxTitle.innerHTML = 'Confirm to start the upload';
    addMoreOrSendContainer.className = 'add-more-or-send';
    uploadBoxInner.style.height = "max-content";
    contentArea.append(addMoreOrSendContainer);
    dragDropArea.classList.add('active');
    contentAreaTitle.innerHTML = fileList.length + ` selected ${filesOrFile} ready to send`;

    // validate and upload to server
    const validateAndUploadBtn = contentArea.querySelector('.validate-and-upload');
    validateAndUploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        selectUploadBox.classList.add('hide');
        selectUploadBox.style.height = '200px'
        uploadProgressContainer.classList.add('active');

        try {
            sendingFiles.innerHTML = `Sending ${fileList.length} ${filesOrFile} in progress, 729kb in total`;
            uploadedFiles.innerHTML = `0/${fileList.length}`;
        } catch (err) {
            console.log(err)
        }

        formData.append('uid', UID);

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            formData.append('files', file);
        }


        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
        xhr.open('POST', serverUrl + 'api/v1/upload', true);
        xhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                const percentageNum = Math.round(percentComplete);
                progressPercentage.innerHTML = percentageNum + '%';
                runAnimation(progressSvg, percentageNum);
            }
        });

        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log(data); // Log the response data
            } else {
                console.log('Upload failed:', xhr.statusText);
            }
        };

        xhr.onerror = function () {
            console.log('Request failed');
        };
        xhr.send(formData);
    });

    selectedFilesClose.addEventListener('click', () => {
        boxTitle.innerHTML = 'Select your files to upload';
        contentAreaTitle.innerHTML = "Drag and drop your files here or click to";
        uploadBoxInner.style = "";
        dragDropArea.classList.remove('active');
        addMoreOrSendContainer.remove();
        contentArea.append(addFilesCopy);
        fileList = ''
    })
}

const profileUiInteractions = (UI) => {
    const profileViewUserName = UI.querySelector('.username');
    const upgradeWithPatreon = document.querySelector('.page-ui-extra .upgrade-with-patreon');
    const userData = getFromLocal('user-data');

    if(userData.username){
        profileViewUserName.innerHTML = userData.username;
    }else{
        profileViewUserName.innerHTML = 'anonym' + UID;
    }

    upgradeWithPatreon.addEventListener('click', () => {
        alert("You'll need to Login with Patreon first to subscribe with Patreon")
    });
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


const handleLoginWithPatreonBtn = (btn) => {
    btn.addEventListener('click', () => {
        console.log('login with patreon btn clicked');
    })
}