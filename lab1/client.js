let displayNotLoggedin = function() {
    let welcomeView = document.getElementById("welcome-view-container");
    let welcomeSection = document.getElementById("welcome-section");
    welcomeSection.innerHTML = welcomeView.innerHTML;

    // welcomeSection.children[0].style.position = "relative";
    // welcomeSection.children[0].style.top = "50%";
    // welcomeSection.children[0].style.left = "50%";
    // welcomeSection.children[0].style.transform = "translate(-50%, -50%)";

    // centerElementsInWindow("welcome-view");
    // centerElementsInWindow("error-modal");
    // document.getElementById("welcome-section").style.zIndex = 1;
    // document.getElementById("sign-up-error-modal").style.zIndex = 9;
}
let displayLoggedin = function() {
    //something
}

function validateSignUp(){
    let formElement = document.getElementById("sign-up-form");
    let genderSelect = document.getElementById("gender-input");
    let password = document.getElementById("password-new");
    let passwordRepeat = document.getElementById("password-repeat");
    

    // Om input är fel (i någon if-sats) 
    // 1. Göm inte welcome-section, det är konstig design. Se till att en ruta
    //    kommer upp ovanför allt men att det syns i bakgrunden
    // 2. visa error modal med lämplig text

    let errorModal = document.getElementById("sign-up-error-modal");
    // document.getElementById("welcome-section").style.display = "none";
    console.log(errorModal);
    centerElementsInWindow("sign-up-error-modal");
    errorModal.style.display = "flex";
    
    if (genderSelect.value == "NO_CHOICE"){
        return false;
    }
    
    if (password != passwordRepeat){
        return false;
    }
    
    
    // console.log(formElement);
    // console.log(genderSelect.value); 
    // console.log(password.value); 
    // console.log(passwordRepeat.value); 
    // event.preventDefault();
}

function centerElementsInWindow(currentView){
    let wrapperDiv = document.getElementById(currentView);
    let center = window.innerWidth / 2;
    let offset = center - (wrapperDiv.offsetWidth / 2); 
    wrapperDiv.style.marginLeft = offset;
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

function showModal(section){
    let modal = document.getElementById("error-modal");
    let overlay = document.getElementById("error-overlay");
    let currentSection = document.getElementById(section);
    currentSection.style.pointerEvents = "none";
    modal.style.transform += "translate(-50%, -50%) scale(1.0)";
    overlay.style.transform = "scale(1.0)";
}

function closeModal(section){
    console.log("hej!");
}

function logIn(){
    document.getElementById("welcome-view").style.display = "none";
    document.getElementById("profile-view").style.display = "flex";
}

function logOut(){
    document.getElementById("profile-view").style.display = "none";
    document.getElementById("welcome-view").style.display = "flex";
}

window.onload = function(){
    console.log("page has been loaded");
    displayNotLoggedin();
    putDotsBetweenLabelInputPair();
}

