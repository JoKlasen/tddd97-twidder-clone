let displayNotLoggedin = function() {
    let welcomeView = document.getElementById("welcome-view-container");
    let welcomeSection = document.getElementById("welcome-section");
    welcomeSection.innerHTML = welcomeView.innerHTML;
}
let displayLoggedin = function() {
    //something
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
    
    if (password != passwordRepeat){
        let modalBody = [
                            "The passwords are not equal to each other.",
                        ]
        showModal("welcome-section", modalBody, modalTitle);
        event.preventDefault();
        return false;
    }
    return true;
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

function showModal(section, modalBody, modalTitle){
    console.log("inside Showmodal");
    let modal = document.getElementById("error-modal");
    let currentSection = document.getElementById(section);
    
    let currentModalBody = document.getElementById("modal-body");
    let currentModalTitle = document.getElementById("modal-title");
    modalBody.forEach(element => {
        currentModalBody.innerHTML += element;
    });
    currentModalTitle.innerHTML += modalTitle;


    currentSection.style.pointerEvents = "none";
    modal.style.transform += "translate(-50%, -50%) scale(1.0)";
}

function closeModal(section){
    let modal = document.getElementById("error-modal");
    let currentSection = document.getElementById(section);
    currentSection.style.pointerEvents = "auto";
    modal.style.transform += "scale(0)";
    location.reload();
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

