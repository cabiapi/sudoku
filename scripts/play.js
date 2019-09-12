window.addEventListener("keydown", addNumber, false);

let predosleID = -1;
let initialClues = [];

const oznac = (e) => {
    const id = e.target.id;
    if (predosleID !== -1) {
        document.getElementById(predosleID).style.backgroundColor = "white";    
    }
    predosleID = id;
    document.getElementById(id).style.backgroundColor = "#A4D4FF";
}

const vlozCislo = (c) => {
    if (predosleID !== -1) {
        if (!initialClues.includes(predosleID)) {
            let e = document.getElementById(predosleID);
            e.style.color = "red";
            e.style.borderColor = "black";
            e.innerText = c !== 0 ? c : "";
        }
    }
}

function addNumber(e) {
    const c = e.keyCode;
    if (predosleID === -1) {
        if (c >= 37 && c <= 40) {
            oznacSipkou("00");
        }
        return;
    }
    if (c >= 37 && c <= 40) {
        switch(c) {
            case 37:
                if (predosleID[1] !== "0") {
                    oznacSipkou(predosleID[0] + (Number(predosleID[1]) - 1));
                }
                break;
            case 38:
                if (predosleID[0] !== "0") {
                    oznacSipkou((Number(predosleID[0]) - 1) + predosleID[1]);
                }
                break;
            case 39:
                if (predosleID[1] !== "8") {
                    oznacSipkou(predosleID[0] + (Number(predosleID[1]) + 1));
                }
                break;
            case 40:
                if (predosleID[0] !== "8") {
                    oznacSipkou((Number(predosleID[0]) + 1) + predosleID[1]);
                }
                break;
        }
    } else if (!initialClues.includes(predosleID)) {
        let elem = document.getElementById(predosleID);
        if (c >= 49 && c <= 57) {
            elem.style.color = "red";
            elem.style.borderColor = "black";
            elem.innerText = c - 48;
        } else if (c === 8) {
            elem.innerText = "";
        }
    }
}

oznacSipkou = (id) => {
    if (predosleID !== -1) {
        document.getElementById(predosleID).style.backgroundColor = "white";    
    }
    predosleID = id;
    document.getElementById(id).style.backgroundColor = "#A4D4FF";
}

const readGrid = () => {
    let clues = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let id = String(i) + String(j);
            if (document.getElementById(id).innerHTML !== "") {
                clues.push(id);
            }
        } 
    }
    initialClues = clues;
}