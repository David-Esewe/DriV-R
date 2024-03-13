const express   = require('express');
const app       = express();
const http      = require('http');
const server    = require('http').createServer(app);  
const io        = require('socket.io')(server);

const LISTEN_PORT   = 8080;

let gameStarted = false;




app.use(express.static(__dirname + '/public')); 

//our routes
app.get( '/', function( req, res ){ 
    res.sendFile( __dirname + '/public/index.html' );
});

app.get( '/2D', function( req, res ){ 
    res.sendFile( __dirname + '/public/2Players.html' );
});

app.get( '/3D', function( req, res ){ 
    res.sendFile( __dirname + '/public/MazeChoice.html' );
});

//socket.io stuff
//https://socket.io/docs/v3/emit-cheatsheet/
const users = {}; // For the User in the scene

io.on('connection', (socket) => {
    console.log(socket.id + " connected");

    if (Object.keys(users).length < 2 && !gameStarted) {
        users[socket.id] = {
            id: socket.id,
           
        };
        
        socket.emit('waitingForPlayers');
    }
//This call above me will check if there is at least 2 players currently in the track

    if (Object.keys(users).length >= 1) {
        io.emit('countdownStart');
        
        let countdown = 3;
        let countdownInterval = setInterval(() => {
            io.emit('countdown', countdown);
            countdown -= 1;
            
            if (countdown < 0) {
                clearInterval(countdownInterval);
                io.emit('gameStart');
            }
        }, 1000);
    }

    //This one above checks if there are at least two players and starts the countdown
    if (Object.keys(users).length >= 2 && !gameStarted) {
        gameStarted = true;
        io.emit('countdownStart');
        
        let countdown = 3;
        let countdownInterval = setInterval(() => {
            io.emit('countdown', countdown);
            countdown -= 1;
            
            if (countdown < 0) {
                clearInterval(countdownInterval);
                io.emit('gameStart');
            }
        }, 1000);
    }
    //This one is lowkey a copycat :/ 
  



    // Create an avatar _| |_ for the new user
    //                  \   /
    //                   \ /
    //                    V

    
    const avatar = {
        id: socket.id, 
        x: 0, // Initial position, but this will aoutamatically update from the users movements :p
        y: 1.6, //made them a bit tall cause why not
        z: 0
    };

    
    users[socket.id] = avatar;

   
    Object.values(users).forEach(avatar => {
        socket.emit('create_user', avatar);
    });
    //Creates a new user every time someone enters scene
    // Tells everyone else to also create that user
    socket.broadcast.emit('create_user', avatar);

    // Handle user movement
    socket.on('update_position', (data) => {
        if (users[socket.id]) {
            // Update user's position constantly. was going to try and figure out head rotation but ran out of time :(
            users[socket.id].x = data.x;
            users[socket.id].y = data.y;
            users[socket.id].z = data.z;
            users[socket.id].rotX = data.rotX;
            users[socket.id].rotY = data.rotY;
            users[socket.id].rotZ = data.rotZ;
            // Broadcasts updated position to other users
            socket.broadcast.emit('update_user', users[socket.id]);
        }
    });

    

    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected");
        // Remove their avatar when the user disconnects
        delete users[socket.id];
        io.emit('remove_user', socket.id);
    });
});

server.listen(LISTEN_PORT);
console.log("Listening on port: " + LISTEN_PORT );