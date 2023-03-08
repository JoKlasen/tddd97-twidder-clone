let socket;
let url = "pintotwidderapp.azurewebsites.net"

function initiateWebSocket(){
    socket = new WebSocket("ws://" + url + "/connect")

    socket.onopen = () => {
        socket.send( getToken() )
        console.log("socket is open")
    } 

    socket.onmessage = (event) =>{

        console.log(event.data);
        if(event.data === 'logout'){
            signOutSoft()
        }
    }

}