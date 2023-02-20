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
        console.log("error: ")
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
        reject(request.responseText)
    }
}

async function getUserMessagesByEmail(token, email){
    return new Promise( (resolve, reject) => {
        let request = initiateXHR('GET', '/get_user_messages_by_email/' + email)
        request.setRequestHeader('Authorization', token)
        request.send()

        // tilldelar onreadystatechange en "arrow function" som wrappar
        // "getMessagesReadState"
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
    console.log("readystate: ")
    console.log(request.readyState)
    console.log("status: " + request.status)
    console.log("response: ")
    console.log(request.responseText)
    console.log("statusText: ")
    console.log(request.statusText)
    if (request.status == 201){
        resolve("hej")
    } else {
        reject("då")
    }   
}

async function postMessage(token, message, toEmail){
    return new Promise( (resolve, reject) => {
        console.log("token")
        console.log(token)
        console.log("message")
        console.log(message)
        console.log("toEmail")
        console.log(toEmail)
        
        let request = initiateXHR("POST", "/post_message")
        let body = {
            email     : toEmail,
            message   : message
        }
        request.setRequestHeader('Authorization', token)
        request.setRequestHeader("Content-type", "application/json;charset=UTF-8");

        console.log("body(string): ")
        console.log(JSON.stringify(body))
        // console.table(body)
        request.send( JSON.stringify(body) )

        request.onreadystatechange = function (){
            if (request.readyState !== 4){
                return
            }
            console.log("readystate: ")
            console.log(request.readyState)
            console.log("status: " + request.status)
            console.log("response: ")
            console.log(request.responseText)
            console.log("statusText: ")
            console.log(request.statusText)

            if (request.status == 201){
                resolve("hej")
            } else {
                reject("då")
            }   
        }

        // request.onreadystatechange = () => {
        //     postMessageReadyState(request, resolve, reject)
        // }
    });
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
            let modalTitle = 'User doesn\'t exist :(';
            showModal('profile-section', modalBody, modalTitle);
            return
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
        return
    }

    console.log("usermessages: ")
    console.table(userMessages)

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
    event.preventDefault()
    let token = getToken();
    let contentBox = formElement[CURRENT_PROFILE_TAB + "-send-message-text"];
    // let toEmail = null;
    // toEmail = window.localStorage.getItem('currently_viewed_profile');

    if (toEmail == null && CURRENT_PROFILE_TAB == 'browse'){
        let modalBody = ['You have not chosen any user to browse yet.'];
        let modalTitle = 'Error: couldn\'t send message';
        showModal('profile-section', modalBody, modalTitle);
        // event.preventDefault();
        return;
    }

    // if (toEmail == null){
    //     toEmail = JSON.parse(window.localStorage.getItem("active_user")).email;
    // }

    console.log("email:")
    console.log(toEmail)
    console.log("token: ")
    console.log(token)

    try{
        let response = await postMessage(token, contentBox.value, toEmail);
    } catch(err){
        console.log("sendMessage error:")
        console.log(err)
        // event.preventDefault()
        return false
    }

    contentBox.value = '';
    loadMessages(toEmail);
    // event.preventDefault();
}

// async function sendMessage(formElement, event){    
//     let token = getToken();
//     let contentBox = formElement[CURRENT_PROFILE_TAB + "-send-message-text"];
//     let toEmail = null;
//     toEmail = window.localStorage.getItem('currently_viewed_profile');
//     console.log("Inuti send message")
//     console.log("toEmail")
//     console.log(toEmail)

//     if (toEmail == null && CURRENT_PROFILE_TAB == 'browse'){
//         let modalBody = ['You have not chosen any user to browse yet.'];
//         let modalTitle = 'Error: couldn\'t send message';
//         showModal('profile-section', modalBody, modalTitle);
//         event.preventDefault();
//         return;
//     }

//     if (toEmail == null){
//         toEmail = JSON.parse(window.localStorage.getItem("active_user")).email;
//     }
//     console.log("min email?")
//     console.log(toEmail)
//     // serverstub.postMessage(token, contentBox.value, toEmail);
//     try{
//         let response = await postMessage(token, contentBox.value, toEmail);
//     } catch(err){
//         console.log("sendMessage error:")
//         console.log(err)
//         event.preventDefault()
//         return false
//     }
//     console.log("efter postMessage await")
//     event.preventDefault()


//     contentBox.value = '';
//     loadMessages(toEmail);
//     event.preventDefault();
// }

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
    currentAnchor.style.color = color;          // toggleClass istället
}

// TODO: Meddela server att vi loggar ut
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
function validateSignIn(event){

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
                displayView();
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
    event.preventDefault();
}

function validateSignUp(formElement, event){

    let genderSelect = formElement["gender-input"];
    let password = formElement["password-new"];
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
                        password : document.getElementById("password-new").value,
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

                document.getElementById("email-new").value = '';
                document.getElementById("password-new").value = '';
                document.getElementById("first-name").value = '';
                document.getElementById("last-name").value = '';
                document.getElementById("gender-input").value = '';
                document.getElementById("city").value = '';
                document.getElementById("country").value = '';
            } else {
                modalBody = [request.responseText];
                modalTitle = 'Sign up failed';

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

// function checkSignUpStatus(){
    
//     if (window.localStorage.getItem('sign-up-status') === null)
//     {
//         // No sign up was done previous this refresh
//         return;
//     }
    
//     let modalTitle = 'Sign up status: ' + window.localStorage.getItem('sign-up-status');
//     let modalBody = [
//         window.localStorage.getItem('sign-up-message')
//     ]
    
//     showModal(  'welcome-section',  
//                 modalBody,
//                 modalTitle
//                 )
                
//     window.localStorage.removeItem('sign-up-status');
//     window.localStorage.removeItem('sign-up-message'); 
// }

async function displayView(){
    let userData = {}
    let loggedIn = false
    try{
        userData = await getActiveUser()
        loggedIn = userData.success
    } catch(err){
        loggedIn = false
    }
        
    if (loggedIn){
        delete userData['success']
        saveUser(userData);
        displayLoggedin();
    } else{
        displayNotLoggedin();
    }
}

// ---------------- /Welcome functions ----------------

window.onload = async function(){
    console.log("page has been loaded");
    displayView();
    // checkSignUpStatus();
}
