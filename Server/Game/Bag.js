let Piece = require('./Piece');
let fs = require('fs');

class Bag {
    /**
     * Array of pieces in bag
     * @type {[{
     *      piece: Piece,
     *      count: number
     * }]}
     */
    pieces;

    /**
     * Number of pieces in bag
     * @type {number}
     */
    count;

    constructor(type){
        const data = fs.readFileSync(__dirname + `/${type}_pieces.txt`, "utf8");
        this.pieces = [];
        this.count = 0;

        let lines = data.split('\n');

        lines.forEach((element) => {
            let pieceInfo = element.split(',');

            let pieceLiteral = pieceInfo[0];
            let pieceCost = parseInt(pieceInfo[1]);
            let pieceCount = parseInt(pieceInfo[2]);
            
            this.pieces.push({
                piece: new Piece(pieceLiteral, pieceCost),
                count: parseInt(pieceCount)
            });

            this.count += pieceCount;
        });
    }

    /**
     * Take some pieces from bag
     * @param {number} num Number of pieces to take
     * @returns {Piece[]} Pieces array with length of requested number
     */
    TakePieces(num){
        let piecesToTake = [];

        while(num > 0){
            let bagNum = Math.floor(Math.random() * this.pieces.length);

            piecesToTake.push(this.pieces[bagNum].piece);
            this.pieces[bagNum].count--;

            if(this.pieces[bagNum].count == 0){
                this.pieces.splice(bagNum, 1);
            }

            num--;
        }

        return piecesToTake;
    }

    /**
     * 
     * @param {Piece[]} pieces 
     */
    PutPieces(pieces){
        pieces.forEach((element) => {
            let piece = this.pieces.find((item, index, arr) => {
                return element.literal == item.literal;
            });

            piece.count++;
        });
    }

    /**
     * Swap some pieces
     * @param {Piece[]} piecesToSwap Array of pieces
     * @returns {Piece[]} Array of pieces
     */
    SwapPieces(piecesToSwap){
        let gotPieces = this.TakePieces(piecesToSwap.length);
        this.PutPieces(piecesToSwap);
        return gotPieces;
    }
}

module.exports = Bag;