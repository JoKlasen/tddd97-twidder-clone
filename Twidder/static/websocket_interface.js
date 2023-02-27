let socket;



function initiateWebSocket(){
    socket = new WebSocket("ws://localhost:5000/echo")

    socket.onopen = () => {
        socket.send( getToken() )
        console.log("socket is open")
    } 

    socket.onmessage = (event) =>{

        console.log(event.data);
        if(event.data === 'logout'){
            console.log("logout me!")
        }
    }
}