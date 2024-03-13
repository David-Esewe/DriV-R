const socket = io();
let myUserId = null;

// Function to create or update user representation
function createOrUpdateUser(data) {
    let userRep = document.querySelector(`#user-${data.id}`);
    if (!userRep) {
        // Create the group entity to hold the body and eyes
        userRep = document.createElement('a-entity');
        userRep.setAttribute('id', `user-${data.id}`);

        // Create the body (use a sphere for simplicity)
        const body = document.createElement('a-entity');
        body.setAttribute('geometry', { primitive: 'sphere', radius: 0.5 });
        body.setAttribute('material', 'color', '#FFC65D');
        userRep.appendChild(body);
        
        //Very overcomplicated but math.random() on its own wasnt working for some reason and kept making it white
        const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

        const torso = document.createElement('a-box');
        torso.setAttribute('color', getRandomColor());
        torso.setAttribute('depth', '0.5');
        torso.setAttribute('height', '0.5');
        torso.setAttribute('width', '0.5');
        torso.setAttribute('position', '0 -1.051 0');
        torso.setAttribute('scale', '1.487 1.917 1.094');
        userRep.appendChild(torso);
        // Create eyes (smaller spheres)
        const eyeLeft = document.createElement('a-entity');
        eyeLeft.setAttribute('geometry', { primitive: 'sphere', radius: 0.1 });
        eyeLeft.setAttribute('material', 'color', 'black');
        eyeLeft.setAttribute('position', '0.161 0.219 -0.438'); // Adjust positions as necessary
        eyeLeft.setAttribute('scale', '0.475 0.475 0.475');
        userRep.appendChild(eyeLeft);

        const eyeRight = document.createElement('a-entity');
        eyeRight.setAttribute('geometry', { primitive: 'sphere', radius: 0.1 });
        eyeRight.setAttribute('material', 'color', 'black');
        eyeRight.setAttribute('position', '-0.109 0.224 -0.458'); // Adjust positions as necessary
        eyeRight.setAttribute('scale', '0.475 0.475 0.475');
        userRep.appendChild(eyeRight); 

        const kart = document.createElement('a-entity');
        kart.setAttribute('gltf-model', 'assets/kart.glb');
        kart.setAttribute('position', '0 -1.2 0');
        kart.setAttribute('rotation', '0 180 0');
        kart.setAttribute('scale', '1.42509 1.42509 1.75225');
        userRep.appendChild(kart);

        if (data.id === myUserId) {
            // If it's the current user, parent the representation to the camera
            eyeLeft.setAttribute('visible', 'false');
            eyeRight.setAttribute('visible', 'false');
            
        } else {
           
            document.querySelector('a-scene').appendChild(userRep);
        }
    }

    // Update the position for other users avatars
    if (data.id !== myUserId) {
        userRep.setAttribute('position', `${data.x} ${data.y} ${data.z}`);
        userRep.setAttribute('rotation', `0 ${data.rotY} 0`);
    }
}

socket.on('connect', () => {
    myUserId = socket.id; 
  
});


socket.on('waitingForPlayers', () => {
    document.getElementById('countdown').innerText = 'Waiting for more players...';
});

socket.on('countdown', (count) => {
    document.querySelector('#countdownText').setAttribute('value', count);
});

socket.on('gameStart', () => {
    document.querySelector('#countdownText').setAttribute('value', "GO!");
    
    let camera = document.querySelector('a-camera');
    if (camera) {
        
        camera.setAttribute('wasd-controls', 'acceleration: 50');
        //GIVE THEM BACK THEIR LEGS (or wheels i guess, or karts? since the mario karts dont have wheels for some reason)
    }
});



socket.on('create_user', createOrUpdateUser); 
socket.on('update_user', createOrUpdateUser);

socket.on('remove_user', (id) => {
    const userToRemove = document.querySelector(`#user-${id}`);
    if (userToRemove) {
        userToRemove.parentNode.removeChild(userToRemove);
    }
});

        // Update and send position to server
        function updateMyPosition() {
            const cameraEl = document.querySelector('[camera]');
            const position = cameraEl.getAttribute('position');
            const rotation = cameraEl.getAttribute('rotation');
    
            socket.emit('update_position', {
                id: myUserId,
                x: position.x,
                y: position.y,
                z: position.z,
                rotX: rotation.x,
                rotY: rotation.y, 
                rotZ: rotation.z  
            });
        }
    
        setInterval(updateMyPosition, 100); //anything lower and my computer physically threatens to end me