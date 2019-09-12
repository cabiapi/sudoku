const insertSudoku = require('./knex');

const prepis = () => {
    let t0 = Date.now();
    let [x, y, sol] = createPuzzle();
    let home = document.getElementById('minimal');
    if (home && home.checked) {
        sol = minimalize(sol);
    }
    let t1 = Date.now();
    let puzzle = rewriteToGrid(sol);
    for (let i = 0; i < 81; i++) {
        let id = String(Math.floor(i/9)) + String(i%9);
        let td = document.getElementById(id);
        td.style.color = "black";
        if (puzzle[Math.floor(i/9)][i%9] !== 0) {
            td.innerText = puzzle[Math.floor(i/9)][i%9];
        } else {
            td.innerText = "";
        }
    }
    if (home) {
        let p = document.getElementById("time");
        p.innerText = `Time of creation: ${t1 - t0} ms`;
        p = document.getElementById("clues");
        p.innerText = `Number of clues: ${sol.length}`;
        p = document.getElementById("oneliner");
        let oneliner = "";
        for (let i = 0; i < 9; i++) {
            for (j = 0; j < 9; j++) {
                oneliner += puzzle[i][j] !== 0 ? String(puzzle[i][j]) : ".";
            }
        }
        p.innerText = oneliner;
        insertSudoku(oneliner, Boolean(home.checked));
    }

}

const velkaMatica = () => {
    let a = [];
    for (let i = 0; i < 729; i++) {
        a[i] = new Array(324).fill(0);
        a[i][Math.floor(i/9)] = 1;
        a[i][81 + 9*(Math.floor(i/81)) + i%9] = 1;
        a[i][162 + i%81] = 1;
        a[i][243 + i%9 + 9*Math.floor((i%81)/27) + 27*Math.floor(i/243)] = 1;
    }
    return a;
}

const select = (x, y, r) => {
    let cols = [];
    y[r].forEach(i => {
        x[i].forEach(j => {
            y[j].forEach(k => {
                if (k != i) {
                    //console.log("toto je k: " , k);
                    let c = x[k].indexOf(j);
                    if (c >= 0) {
                        x[k].splice(c, 1);
                    }
                }
            })
        })
        cols.push(x[i]);
        delete x[i];
    });
    return cols;
}

const deselect = (x, y, r, cols) => {
    y[r].reverse().forEach(i => {
        x[i] = cols.pop();
        x[i].forEach(j => {
            y[j].forEach(k => {
                if (k !== i) {
                    x[k].push(j);
                }
            })
        })
    })
    y[r].reverse();
}

const solve = (x, y, solution=[], firstTime = true) => {
    if (firstTime) {
        solve.riesenia = [];
        solve(x, y, solution, false);
        return solve.riesenia;
    }
    if (solve.riesenia.length > 1) {
        return;
    }
    if(Object.keys(x).length === 0) {
        let a = []
        for (let i = 0; i < solution.length; i++) {
            a.push(solution[i]);
        }
        solve.riesenia.push(a);

    } else {
        let c = Object.keys(x).reduce((a, b) => x[a].length > x[b].length ? b : a);
        x[c].forEach(r => {
            solution.push(r);
            let cols = select(x, y, r);
            solve(x, y, solution, false);
            deselect(x, y, r, cols);
            solution.pop();
        })
    }
}

const exact_cover = (x, y) => {
    let b = {};
    x.forEach(e => b[e] = []);
    for (k in y) {
        y[k].forEach(j => {
            b[j].push(k);
        })
    }
    return [b, y];
}

const prepisNaObjekt = (matica) => {
    const r = matica.length;
    const s = matica[0].length;
    let y = {};
    for (let i = 0; i < r; i++) {
        y[i] = [];
        for (let j = 0; j < s; j++) {
            if (matica[i][j] === 1) {
                y[i].push(j);
            }
        }
    }
    return y;
}

const prepare = (sudoku) => {
    let a = [...Array(324).keys()];
    let b = prepisNaObjekt(velkaMatica());
    [a, b] = exact_cover(a, b);
    let cols = [];
    for (let i = 0; i < sudoku.length; i++) {
        if (sudoku[i] !== '0') {
            let c = 9*i + Number(sudoku[i]) - 1;
            cols.push(c);
            b[c].forEach(j => {
                a[j].forEach(k => {
                    b[k].forEach(l => {
                        if (l != j) {
                            let d = a[l].indexOf(k);
                            if (d >= 0) {
                                a[l].splice(d, 1);
                            }
                        }
                    })
                })
                delete a[j];
            });
        }
    }
    return [a, b, cols];
}

const rewriteToGrid = (sol) => {
    let a = [];
    for (let i = 0; i < 9; i++) {
        a[i] = new Array(9).fill(0);
    }
    for (let j = 0; j < sol.length; j++) {
        let u = Number(sol[j]);
        a[Math.floor(Math.floor(u/9)/9)][Math.floor(u/9)%9] = u%9 + 1;
    }
    return a;
}

const pushClues = (numOfClues, a, b, solution = [], remainingRows = [...Array(729).keys()]) => {
    for (let i = 0; i < numOfClues; i++) {
        let c = Math.floor(Math.random() * remainingRows.length);
        let m = remainingRows[c];
        solution.push(m);
        remainingRows.splice(c, 1);
        b[m].forEach(j => {
            a[j].forEach(k => {
                b[k].forEach(l => {
                    if (l != j) {
                        let d = a[l].indexOf(k);
                        if (d >= 0) {
                            a[l].splice(d, 1);
                        }
                        d = remainingRows.indexOf(Number(k));
                        if (d >= 0) {
                            remainingRows.splice(d, 1);
                        }
                    }
                });
            });
            delete a[j];
        });
    }
    return [a, b, solution, remainingRows];
}

const createPuzzle = () => {
    let solutions = [];
    let remRows = [...Array(729).keys()];
    let sol = [];
    let x = [...Array(324).keys()];
    let y = prepisNaObjekt(velkaMatica());
    [x, y] = exact_cover(x, y);
    let X, Y, S, R;
    while (solutions.length !== 1) {
        if (solutions.length > 1 || sol.length === 0) {
            let c;
            switch(Math.floor(sol.length / 8)) {
                case 0: c = 7; break;
                case 1: c = 5; break;
                case 2: c = 3; break;
                default: c = 2;
            }
            X = JSON.parse(JSON.stringify(x));
            Y = JSON.parse(JSON.stringify(y));
            S = sol.slice();
            R = remRows.slice();
            [x, y, sol, remRows] = pushClues(c, x, y, sol, remRows);
        } else {
            x = JSON.parse(JSON.stringify(X));
            y = JSON.parse(JSON.stringify(Y));
            sol = S.slice();
            remRows = R.slice();
            [x, y, sol, remRows] = pushClues(1, x, y, sol, remRows);
        }
        solutions = solve(x, y, sol);
    }
    return [x, y, sol];
}

const minimalize = (sol) => {         // zmakne to asi za 100 ms, je to na hovno spravene ... ale slape aspon
    sol.forEach(e => {
        let x = [...Array(324).keys()];
        let y = prepisNaObjekt(velkaMatica());
        [x, y] = exact_cover(x, y);
        let solution = sol.slice();
        solution.splice(solution.indexOf(e), 1);
        solution.forEach(m => {
            y[m].forEach(j => {
                x[j].forEach(k => {
                    y[k].forEach(l => {
                        if (l != j) {
                            let d = x[l].indexOf(k);
                            if (d >= 0) {
                                x[l].splice(d, 1);
                            }
                        }
                    });
                });
                delete x[j];
            });
        })
        let sls = solve(x, y, solution);
        if (sls.length === 1) {
            sol.splice(sol.indexOf(e), 1);
        }
    })
    return sol;
}

