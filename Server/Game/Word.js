class Word {
    /**
     * @type {string}
     */
    word;

    /**
     * @type {Cell[]}
     */
    cells;

    /**
     * @type {number}
     */
    points;

    constructor(word, cells, points){
        this.word = word;
        this.cells = cells;
        this.points = points;
    }
}

module.exports = Word;