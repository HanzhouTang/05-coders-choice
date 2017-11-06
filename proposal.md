Name: Hanzhou Tang        ID:   47520711

## Proposed Project
I want to create a multiplayer game system. It will contain a website, a central server and a database.
The games (such as chess, go, painting, or simple chess game) can be played by two players in the same time. 
Also, the system will support chatting between different players.

## Outline Structure
When two players decided to open a new game, the server will use a unique process to manage the game. 
The process will receive messages from each player, process the message, and then send to the opponent.
Also, the process can send announcement to two each play if necessary.
This communication will be implemented by Websocket (Because it's a two way message sending)
There is a supervisor to manage those processes.
I will use <canvas> to implement game UI and use javascript to update UI.
