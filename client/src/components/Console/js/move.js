import socket from "../../../clientUtilities/socket";
import { takeTheseOffThat } from "../../../clientUtilities/finders";
import Queue from "../../../clientUtilities/Queue";

const DIRECTIONS = { n: "north", e: "east", s: "south", w: "west" };

let moveQueue = new Queue();

socket.off('moveQueueForeward').on('moveQueueForeward', ({ chunk, characterName }) => {
    !(moveQueue.isEmpty()) && moveQueue.dequeue();
    if (!(moveQueue.isEmpty())) {
        let thisMove = moveQueue.peek();
        // console.log(thisMove);
        makeMove(socket, chunk, characterName, thisMove.direction);
    }
})

function makeMove(socket, location, characterName, direction, allowed, quiet) {
    let moved = false;
    for (const param in location) {
        if ((param === direction && !location[param].hidden) || param === direction && allowed) {
            if (location[param] === null) {
                socket.emit('failure', `Something seems to prevent you from moving ${direction}.`);
                moveQueue.dequeue();
                moved = true;
            } else {
                socket.emit('move', { previousLocation: location.current.locationName, newLocation: location[param].locationName, direction, user: characterName, quiet });
                moved = true;
            }
        }
    }
    if (moved === false) {
        socket.emit('failure', `There is no exit ${direction}`);
        moveQueue.dequeue();
    }
}

function processMove(socket, location, user, input, playerPosition, setChatHistory, actionCalls, command, allowed, quiet) {
    if (playerPosition === "standing") {
        let direction = takeTheseOffThat(actionCalls.move, input);
        if (direction !== '') {
            for (const param in DIRECTIONS) {
                if (direction.toLowerCase() === param) {
                    direction = DIRECTIONS[param];
                }
            }
            moveQueue.enqueue({ location: location.current.locationName, direction });
            if (moveQueue.length() === 1) {
                makeMove(socket, location, user.characterName, direction, allowed, quiet);
            }
        } else {
            setChatHistory(prevState => { return [...prevState, { type: "displayed-error", text: `You didn't enter anywhere to ${command}! Try entering: ${command} <direction>` }] })
        }

    } else {
        setChatHistory(prevState => [...prevState, { type: "displayed-error", text: 'You have to stand up to do that!' }]);

    }

}



export default processMove;