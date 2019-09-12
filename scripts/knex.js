const knex = require('./connection');

const insertSudoku = async (sudoku, minimal) => {
    try {
        const response = await knex('sudoku').insert({
            sudoku,
            minimal,
        });
        console.log('Sudoku inserted !');
    } catch(err) {
        console.log(err);
    }
}

module.exports = insertSudoku;