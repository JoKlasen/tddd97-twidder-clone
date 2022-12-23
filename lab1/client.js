let displayNotLoggedin = function() {
    putElementsInCenter();
}
let displayLoggedin = function() {
    //something
}

function putElementsInCenter(){
    let wrapperDiv = document.getElementById("welcome-view");
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

