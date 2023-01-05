function setCookie(token){
    let currentDate = new Date();
    document.cookie = 'logged_in_user=' + token + '; expires=' + currentDate.toString + '; path=/';
}

// Returns empty string if cookieName didn't match any saved cookie
function getCookie(cookieName){
    let cookies = document.cookie.split(';');
    console.log('Cookies: ');
    console.log(cookies);

    let data = '';
    
    for (let i = 0; i < cookies.length; i++){
        if (cookies[i].includes(cookieName)){
            let equalSign = cookies[i].indexOf('=');
            data = cookies[i].substring(equalSign, cookies[i].length - 1);
            console.log('token: ');
            console.log(data);
            break;
        }
    }
}

function activeUser(){
    return serverstub.getUserDataByToken(getCookie('logged_in_user')) !== null;
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

let displayNotLoggedin = function() {
    let container = document.getElementById("welcome-view-container");
    let welcomeSection = document.getElementById("welcome-section");
    welcomeSection.innerHTML = container.innerHTML;
    putDotsBetweenLabelInputPair();
}

let displayLoggedin = function() {
    console.log('Display logged in!');
    let container = document.getElementById('profile-view-container');
    let profileSection = document.getElementById('profile-section');
    profileSection.innerHTML = container.innerHTML;
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

function showModal(section, modalBody, modalTitle){
    console.log("inside Showmodal");
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
}

function closeModal(section){
    let modal = document.getElementById("error-modal");
    let currentSection = document.getElementById(section);
    currentSection.style.pointerEvents = "auto";
    modal.style.transform = "translate(-50%, -50%) scale(0)";
}

function checkSignUpStatus(){
    
    if (window.localStorage.getItem('sign-up-status') === null)
    {
        console.log("No sign up was done previous this refresh");
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
    
    return;
}

function displayView(){
    // Might need information about who is logged in. Future problem
    let loggedIn = activeUser(); 

    //if (loggedIn){
    //    displayLoggedin();
    //} else{
        displayNotLoggedin();
    //}
}

window.onload = function(){
    console.log("page has been loaded");
    displayView();
    checkSignUpStatus();
}








// function checkSignInStatus(){
//     if (window.localStorage.getItem('sign-in-status') === null)
//     {
//         console.log("No sign in was done previous this refresh");
//         // throw new Error('No sign in was done previous this refresh');
//         return;
//     }
    
//     let status = window.localStorage.getItem('sign-in-status');
//     if (status === 'success'){
//         // activeToken();
//         closeWelcomeSection();
//         displayLoggedin();
//     } else {
//         let modalTitle = 'Sign in status: ' + status;
//         let modalBody = [
//             window.localStorage.getItem('sign-in-message')
//         ]
        
//         showModal(  'welcome-section',  
//         modalBody,
//         modalTitle
//         )
//     }
    
//     window.localStorage.removeItem('sign-in-status');
//     window.localStorage.removeItem('sign-in-message'); 
    
//     return true;
// }