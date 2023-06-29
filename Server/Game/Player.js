const User = require('../Users/UserModel');
const Piece = require('./Piece');

class Player {
    /**
     * Player's points
     * @type {number}
     */
    points;

    /**
     * Link to user object
     * @type {User}
     */
    user;

    /**
     * Player's hand which contains some pieces
     * @type {Piece[]}
     */
    hand;

    /**
     * Number of pieces in player's hand
     * @type {number}
     */
    handCount;

    /**
     * Flag if player passes his turn
     * @type {boolean}
     */
    hold;

    /**
     * Player constructor
     * @param {User} user User object which player object will connect to
     * @param {Pieces} pieces Initial hand
     */
    constructor(user, pieces){
        this.user = user;
        this.points = 0;
        this.hand = [...pieces];
        this.handCount = 7;
        this.hold = false;
    }

    /**
     * Get piece from hand position
     * @param {number} handPos Position in hand
     * @returns {Piece}
     */
    GetPieceFromHand(handPos){
        let piece = this.hand[handPos];
        this.hand[handPos] = null;
        this.handCount--;
        return piece;
    }

    /**
     * Get piece data without taking from hand
     * @param {number}
     * @returns {Piece}
     */
    GetPieceDataFromHand(handPos){
        return this.hand[handPos];
    }

    /**
     * 
     * @param {number[]} handPos 
     */
    GetMultiplePiecesFromHand(handPos){
        let pieces = [];
        
        handPos.forEach((element) => {
            if(element != null){
                pieces.push(this.GetPieceFromHand(element));
            }
        });

        return pieces;
    }

    /**
     * Give pieces to player
     * @param {Piece[]} pieces Pieces which player takes
     * @returns {string[]}
     */
    GivePiecesToPlayer(pieces){
        let piecesGain = 0;

        for(let i = 0; i < this.hand.length || piecesGain < pieces.length; i++){
            if(this.hand[i] == null){
                this.hand[i] = pieces[piecesGain];
                piecesGain++;
            }
        }

        this.handCount += pieces.length;

        return this.GetHandLiterals();
    }

    /**
     * Get pieces literals in hand
     * @returns {string[]}
     */
    GetHandLiterals(){
        let handObj = [];

        for(let i = 0; i < this.hand.length; i++){
            if(this.hand[i] != null){
                handObj.push(this.hand[i].literal);
            } else {
                handObj.push(null);
            }
        }

        return handObj;
    }

}

module.exports = Player;