let fs = require('fs');
const Piece = require('./Piece');
const WordAPI = require('../WordAPI/WordAPI');
const Word = require('./Word');

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

    /**
     * @type {number}
     */
    row;

    /**
     * @type {number}
     */
    col;

    constructor(row, col, type = "u"){
        this.words = [];
        this.type = type;
        this.piece = null;
        this.row = row;
        this.col = col;
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

    /**
     * @type {Cell[]}
     */
    currentCells;

    /**
     * @type {string[]}
     */
    commitedWords;

    /**
     * @type {Word[]}
     */
    wordsToCommit;

    constructor(){
        this.currentCells = [];
        this.board = [];
        this.wordsToCommit = [];
        this.commitedWords = [];
        this.cols = 0;
        this.rows = 0;        

        const data = fs.readFileSync(__dirname + '/classic_board.txt', "utf8");

        let cellsInfo = data.split('\r\n');

        let boardInfo = cellsInfo[0].split(',');
        this.rows = parseInt(boardInfo[0]);
        this.cols = parseInt(boardInfo[1]);

        let specialCellIndex = 1;
        let specialCell = this.ParseCellData(cellsInfo[specialCellIndex++]);

        for(let row = 0; row < this.rows; row++){
            let rowCells = [];

            for(let col = 0; col < this.cols; col++){
                let cell = new Cell(row, col);

                if(specialCell.row == row && specialCell.col == col){
                    cell.type = specialCell.type;

                    if(specialCellIndex < cellsInfo.length){
                        specialCell = this.ParseCellData(cellsInfo[specialCellIndex++]);
                    }
                }

                rowCells[col] = cell;
            }

            this.board[row] = rowCells;
        }
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
     * Check if one of the putted pieces on start cell
     * @returns {boolean}
     */
    OnStartCell(){
        for(let i = 0; i < this.currentCells.length; i++){
            if(this.currentCells[i].type == "s"){
                return true;
            }
        }

        return false;
    }

    /**
     * Check if one of the putted pieces near existed piece
     * @returns {boolean}
     */
    NearExistingPieces(){
        for(let i = 0; i < this.currentCells.length; i++){
            let cell = this.currentCells[i];

            if((cell.row - 1 > -1 && this.board[cell.row - 1][cell.col].piece != null && 
                this.currentCells.findIndex((item, idx, arr) => item.col == cell.col && item.row == cell.row - 1) == -1) ||
                (cell.row + 1 < this.rows && this.board[cell.row + 1][cell.col].piece != null && 
                this.currentCells.findIndex((item, idx, arr) => item.col == cell.col && item.row == cell.row + 1) == -1) ||
                (cell.col - 1 > -1 && this.board[cell.row][cell.col - 1].piece != null && 
                this.currentCells.findIndex((item, idx, arr) => item.col == cell.col - 1 && item.row == cell.row) == -1) ||
                (cell.col + 1 < this.cols && this.board[cell.row][cell.col + 1].piece != null && 
                this.currentCells.findIndex((item, idx, arr) => item.col == cell.col + 1 && item.row == cell.row) == -1)){
                return true;
            }
        }

        return false;
    }

    LinkWithExistingPieces(){
        return this.OnStartCell() || this.NearExistingPieces();
    }

    /**
     * Check if all pieces putted horizontal
     * @param {{horizontal: boolean, vertical: boolean}} linearity 
     * @returns {boolean}
     */
    IsHorizontal(linearity){
        let row = this.currentCells[0].row;

        for(let i = 1; i < this.currentCells.length; i++){
            if(this.currentCells[i].row != row){
                return false;
            }
        }

        this.currentCells.sort((a, b) => a.col - b.col);
        
        for(let i = 0; i < this.currentCells.length - 1; i++){
            if(this.currentCells[i + 1].col - this.currentCells[i].col > 1){
                for(let Bcol = this.currentCells[i].col + 1; Bcol < this.currentCells[i + 1].col; Bcol++){
                    if(this.board[row][Bcol].piece == null){
                        return false;
                    }
                }
            }
        }

        linearity.horizontal = true;
        return true;
    }

    /**
     * Check if all pieces putted vertical
     * @param {{horizontal: boolean, vertical: boolean}} linearity 
     * @returns {boolean}
     */
    IsVertical(linearity){
        let col = this.currentCells[0].col;

        for(let i = 1; i < this.currentCells.length; i++){
            if(this.currentCells[i].col != col){
                return false;
            }
        }

        this.currentCells.sort((a, b) => a.row - b.row);
        
        for(let i = 0; i < this.currentCells.length - 1; i++){
            if(this.currentCells[i + 1].row - this.currentCells[i].row > 1){
                for(let Brow = this.currentCells[i].row + 1; Brow < this.currentCells[i + 1].row; Brow++){
                    if(this.board[Brow][col].piece == null){
                        return false;
                    }
                }
            }
        }

        linearity.vertical = true;
        return true;
    }

    /**
     * Check if all pieces putted linear
     * @param {{vertical: boolean, horizontal: boolean}} linearity 
     * @returns {boolean}
     */
    IsLinear(linearity){
        return this.IsHorizontal(linearity) || this.IsVertical(linearity);
    }

    /**
     * 
     * @param {string} word 
     */
    CheckIfWordExisted(word){
        return this.commitedWords.findIndex((item, idx, arr) => item == word) != -1;
    }

    /**
     * 
     * @param {string} word 
     * @param {Cell[]} cells
     * @returns {?number}
     */
    async CalculateWord(word, cells){
        if(cells.length < 1){
            return null;
        }

        let accepted = await WordAPI.fetchData(word);

        if(!(accepted && !this.CheckIfWordExisted(word))){
            return null;
        }

        let points = 0;
        let wordMult = 1;

        for(let i = 0; i < cells.length; i++){
            let letterMult = 1;

            switch(cells[i].type){
                case "l2": letterMult *= 2; break;
                case "l3": letterMult *= 3; break;
                case "w2": wordMult *= 2; break;
                case "we": wordMult *= 3; break;
            }

            points += cells[i].piece.cost * letterMult;
        }

        points *= wordMult;
        return points;
    }

    /**
     * Create string from pieces
     * @param {Cell[]} cells 
     * @returns {string}
     */
    BuildWord(cells){
        let wordStr = "";

        for(let i = 0; i < cells.length; i++){
            wordStr = wordStr + cells[i].piece.literal;
        }

        wordStr = wordStr.toLowerCase();
        return wordStr;
    }

    /**
     * Horizontal alingment recognizing
     * @param {Cell} rootCell
     */
    async HorizontalAlingmentWordBuilding(rootCell){
        let cells = [rootCell];
        let row = cells[0].row;
        let leftSide = cells[0].col + 1;
        let rightSide = cells[0].col - 1;

        while(leftSide < this.cols && this.board[row][leftSide].piece != null){
            cells.push(this.board[row][leftSide++]);
        }

        while(rightSide > -1 && this.board[row][rightSide].piece != null){
            cells.unshift(this.board[row][rightSide--]);
        }

        let wordStr = this.BuildWord(cells);
        let points = await this.CalculateWord(wordStr, cells);

        if(points != null){
            this.wordsToCommit.push(new Word(wordStr, cells, points));
        }
    }

    /**
     * Vertical alingment recognizing
     * @param {Cell} rootCell
     */
    async VerticalAlingmentBuilding(rootCell){
        let cells = [rootCell];
        let col = cells[0].col;
        let downSide = cells[0].row + 1;
        let upSide = cells[0].row - 1;

        while(downSide < this.rows && this.board[downSide][col].piece != null){
            cells.push(this.board[downSide++][col]);
        }

        while(upSide > -1 && this.board[upSide][col].piece != null){
            cells.unshift(this.board[upSide--][col]);
        }

        let wordStr = this.BuildWord(cells);
        let points = await this.CalculateWord(wordStr, cells);

        if(points != null){
            this.wordsToCommit.push(new Word(wordStr, cells, points));
        }
    }

    /**
     * Horizontal main alingment recognizing
     */
    async HorizontalWordBuilding(){
        await this.HorizontalAlingmentWordBuilding(this.currentCells[0]);

        for(let i = 0; i < this.currentCells.length; i++){
            await this.VerticalAlingmentBuilding(this.currentCells[i]);
        }
    }

    /**
     * Vertical main alingment recognizing
     */
    async VerticalWordBuilding(){
        await this.VerticalAlingmentBuilding(this.currentCells[0]);

        for(let i = 0; i < this.currentCells.length; i++){
            await this.HorizontalAlingmentWordBuilding(this.currentCells[i]);
        }
    }

    /**
     * Returns value of all words in current turn
     * @returns {number}
     */
    CalculatePointsToCommitValue(){
        let totalPoints = 0;

        this.wordsToCommit.forEach((element) => {
            totalPoints += element.points;
        });

        return totalPoints;
    }

    /**
     * Recognize all words with all putted pieces in the same turn
     * @returns 
     */
    async WordRecognizer(){
        let linearity = {
            horizontal: false,
            vertical: false
        }

        if(!this.LinkWithExistingPieces() || !this.IsLinear(linearity)){
            return 0;
        }

        if(linearity.horizontal){
            await this.HorizontalWordBuilding();
        } else {
            await this.VerticalWordBuilding();
        }
    }

    /**
     * Set piece on board with related coordinates
     * @param {numebr} row Cell's row
     * @param {number} col Cell's col
     * @param {Piece} piece Piece object to place
     */
    PutPieceOnBoard(row, col, piece){
        this.wordsToCommit = [];
        this.board[row][col].piece = piece;
        this.currentCells.push(this.board[row][col]);
    }

    /**
     * Take piece from related coordinates
     * @param {number} row Cell row
     * @param {number} col Cell col
     * @returns {Piece}
     */
    TakePieceFromBoard(row, col){
        this.wordsToCommit = [];
        let piece = this.board[row][col].piece;
        this.board[row][col].piece = null;
        this.currentCells.splice(this.currentCells.findIndex((item, idx, arr) => item.col == col && item.row == row));
        return piece;
    }

    TakeAllPuttedPieces(){
        let pieces = [];
        let cellCoords = [];

        for(let i = this.currentCells.length - 1; i > -1; i--){
            cellCoords.push({
                row: this.currentCells[i].row,
                col: this.currentCells[i].col
            });
            pieces.push(this.TakePieceFromBoard(this.currentCells[i].row, this.currentCells[i].col));
        }

        return {
            pieces: pieces,
            cellCoords: cellCoords
        };
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

    /**
     * Clearing turn buffers
     */
    ClearTurnBuffers(){
        this.currentCells = [];
        this.wordsToCommit = [];
    }

    /**
     * Commit all words and calculate points
     * @returns {number}
     */
    CommitWords(){
        this.wordsToCommit.forEach((element) => {
            this.commitedWords.push(element.word);
        });

        return this.CalculatePointsToCommitValue();
    }
}

module.exports = Board;