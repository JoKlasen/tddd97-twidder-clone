let displayNotLoggedin = function() {
    //something
}
let displayLoggedin = function() {
    //something
}

function logIn(){
    document.getElementById("not-logged-in-wrapper").style.display = "none";
    document.getElementById("logged-in-wrapper").style.display = "flex";
}

function logOut(){
    document.getElementById("logged-in-wrapper").style.display = "none";
    document.getElementById("not-logged-in-wrapper").style.display = "flex";
}

window.onload = function(){
    console.log("page has been loaded");
    displayNotLoggedin();
}

