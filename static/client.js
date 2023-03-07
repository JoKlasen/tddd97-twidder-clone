// console.table                   <-- skriv ut arrayer och object
// console.dir                     <-- skriv ut html element objektet
// console.time / console.timeEnd
// console.error                   <-- ?


// Testa hur async/await/promise funkar
// async function testAsync(){
//     return new Promise(function(resolve, reject){
//         let a = 1 + 1
//         if (a === 3){
//             resolve("User data!")
//         } else {
//             reject("fail :(")
//         }
//     })
// }

// async function wrapper(){
//     try{
//         let e = await testAsync();
//         console.log(e)    
//     } catch(err){
//         console.log(err)
//     }
// }



// "arrow function", "(param1,param2)", "=>" inget särskilt, "{kod i funktionen}""
// request.onreadystatechange = () => {
//     getMessagesReadyState(request, resolve, reject);
// }

// Detta är strikt taget inte samma sak. Skillnad ligger i "this" <-- Läs på?
// request.onreadystatechange = function() {
//     getMessagesReadyState(request, resolve, reject);
// }

// Det nedan fungerar inte eftersom det är ett anrop till "getMessagesReadyState",
// varför det måste wrappas i en funktiondeklaration.^ 
//
// request.onreadystatechange = getMessagesReadyState(request, resolve, reject);
//


// ---------------- SERVER INTERFACE ---------------- 

function initiateXHR(method, url) {
    try {
        request = new XMLHttpRequest();
        request.open(method, url, true);
        return request;
    } catch (e) {
        console.log("initiate XHR error: ")
        console.log(e)
    }
}

async function getActiveUser(){
    return new Promise( function(resolve, reject){
        
            let token = getToken();
            let userData = {};
            let request = initiateXHR("GET", "/get_user_data_by_token");
            request.setRequestHeader("Authorization", token);
            request.send();
        
            request.onreadystatechange =  function(){
                if (request.readyState == 4){
        
                    if (request.status == 200){
                        userData = JSON.parse( request.responseText ); 
                        userData['success'] = true;
                        resolve(userData)
                    }else {
                        userData['status'] = request.status;
                        userData['message'] = JSON.parse( request.responseText ); 
                        userData['success'] = false;
                        reject(userData)
                    }
                }
            }
    } );
}


function getMessagesReadyState(request, resolve, reject){
    if (request.readyState !== 4){
        return
    }

    if (request.status == 200){
        let body = JSON.parse( request.responseText )
        resolve(body)
        
    } else {
        let error = {};
        error['status'] = request.status
        error['message'] = request.responseText
        reject(error)
    }
}

async function getUserMessagesByEmail(token, email){
    return new Promise( (resolve, reject) => {
        let request = initiateXHR('GET', '/get_user_messages_by_email/' + email)
        request.setRequestHeader('Authorization', token)
        request.send()

        request.onreadystatechange = () => {
            getMessagesReadyState(request, resolve, reject );
        }
    });
}

async function getUserMessagesByToken(token){
    return new Promise(function(resolve, reject){
        let request = initiateXHR("GET", '/get_user_messages_by_token')
        request.setRequestHeader('Authorization', token)
        request.send()

        request.onreadystatechange = () => {
            getMessagesReadyState(request, resolve, reject)
        }
    });
}

async function getUserDataByEmail(email, token){
    return new Promise(function(resolve, reject){
        let request = initiateXHR('GET', '/get_user_data_by_email/' + email)
        request.setRequestHeader("Authorization", token)
        request.send()

        request.onreadystatechange =  function(){
            if (request.readyState == 4){
                let body = {}
                if (request.status == 200){
                    body = JSON.parse( request.responseText )
                    window.localStorage.setItem('currently_viewed_profile', email)
                    resolve(body)

                }else{
                    body['message'] = request.responseText
                    body['status']  = request.status
                    reject(body)
                }
            }
        }
    });
}

function postMessageReadyState(request, resolve, reject){
    if (request.readyState !== 4){
        return
    }

    if (request.status == 201){
        resolve("message posted")
    } else {
        let err = {}
        err['status'] = request.status
        err['message'] = request.responseText
        reject(err)
    }   
}

async function postMessage(token, message, toEmail){
    return new Promise( (resolve, reject) => {        
        let request = initiateXHR("POST", "/post_message")
        let body = {
            email     : toEmail,
            message   : message
        }
        request.setRequestHeader('Authorization', token)
        request.setRequestHeader("Content-type", "application/json;charset=UTF-8");

        request.send( JSON.stringify(body) )

        request.onreadystatechange = () => {
            postMessageReadyState(request, resolve, reject)
        }
    });
}

function signOutFromServerReadyState(request, resolve, reject){
    if (request.readyState !== 4){
        return
    }

    if (request.status === 200){
        resolve('Logged out')
    } else {
        let err = {}
        err['message'] = request.responseText 
        err['status'] = request.status 
        reject(err)
    }
}

async function signOutFromServer(token){
    return new Promise( (resolve, reject) => {
        let request = initiateXHR('DELETE', '/sign_out')
        request.setRequestHeader('Authorization', token)
        request.send()

        request.onreadystatechange = () => {
            signOutFromServerReadyState(request, resolve, reject)
        }

    })
}

function changePasswordReadyState(request, resolve, reject){
    if (request.readyState !== 4){
        return
    }

    if (request.status == 200){
        resolve("password change success")
    } else {
        let err = {}
        err['message'] = request.responseText
        err['status'] = request.status
        reject(err)
    }
} 

async function changePassword(token, oldPassword, newPassword){
    return new Promise( (resolve, reject)=>{
        let request = initiateXHR('PUT', '/change_password')
        request.setRequestHeader('Authorization', token)
        request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
        
        let body = {
            'oldPassword' : oldPassword,
            'newPassword' : newPassword,
        }

        request.send(JSON.stringify(body))

        request.onreadystatechange = () => {
            changePasswordReadyState(request, resolve, reject)
        }
    })
}

// ---------------- /SERVER INTERFACE ---------------- 


// ---------------- Profile functions ----------------
let CURRENT_PROFILE_TAB = 'home';


async function loadPersonalInfo(userEmail = null){

    let info = {}    
    if (userEmail === null){
        info = JSON.parse( window.localStorage.getItem('active_user') )
    } else {
        let token = getToken()
        try{
            info = await getUserDataByEmail(userEmail, token)
        } catch(err){
            let modalBody = [err.message];
            let modalTitle = 'Could not find user! Errorcode: ' + err.status;
            showModal('profile-section', [modalBody], modalTitle);
            return false
        }
    }

    let personalInfoContainer = document.getElementById(CURRENT_PROFILE_TAB + '-user-info');
    let parasContainer = personalInfoContainer.children;

    let i = 0;
    let j = 0;
    for (let key in info){
        let current_paras = parasContainer[j].children;

        current_paras[0].innerText = key;
        current_paras[1].innerText = info[key];
        
        j++;
    }
    putDotsBetweenElements("label-info-pair");
    return true    
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

async function loadMessages(email = null){
    let token = getToken();
    let userMessages = '';
    try{
        if (email === null){
            userMessages = await getUserMessagesByToken(token);
        }
        else{
            userMessages = await getUserMessagesByEmail(token, email);
        }
    } catch(err){
        console.error("Working as intended?: " + err)
        let modalTitle = 'Could not load messages! Errorcode: ' + err['status']
        let modalBody = [err['message']]
        showModal('profile-section', modalBody, modalTitle)
        return
    }

    let templateMessageBox = document.getElementById("template-message-box");
    let messageContainer = document.getElementById(CURRENT_PROFILE_TAB + '-posted-messages');

    clearChildren(messageContainer);
    
    for (let i = 0; i < userMessages.length; ++i){
        let currentMessageBox = templateMessageBox.cloneNode(true);
        currentMessageBox.setAttribute("id", "message-box-" + i);
        
        let paras = currentMessageBox.children;
        paras[0].innerHTML = userMessages[i].fromEmail;
        paras[1].innerHTML = userMessages[i].content;
        
        currentMessageBox.classList.remove("hide");
        messageContainer.appendChild(currentMessageBox);

    }   
}

async function sendMessageFromBrowse(formElement, event){
    let toEmail = window.localStorage.getItem('currently_viewed_profile');
    sendMessage(formElement, event, toEmail)
}

async function sendMessageFromHome(formElement, event){
    let toEmail = JSON.parse(window.localStorage.getItem("active_user")).email
    sendMessage(formElement, event, toEmail)
}

async function sendMessage(formElement, event, toEmail){    
    event.preventDefault() // viktigt med "prevenDefault" innan allting för firefox för annars funkar inte att skicka request
    let token = getToken();
    let contentBox = formElement[CURRENT_PROFILE_TAB + "-send-message-text"];

    
    if (toEmail == null && CURRENT_PROFILE_TAB == 'browse'){
        let modalBody = ['You have not chosen any user to browse yet.'];
        let modalTitle = 'Error: couldn\'t send message';
        showModal('profile-section', modalBody, modalTitle);
        return;
    }

    try{
        let response = await postMessage(token, contentBox.value, toEmail);
    } catch(err){
        let modalTitle = "Could not send message! Errorcode: " + err['status']
        let modalBody = [err['message']]
        showModal('profile-section', modalBody, modalTitle)
        return false
    }

    contentBox.value = '';
    loadMessages(toEmail);
}

async function searchAndDisplayUser(event){
    event.preventDefault();
    let userEmail = document.getElementById('search-user-email').value;

    if ( await loadPersonalInfo(userEmail) ){
        loadMessages(userEmail)
    }
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
    currentAnchor.style.color = color;          // toggleClass istället
}

async function signOutHard(event){
    try{
        let response = await signOutFromServer(getToken()) 
    } catch(err){
        let modalBody = [err['message']];
        let modalTitle = 'Error: ' + err['status']; 
        showModal('profile-section', modalBody, modalTitle);
        return
    }
    signOut(event)
}

async function signOutSoft(event){
    signOut(event)
}

async function signOut(event){
    colorAnchor(CURRENT_PROFILE_TAB + 'Anchor', 'blue');
    CURRENT_PROFILE_TAB = 'home';

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
async function validatePasswordChange(event){
    event.preventDefault()
    let oldPasswordElement = document.getElementById('password-old');
    let newPasswordElement = document.getElementById('password-new');
    let newPasswordAgainElement = document.getElementById('password-new-again');

    let modalBody = [];
    let modalTitle = '';
    if (newPasswordElement.value !== newPasswordAgainElement.value){
        modalTitle = 'Error changing password';
        modalBody = ['New passwords doesn\'t match!'];
        showModal('profile-section', modalBody, modalTitle);
        return; 
    }

    try{
        let response = await changePassword(getToken(), oldPasswordElement.value, newPasswordElement.value)
        modalTitle = 'Password change success!';
        modalBody = [response];
    } catch(err){
        console.log("password change error: ")
        console.log(err)
        modalTitle = 'Password change failed! Errorcode: ' + err['status'];
        modalBody = [err['message']];
    }

    showModal('profile-section', modalBody, modalTitle);
    
    oldPasswordElement.value = '';
    newPasswordElement.value = '';
    newPasswordAgainElement.value = '';
}

// ---------------- /Profile functions ----------------


// ---------------- Welcome functions ----------------
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

let displayLoggedin = async function() {
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

// använder inte promises ännu, fixa?
async function validateSignIn(event){
    event.preventDefault();
    let emailInput      = document.getElementById("email");
    let passwordInput   = document.getElementById("password");
    
    if (passwordInput.length > 100){
        let modalTitle = 'Sign in status: fail';
        let modalBody = [''];
        showModal('welcome-section', modalBody, modalTitle);        
        event.preventDefault();
        return false;
    }
    
    let body =   {     
        email : emailInput.value, 
        password : passwordInput.value
    } 
    
    let request = initiateXHR("POST", "/sign_in");
    request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(body));
    
    request.onreadystatechange =  function(){
        if (request.readyState == 4){
            
            if (request.status == 200){
                let token = JSON.parse(request.responseText);
                setToken(token['token']);
                displayViewFromSignIn();
            }else {
                let modalTitle = 'Sign in status: fail';
                let modalBody = [request.responseText];
                showModal('welcome-section', modalBody, modalTitle);        
                event.preventDefault();
                return false;

            }
        }
    }
    
    // let response = serverstub.signIn(emailInput.value, passwordInput.value); 
    
    // No refresh of the webpage. Profile view loaded manually.
}

function validateSignUp(formElement, event){
    
    let genderSelect = formElement["gender-input"];
    let password = formElement["password-new-signup"];
    let passwordRepeat = formElement["password-repeat"];
    
    let modalTitle = "Some info is missing";
    if (genderSelect.value == "NO_CHOICE"){
        let modalBody = [
                            "You have to pick a gender.",
                        ]
        showModal("welcome-section", modalBody, modalTitle);
        event.preventDefault();
        return false;
    }

    if (password.value.length > 100){
        let modalBody = [
            "Password too long.",
        ]
        modalTitle = "Sign up failed"
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
                        password : document.getElementById("password-new-signup").value,
                        firstname : document.getElementById("first-name").value,
                        familyname : document.getElementById("last-name").value,
                        gender : document.getElementById("gender-input").value,
                        city :  document.getElementById("city").value,
                        country: document.getElementById("country").value,
                    }
    
    let request = initiateXHR("POST", "/sign_up");
    request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(formData));
    
    request.onreadystatechange =  function(){
        if (request.readyState == 4){
            let modalBody = [];
            let modalTitle = '';
            if (request.status == 201){
                modalBody = ['Successfully created new user.'];
                modalTitle = 'Sign up OK';
                formElement.reset();
            } else {
                modalBody = [request.responseText];
                modalTitle = 'Sign up failed! Errorcode: ' + request.status;

            }
            
            showModal(  
                        'welcome-section',  
                        modalBody,
                        modalTitle
                    );
        }
    }

    event.preventDefault();
    return false;
}

async function displayViewFromSignIn(){
    let userData = {}
    let loggedIn = false

    try{
        userData = await getActiveUser()
        loggedIn = userData.success
    } catch(err){
        console.table(err)
        loggedIn = false
        userData = err
    }
   
    if (loggedIn){
        delete userData['success']
        saveUser(userData);
        initiateWebSocket();
        displayLoggedin();
    } else{
        displayNotLoggedin();
        let modalTitle = 'Error: ' + userData['status']
        let modalBody = [userData['message']]
        showModal('welcome-section', modalBody, modalTitle)
    }
    console.table(socket)
}

async function displayViewFromStartUp(){
    
    let userData = {}
    let loggedIn = false
    try{
        userData = await getActiveUser()
        loggedIn = userData.success
    } catch(err){
        console.table(err)
        loggedIn = false
    }
        
    if (loggedIn){
        delete userData['success']
        saveUser(userData);
        initiateWebSocket();
        displayLoggedin();
    } else{
        displayNotLoggedin();
    }
    console.table(socket)
}

// ---------------- /Welcome functions ----------------

window.onload = async function(){
    console.log("page has been loaded");
    displayViewFromStartUp();
    // displayView();
    // checkSignUpStatus();

}
