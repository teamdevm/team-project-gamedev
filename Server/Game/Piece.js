class Piece {
    /**
     * Piece literal
     * @type {string}
     */
    literal;

    /**
     * Piece's cost for one tile
     * @type {number}
     */
    cost;
    
    /**
     * Constructor of piece class
     * @param {string} literal Piece literal
     * @param {number} cost Piece cost
     */
    constructor(literal, cost){
        this.literal = literal;
        this.cost = cost;
    }
}

module.exports = Piece;