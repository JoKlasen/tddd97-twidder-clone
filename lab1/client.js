let displayNotLoggedin = function() {
    //something
}
let displayLoggedin = function() {
    //something
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
}

