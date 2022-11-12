import { io } from "socket.io-client";
// import { Manager } from "socket.io-client";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


function checkValidity() {
    const userName = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if(!userName || !password) {
        return {isValid: false, message: "Username or Password is empty"};
    }
    return {isValid: true};
}
 function loginRegister() {
    if(checkValidity().isValid){

        const userName = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const params = {
            userName,
            password
        }
         fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
          }).then((data) => {
            // const data = await response.json();
            
            return data.json();
          }).then(parsedData => {
            console.log(parsedData);
          }).catch(err => {
            console.log(err)
          });
    }

}
function test(){
  fetch('http://localhost:3000/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  }).then((data) => {
    // const data = await response.json();
    
    return data.json();
  }).then(parsedData => {
    console.log(parsedData);
  }).catch(err => {
    console.log(err)
  });
}

function connectToServer() {
    var socket = io('http://localhost:5000',{reconnectionDelayMax: 10000, });
  

    socket.io.on("error", (error) => {
        console.log(error);
      });
      socket.io.on("reconnect_failed", (err) => {
        console.log("reconnect failed"+err)
      });
      socket.on("connect_error", (err) => {
        console.log("connect_error");
        console.log(err); // prints the message associated with the error
      }); 
     
      
    
    
    // socket.on('greeting-from-server', function (message) {
    //     document.body.appendChild(
            
    //         document.createTextNode(message.greeting)
    //     );
    //     console.log(message.greeting)
    //     socket.emit('greeting-from-client', {
    //         greeting: 'Hello Server'
    //     });
    // });
}
document.addEventListener('DOMContentLoaded', function () {
    connectToServer();
    document.getElementById("login").addEventListener("submit",(e)=> {
        e.preventDefault();
         loginRegister()
    });
    document.getElementById("connect").addEventListener("click",(e)=> {
      e.preventDefault();
       connectToServer();
  });
  document.getElementById("test").addEventListener("click",(e)=> {
  e.preventDefault();
     test();
});
    console.log("DOM content loaded");  

    
}, false);