// Profile functions
let CURRENT_PROFILE_TAB = 'home';

function toTab(toTabName){
    let currentTab = document.getElementById(CURRENT_PROFILE_TAB);
    currentTab.style.display = 'none';
    colorAnchor(CURRENT_PROFILE_TAB + 'Anchor', 'blue');
    CURRENT_PROFILE_TAB = toTabName;

    let newTabElement = document.getElementById(toTabName);
    newTabElement.style.display = 'block';   
}

function colorAnchor(anchorID, color){
    let currentAnchor = document.getElementById(anchorID);
    currentAnchor.style.color = color;
}

// preventDefault to prevent the anchor element to refresh the page
function toHome(event){
    toTab('home');
    colorAnchor('homeAnchor', 'purple');
    putDotsBetweenLabelInputPair();
    event.preventDefault();
}
function toBrowse(event){
    toTab('browse');
    colorAnchor('browseAnchor', 'purple');
    putDotsBetweenLabelInputPair();
    event.preventDefault();
}
function toAccount(event){
    toTab('account');
    colorAnchor('accountAnchor', 'purple');
    putDotsBetweenLabelInputPair();
    event.preventDefault();
}
function validatePasswordChange(event){
    let oldPassword = document.getElementById('password-old').value;
    let newPassword = document.getElementById('password-new').value;
    let newPasswordAgain = document.getElementById('password-new-again').value;

    let modalBody = [];
    let modalTitle = 'Error chaning password';

    if (newPassword !== newPasswordAgain){
        modalBody = ['New passwords doesn\'t match!'];
        showModal('profile-section', modalBody, modalTitle);
        event.preventDefault()
        return; 
    }

    console.log(oldPassword);
    console.log(newPassword);
    console.log(newPasswordAgain);
    event.preventDefault()
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


// Date might need to change 
function setCookie(token){
    let currentDate = new Date();
    document.cookie = 'logged_in_user=' + token + '; expires=' + currentDate.toString + '; path=/';
}

function deleteCookie(){
    document.cookie = 'logged_in_user=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'; 
}

// Returns empty string if cookieName didn't match any saved cookie
function getCookie(cookieName){
    let cookies = document.cookie.split(';');
    let data = '';
    
    for (let i = 0; i < cookies.length; i++){
        if (cookies[i].includes(cookieName)){
            let equalSign = cookies[i].indexOf('=');
            data = cookies[i].substring(equalSign + 1);
            break;
        }
    }
    return data;
}

function saveUser(data){
    window.localStorage.setItem('active_user', JSON.stringify(data));
}

function deleteActiveUser(){
    window.localStorage.removeItem('active_user');
}

function getActiveUser(){
    let token = getCookie('logged_in_user');
    let userData = serverstub.getUserDataByToken(token);
    return userData;
}

function putDotsBetweenLabelInputPair(){
    let wrapperDivs = document.getElementsByClassName("label-input-pair");
    
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

function hideOtherView(viewName){
    let otherView = document.getElementById(viewName);
    otherView.style.display = 'none';
}

let displayNotLoggedin = function() {
    hideOtherView('profile-section');

    let container = document.getElementById("welcome-view-container");
    let welcomeSection = document.getElementById("welcome-section");
    welcomeSection.style.display = 'block';

    welcomeSection.innerHTML = container.innerHTML;
    putDotsBetweenLabelInputPair();
}

let displayLoggedin = function() {
    hideOtherView('welcome-section');

    let container = document.getElementById('profile-view-container');
    let profileSection = document.getElementById('profile-section');
    let profileTabs = document.getElementById('profile-tabs');
    
    profileTabs.style.display = 'block';
    profileTabs.children[0].style.color = 'purple';

    profileSection.style.display = 'block';
    profileSection.innerHTML = container.innerHTML;
    putDotsBetweenLabelInputPair();
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

    setCookie(response.data);
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
    console.log(response);

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
    // deleteCookie();
    // deleteActiveUser();
    displayView();
    checkSignUpStatus();
}