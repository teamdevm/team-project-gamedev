const Player = require('./Player');
const Board = require('./Board');
const Bag = require('./Bag');
const User = require('../Users/UserModel');
const RecieveHandler = require('../ServerUtils/WSMessageHandler');

class GameService {
    /**
     * Array of players
     * @type {Player[]}
     */
    players;

    /**
     * Current player UUID
     * @type {string}
     */
    currentPlayer;

    /**
     * Current player index in array of players
     * @type {number}
     */
    currentPlayerIndex;

    /**
     * Game board
     * @type {Board}
     */
    board;

    /**
     * Bag
     * @type {Bag}
     */
    bag;

    _srvMainHandler;

    lobbyUUID;

    constructor(users, srvMainHandler, lobbyUUID){
        this._srvMainHandler = srvMainHandler;
        this.lobbyUUID = lobbyUUID;

        this.bag = new Bag("RU");
        this.board = new Board();
        this.InitializePlayers(users);

        users.forEach(element => {
            element.socket.onmessage = (event) => {
                RecieveHandler(element.socket, event.data, this);
            };
        });

        for(let i = 0; i < this.players.length; i++){
            let msg = {
                command: "start-game",
                data: {
                    hand_literals: this.players[i].GetHandLiterals(),
                    index: i,
                    bag_count: this.bag.count,
                    your_turn: false
                }
            }

            if(this.currentPlayerIndex == i){
                msg.data.your_turn = true;
            }

            this.players[i].user.SendMessage(msg);
        }
    }

    /**
     * 
     * @param {User[]} users 
     */
    InitializePlayers(users){
        this.players = [];

        for(let i = 0; i < users.length; i++){
            let hand = this.bag.TakePieces(7);
            let player = new Player(users[i], hand);
            this.players.push(player);
            users[i].LinkToGameService(this);
        }
        
        this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);
        this.currentPlayer = this.players[this.currentPlayerIndex].user.uuid;
    }

    GetPlayersInfo(playerIndex = null){
        let playersInfo = [];

        for(let i = 0; i < this.players.length; i++){
            let playerInfo = {
                index: i,
                score: this.players[i].points
            };

            if(i == playerIndex){
                playerInfo.his_score = true;
            }

            playersInfo.push(playerInfo);
        }

        return playersInfo;
    }

    GameEndingCheck(){
        let passesCount = 0;
        let maxHand = 0;

        this.players.forEach((element) => {
            if(element.hold){
                passesCount++;
            }

            maxHand = Math.max(maxHand, element.handCount);
        });

        if(passesCount == this.players.length || maxHand == 0){
            this.GameEnding();
            return true;
        }

        return false;
    }

    GameEnding(){
        this.players.forEach((element) => {
            let endMsg = {
                command: "end-game",
                data: {
                    table: this.GetPlayersInfo()
                }
            }

            element.user.SendMessage(endMsg);
        });

        this._srvMainHandler.DestroyLobby(this.lobbyUUID);
    }

    async NextTurn(){
        if(this.GameEndingCheck()){
            return;
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.currentPlayer = this.players[this.currentPlayerIndex].user.uuid;
        
        for(let i = 0; i < this.players.length; i++){
            let trnMsg = {
                command: "next-turn",
                data: {
                    bag_count: this.bag.count,
                    players_stats: this.GetPlayersInfo(i),
                    your_turn: false
                }
            }

            if(i == this.currentPlayerIndex){
                trnMsg.data.your_turn = true;
            }

            this.players[i].user.SendMessage(trnMsg);
        }
    }

    EndTurn(data){
        let player = this.players.find((item, index, arr) => {
            return item.user.uuid == data.user_uuid;
        });

        player.hold = false;

        let totalTurnPoints = this.board.CommitWords();
        this.board.ClearTurnBuffers();

        this.players[this.currentPlayerIndex].points += totalTurnPoints;

        let piecesNums = 7 - player.handCount;
        let pieces = this.bag.TakePieces(piecesNums);
        let handLiterals = player.GivePiecesToPlayer(pieces);

        return {
            hand_literals: handLiterals
        }
    }

    async PutPiece(data){
        if(!this.board.CheckIfEmptyCell(data.row, data.col)){
            throw "Cell is not empty";
        }

        let player = this.players.find((item, index, arr) => {
            return item.user.uuid == data.user_uuid;
        });

        let pieceFromHand = player.GetPieceFromHand(data.hand_pos);
        this.board.PutPieceOnBoard(data.row, data.col, pieceFromHand);

        let putMsg = {
            command: "put-piece-by-plr",
            data: {
                row: data.row,
                col: data.col,
                literal: pieceFromHand.literal
            }
        }

        this.players.forEach(async (element) => {
            if(element.user.uuid != data.user_uuid){
                element.user.SendMessage(putMsg);  
            }
        });

        await this.board.WordRecognizer();

        let respObj = {
            hand_literals: player.GetHandLiterals(),
            words_value: this.board.CalculatePointsToCommitValue()
        };

        return respObj;
    }

    async SendTakeMsg(row, col, user_uuid){
        let takeMsg = {
            command: "take-piece-by-plr",
            data: {
                row: row,
                col: col
            }
        }

        this.players.forEach((element) => {
            if(element.user.uuid != user_uuid){
                element.user.SendMessage(takeMsg);  
            }
        });
    }

    async TakePiece(data){
        if(this.board.CheckIfEmptyCell(data.row, data.col)){
            throw "Cell is empty";
        }

        let player = this.players.find((item, index, arr) => {
            return item.user.uuid == data.user_uuid;
        });

        let piece = this.board.TakePieceFromBoard(data.row, data.col);
        let handLiterals = player.GivePiecesToPlayer([piece]);

        this.SendTakeMsg(data.row, data.col, data.user_uuid);

        await this.board.WordRecognizer();

        return {
            hand_literals: handLiterals,
            words_value: this.board.CalculatePointsToCommitValue()
        };
    }

    SwapPlayerPieces(data){
        let player = this.players.find((item, index, arr) => {
            return item.user.uuid == data.user_uuid;
        });

        let piecesFromHand = player.GetMultiplePiecesFromHand(data.hand_pos);
        let swappedPieces = this.bag.SwapPieces(piecesFromHand);
        player.GivePiecesToPlayer(swappedPieces);

        this.board.ClearTurnBuffers();

        return {
            hand_literals: player.GetHandLiterals()
        }
    }

    PlayerDisconnected(data){
        let playerIndex = this.players.findIndex((item, index, arr) => {
            return item.user.uuid == data.user_uuid;
        });

        let playersPieces = this.players[playerIndex].GetMultiplePiecesFromHand([0, 1, 2, 3, 4, 5, 6]);
        this.bag.PutPieces(playersPieces);

        this.players.splice(playerIndex, 1);

        for(let i = 0; i < this.players.length; i++){
            (async function(gameService){
                let discMsg = {
                    command: "plr-disc-from-game",
                    data: {
                        disc_index: playerIndex,
                        new_index: i
                    }
                }

                gameService.players[i].user.SendMessage(discMsg);
            }(this))
        }

        if(playerIndex == this.currentPlayerIndex){
            if(this.board.currentCells.length > 0){
                let piecesFromBoard = this.board.TakeAllPuttedPieces();
                this.bag.PutPieces(piecesFromBoard.pieces);

                let coords = piecesFromBoard.cellCoords;
                coords.forEach((element) => {
                    this.SendTakeMsg(element.row, element.col, "...");
                });
            }
            this.board.ClearTurnBuffers();

            this.currentPlayerIndex--;            
            this.NextTurn();
        }

        if(this.players.length == 0){
            this._srvMainHandler.DestroyLobby(this.lobbyUUID);
        }
    }

    PassTurn(data){
        let player = this.players.find((item, index, arr) => {
            return item.user.uuid == data.user_uuid;
        });

        if(this.board.currentCells.length > 0){
            let piecesFromBoard = this.board.TakeAllPuttedPieces();
            player.GivePiecesToPlayer(piecesFromBoard.pieces);

            let coords = piecesFromBoard.cellCoords;
            coords.forEach((element) => {
                this.SendTakeMsg(element.row, element.col, "...");
            });
        }

        player.hold = true;

        return {
            hand_literals: player.GetHandLiterals()
        };
    }

    async HandleMessage(msg, callback){
        let respObj = {
            command: msg.command,
            code: 0,
            data: {}
        };

        switch(msg.command){
            case "put-piece": {
                console.log('put-piece fired');

                if(msg.data.user_uuid != this.currentPlayer){
                    respObj.code = 1;
                    break;
                }

                try{
                    respObj.data = await this.PutPiece(msg.data);
                } catch(e) {
                    respObj.code = 1;
                }
            }; break;

            case "take-piece": {
                if(msg.data.user_uuid != this.currentPlayer){
                    respObj.code = 1;
                    break;
                }

                try{
                    respObj.data = await this.TakePiece(msg.data);
                } catch(e) {
                    respObj.code = 1;
                }
            }; break;

            case "end-turn": {
                if(msg.data.user_uuid != this.currentPlayer){
                    respObj.code = 1;
                    break;
                }

                respObj.data = this.EndTurn(msg.data);
                this.NextTurn();
            }; break;

            case "swap-pieces": {
                if(msg.data.user_uuid != this.currentPlayer){
                    respObj.code = 1;
                    break;
                }

                respObj.data = this.SwapPlayerPieces(msg.data);
                this.NextTurn();
            }; break;

            case "pass-turn": {
                if(msg.data.user_uuid != this.currentPlayer){
                    respObj.code = 1;
                    break;
                }

                respObj.data = this.PassTurn(msg.data);
                this.NextTurn();
            }; break;
        }

        callback(respObj);
    }
}

module.exports = GameService;