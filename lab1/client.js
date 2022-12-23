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

// function adjustLabelInputPair(){

// }


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
}

