let fs = require('fs');
const Piece = require('./Piece');

class Cell {
    /**
     * Cell type
     * @type {string}
     */
    type;

    /**
     * Piece in cell
     * @type {Piece}
     */
    piece;

    /**
     * Words which cell included to
     * @type {*}
     */
    words;

    constructor(type = null){
        this.words = [];
        this.type = type;
        this.piece = null;
    }
}

class Board {
    /**
     * Board cells
     * @type {Cell[][]}
     */
    board;

    /**
     * Number of rows
     * @type {number}
     */
    rows;

    /**
     * Number of cols
     * @type {number}
     */
    cols;

    constructor(){
        fs.readFile('/Game/classic_board.txt', "utf8", (error, data) => {
            let cellsInfo = data.split('\n');

            boardInfo = cellsInfo[0].split(',');
            this.rows = parseInt(boardInfo[0]);
            this.cols = parseInt(boardInfo[1]);

            let specialCellIndex = 1;
            let specialCell = this.ParseCellData(cellsInfo[specialCellIndex++]);

            for(let row = 0; row < this.rows; row++){
                let rowCells = [];

                for(let col = 0; col < this.cols; col++){
                    let cell = new Cell();

                    if(specialCell.row == row && specialCell.col == col){
                        cell.type = specialCell.type;
                        specialCell = this.ParseCellData(cellsInfo[specialCellIndex++]);
                    }

                    rowCells[col] = cell;
                }

                this.board[row] = rowCells;
            }
        });
    }

    /**
     * Check if cell empty
     * @param {number} row Cell's row
     * @param {number} col Cell's col
     * @returns {boolean}
     */
    CheckIfEmptyCell(row, col){
        return this.board[row][col].piece == null;
    }

    /**
     * Set piece on board with related coordinates
     * @param {numebr} row Cell's row
     * @param {number} col Cell's col
     * @param {Piece} piece Piece object to place
     */
    PutPieceOnBoard(row, col, piece){
        this.board[row][col].piece = piece;
    }

    /**
     * Take piece from related coordinates
     * @param {number} row Cell row
     * @param {number} col Cell col
     * @returns {Piece}
     */
    TakePieceFromBoard(row, col){
        let piece = this.board[row][col].piece;
        this.board[row][col].piece = null;
        return piece;
    }

    /**
     * Parse cell data from string line
     * @param {string} specialCellData String line which contains data
     * @returns {{
     *      row: number,
     *      col: number,
     *      type: string
     * }} Cell data
     */
    ParseCellData(specialCellData){
        let specialCellInfoStrings = specialCellData.split(',');
        let specialCellInfo = {
            row: parseInt(specialCellInfoStrings[0]),
            col: parseInt(specialCellInfoStrings[1]),
            type: specialCellInfoStrings[2]
        };

        return specialCellInfo;
    }
}

module.exports = Board;