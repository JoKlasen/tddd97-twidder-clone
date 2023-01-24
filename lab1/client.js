// Profile functions
let CURRENT_PROFILE_TAB = 'home';

function loadPersonalInfo(userEmail = null){

    let info = '';
    if (userEmail === null){

        info = JSON.parse( window.localStorage.getItem('active_user') );
    }
    else{
        let token = getToken();
        let userData = serverstub.getUserDataByEmail(token, userEmail);
        if (!userData.success){
            let modalBody = [userData.message];
            let modalTitle = 'User doesn\'t exist :(';
            showModal('profile-section', modalBody, modalTitle);
            return;
        }
        else{
            window.localStorage.setItem('currently_viewed_profile', userEmail);
        }
        info = userData.data;
    }

    let personalInfoContainer = document.getElementById(CURRENT_PROFILE_TAB + '-user-info');
    let parasContainer = personalInfoContainer.children;

    let i = 0;
    let j = 0;
    for (let key in info){
        let current_paras = parasContainer[j].children;

        current_paras[0].innerText = key;
        current_paras[0].style = "font-weight: bold;";
        current_paras[1].innerText = info[key];
        
        j++;
    }
    putDotsBetweenElements("label-info-pair");    
}

function clearChildren(parent){
    while (parent.firstChild){
        parent.removeChild(parent.firstChild);
    }   
}

function loadMessagesFromBrowse(){
    let email = window.localStorage.getItem('currently_viewed_profile');
    if (email !== null){
        loadMessages(email);
    }
}

function loadMessages(email = null){
    let token = getToken();
    let userMessages = '';
    if (email === null){
        userMessages = serverstub.getUserMessagesByToken(token);
    }
    else{
        userMessages = serverstub.getUserMessagesByEmail(token, email);
    }
    let messageData = userMessages.data;
    let templateMessageBox = document.getElementById("template-message-box");
    let messageContainer = document.getElementById(CURRENT_PROFILE_TAB + '-posted-messages');

    clearChildren(messageContainer);
    
    for(let key in messageData){
        let currentMessageBox = templateMessageBox.cloneNode(true);
        currentMessageBox.setAttribute("id", "message-box-"+key);

        let paras = currentMessageBox.children;
        paras[0].innerHTML = messageData[key].writer;
        paras[1].innerHTML = messageData[key].content;

        currentMessageBox.classList.remove("hide");
        messageContainer.appendChild(currentMessageBox);
    }
}

function sendMessage(formElement, event){    
    let token = getCookie();
    let contentBox = formElement[CURRENT_PROFILE_TAB + "-send-message-text"];
    let toEmail = null;
    toEmail = window.localStorage.getItem('currently_viewed_profile');

    if (toEmail == null){
        toEmail = JSON.parse(window.localStorage.getItem("active_user")).email;
    }

    serverstub.postMessage(token, contentBox.value, toEmail);
    contentBox.value = '';
    loadMessages(toEmail);
    event.preventDefault();
}

function searchAndDisplayUser(event){
    let userEmail = document.getElementById('search-user-email').value;
    loadPersonalInfo(userEmail);
    loadMessages(userEmail);
    event.preventDefault();
}

function toTab(toTabName){
    let currentTab = document.getElementById(CURRENT_PROFILE_TAB);
    currentTab.style.display = 'none';
    colorAnchor(CURRENT_PROFILE_TAB + 'Anchor', 'blue');
    CURRENT_PROFILE_TAB = toTabName;

    let newTabElement = document.getElementById(toTabName);
    newTabElement.style.display = 'flex';   
}

function colorAnchor(anchorID, color){
    let currentAnchor = document.getElementById(anchorID);
    currentAnchor.style.color = color;
}

function signOut(event){
    colorAnchor(CURRENT_PROFILE_TAB + 'Anchor', 'blue');
    CURRENT_PROFILE_TAB = 'home';

    let response = serverstub.signOut(getToken());
    
    if (!response.success){
        let modalBody = [response.message];
        let modalTitle = 'Sign out status'; 
        showModal('profile-section', modalBody, modalTitle);
        return;
    }
    deleteToken();
    deleteUser('active_user');
    deleteUser('currently_viewed_profile');
    displayNotLoggedin();
}

// preventDefault to prevent the anchor element to refresh the page
function toHome(event){
    toTab('home');
    colorAnchor('homeAnchor', 'purple');
    putDotsBetweenElements("label-input-pair");
    loadPersonalInfo();
    event.preventDefault();
}
function toBrowse(event){
    toTab('browse');
    colorAnchor('browseAnchor', 'purple');
    putDotsBetweenElements("label-input-pair");
    event.preventDefault();
}
function toAccount(event){
    toTab('account');
    colorAnchor('accountAnchor', 'purple');
    putDotsBetweenElements("label-input-pair");
    event.preventDefault();
}
function validatePasswordChange(event){
    let oldPasswordElement = document.getElementById('password-old');
    let newPasswordElement = document.getElementById('password-new');
    let newPasswordAgainElement = document.getElementById('password-new-again');

    let modalBody = [];
    let modalTitle = '';

    if (newPasswordElement.value !== newPasswordAgainElement.value){
        modalTitle = 'Error changing password';
        modalBody = ['New passwords doesn\'t match!'];
        showModal('profile-section', modalBody, modalTitle);
        event.preventDefault()
        return; 
    }

    let response = serverstub.changePassword(getToken(), oldPasswordElement.value, newPasswordElement.value);
    modalBody = [response.message];
    modalTitle = 'Password change status: ';
    
    if (response.success){
        modalTitle += 'success';
    }else{
        modalTitle += 'fail';
    }
    showModal('profile-section', modalBody, modalTitle);
    
    oldPasswordElement.value = '';
    newPasswordElement.value = '';
    newPasswordAgainElement.value = '';

    event.preventDefault();
}

// /Profile function

function showModal(section, modalBody, modalTitle){
    
    let modal = document.getElementById("error-modal");
    let currentSection = document.getElementById(section);
    
    
    let currentModalBody = document.getElementById("modal-body");
    let currentModalTitle = document.getElementById("modal-title");
    currentModalBody.innerHTML = '';
    currentModalTitle.innerHTML = '';
    
    modalBody.forEach(element => {
        currentModalBody.innerHTML += element + "<br>";
    });
    currentModalTitle.innerHTML += modalTitle;
    
    currentSection.style.pointerEvents = "none";
    modal.style.transform = "translate(-50%, -50%) scale(1.0)";

    document.getElementById('modal-close-button').addEventListener('click', function(){
        let modal = document.getElementById("error-modal");
        let currentSection = document.getElementById(section);
        currentSection.style.pointerEvents = "auto";
        modal.style.transform = "translate(-50%, -50%) scale(0)";        
    });
}

function setToken(token){
    window.localStorage.setItem('logged_in_user', token);
}

function deleteToken(){
    window.localStorage.removeItem('logged_in_user');
}

function getToken(){
    return window.localStorage.getItem('logged_in_user');
}

function saveUser(data){
    window.localStorage.setItem('active_user', JSON.stringify(data));
}

function deleteUser(user){
    window.localStorage.removeItem(user);
}

function getActiveUser(){
    let token = getToken();
    let userData = serverstub.getUserDataByToken(token);
    return userData;
}
function putDotsBetweenElements(elementName){
    let wrapperDivs = document.getElementsByClassName(elementName);
    
    for (let i = 0; i < wrapperDivs.length; i++){
        let children = wrapperDivs[i].children;
        let labelField = children[0];
        let inputField = children[1];

        let pixelsBetween = wrapperDivs[i].offsetWidth - (labelField.offsetWidth + inputField.offsetWidth); 
        let pixelsPerChar = labelField.offsetWidth / labelField.innerHTML.length;
        let dotsBetween = Math.floor(pixelsBetween / pixelsPerChar);

        labelField.innerHTML += '.'.repeat(dotsBetween);
    }
}

function hideOtherViews(viewNames){
    
    for(let i = 0; i < viewNames.length; i++){
        document.getElementById(viewNames[i]).style.display = 'none';
    }
}

let displayNotLoggedin = function() {
    let otherViews = ['profile-section'];
    hideOtherViews(otherViews);

    let container = document.getElementById("welcome-view-container");
    let welcomeSection = document.getElementById("welcome-section");
    welcomeSection.style.display = 'block';

    welcomeSection.innerHTML = container.innerHTML;
    putDotsBetweenElements("label-input-pair");
}

let displayLoggedin = function() {
    hideOtherViews(['welcome-section']);

    let container = document.getElementById('profile-view-container');
    let profileSection = document.getElementById('profile-section');
    profileSection.innerHTML = '';

    let profileTabsTemplate = document.getElementById('profile-tabs-header-template');

    let profileTabs = profileTabsTemplate.cloneNode(true);
    
    profileTabs.setAttribute('id', 'profile-tabs')
    profileTabs.children[0].setAttribute('id', 'homeAnchor');
    profileTabs.children[1].setAttribute('id', 'browseAnchor');
    profileTabs.children[2].setAttribute('id', 'accountAnchor');


    profileTabs.style.display = 'block';
    profileTabs.children[0].style.color = 'purple';

    profileSection.style.display = 'block';
    profileSection.appendChild(profileTabs);
    profileSection.innerHTML += container.innerHTML;

    putDotsBetweenElements("label-input-pair");
    loadPersonalInfo();
    loadMessages();
}

function validateSignIn(event){

    let emailInput = document.getElementById("email");
    let passwordInput = document.getElementById("password");

    let response = serverstub.signIn(emailInput.value, passwordInput.value); 

    if (!response.success){
        let modalTitle = 'Sign in status: fail';
        let modalBody = [response.message];
        showModal('welcome-section', modalBody, modalTitle);        
        event.preventDefault();
        return false;
    }

    setToken(response.data);
    displayView();

    // No refresh of the webpage. Profile view loaded manually.
    event.preventDefault();
}

function validateSignUp(event){
    let genderSelect = document.getElementById("gender-input");
    let password = document.getElementById("password-new");
    let passwordRepeat = document.getElementById("password-repeat");
    
    let modalTitle = "Some info is missing";
    if (genderSelect.value == "NO_CHOICE"){
        let modalBody = [
                            "You have to pick a gender.",
                        ]
        showModal("welcome-section", modalBody, modalTitle);
        event.preventDefault();
        return false;
    }
    
    if (password.value != passwordRepeat.value){
        let modalBody = [
                            "The passwords are not equal to each other.",
                        ]
        showModal("welcome-section", modalBody, modalTitle);
        event.preventDefault();
        return false;
    }

    let formData =  {
                        email : document.getElementById("email-new").value,
                        password : document.getElementById("password-new").value,
                        firstname : document.getElementById("first-name").value,
                        familyname : document.getElementById("last-name").value,
                        gender : document.getElementById("gender-input").value,
                        city :  document.getElementById("city").value,
                        country: document.getElementById("country").value,
                    }
    
    let response = serverstub.signUp(formData);
    if (response.success){
        window.localStorage.setItem('sign-up-status', 'success');
    } else{
        window.localStorage.setItem('sign-up-status', 'fail');
    }
    
    window.localStorage.setItem('sign-up-message', response.message);

    return true;
}

function checkSignUpStatus(){
    
    if (window.localStorage.getItem('sign-up-status') === null)
    {
        // No sign up was done previous this refresh
        return;
    }
    
    let modalTitle = 'Sign up status: ' + window.localStorage.getItem('sign-up-status');
    let modalBody = [
        window.localStorage.getItem('sign-up-message')
    ]
    
    showModal(  'welcome-section',  
                modalBody,
                modalTitle
                )
                
    window.localStorage.removeItem('sign-up-status');
    window.localStorage.removeItem('sign-up-message'); 
}

function displayView(){
    let userData = getActiveUser();
    let loggedIn = userData.success; 
    
    if (loggedIn){
        saveUser(userData.data);
        displayLoggedin();
    } else{
        displayNotLoggedin();
    }
}

window.onload = function(){
    console.log("page has been loaded");
    displayView();
    checkSignUpStatus();
}