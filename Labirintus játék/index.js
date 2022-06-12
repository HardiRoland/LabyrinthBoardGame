const menu = document.querySelector('#menu');
const playerNumber = document.querySelector('#playerNumber');
const playerNumError = document.querySelector('#playerNumError');
const treasureNumber = document.querySelector('#treasureNumber');
const treasureNumError = document.querySelector('#treasureNumError');
const startButton = document.querySelector('#startButton');
const descriptionButton = document.querySelector('#descriptionButton');
const description = document.querySelector('#description');
const restartButton = document.querySelector('#restartButton');
const gameBoard = document.querySelector('#gameBoard');
const hud = document.querySelector('#hud');
const game = document.querySelector('#game');
const nextPlayer = document.querySelector("#nextPlayer");

descriptionButton.addEventListener('click', descriptionAppear);
startButton.addEventListener('click', gameStart);
gameBoard.addEventListener('click', turn);
document.addEventListener('contextmenu', plusItemSpin);
restartButton.addEventListener('click', restart);

game.style.display = "none";

let playerNum;
let treasureNum;

let model = new Array(9);
for (let i = 0; i < 9; i++) {
    model[i] = new Array(9);
}
let players = new Array();
let currentTreasures = new Array();

let movingPhase = false;
let gameOver = false;
let treasureOnPlusItem = false;

let currentPlayer = 0;

let plusItem = { type: "turn", rotate: 0 };
let tmp = { type: "turn", rotation: 0 };

const corners = [{x : 1, y : 1, r : 3}, {x : 1, y : 7, r : 0}, {x : 7, y : 1, r : 2}, {x : 7, y : 7, r : 1}];
const playerColors = ["Piros", "Zöld", "Kék", "Fekete"]
const fixfields = [{x : 1, y : 3, r : 0}, {x : 1, y : 5, r : 0}, {x : 3, y : 1, r : 3}, {x : 3, y : 3, r : 3}, {x : 3, y : 5, r : 2}, {x : 3, y : 7, r : 1}, {x : 5, y : 1, r : 3}, {x : 5, y : 3, r : 0}, {x : 5, y : 5, r : 1}, {x : 5, y : 7, r : 1}, {x : 7, y : 3, r : 2}, {x : 7, y : 5, r : 2}];
const arrows = [{x : 0, y : 2, r : 0}, {x : 0, y : 4, r : 0}, {x : 0, y : 6, r : 0}, {x : 2, y : 0, r : 3}, {x : 4, y : 0, r : 3}, {x : 6, y : 0, r : 3}, {x : 8, y : 2, r : 2}, {x : 8, y : 4, r : 2}, {x : 8, y : 6, r : 2}, {x : 2, y : 8, r : 1}, {x : 4, y : 8, r : 1}, {x : 6, y : 8, r : 1}];
const types = ["turn", "straight", "intersection"];

function gameStart() {
    playerNum = playerNumber.value;
    treasureNum = treasureNumber.value;

    if(checkingInputs()) return;
    menu.style.display = "none";
    description.style.display = "none";
    restartButton.style.display = "none";
    game.style.display = "block";
    createPlayers();
    createModel();
    reloadTable();
}

function checkingInputs() {
    playerNumError.innerText = "";
    treasureNumError.innerText = "";

    if(playerNum > 4 || playerNum < 1 || playerNum != parseInt(playerNum)) {
        playerNumError.innerText = "1 és 4 közötti egész számot adjon meg!";
        return true;
    }

    if(treasureNum < 1 || treasureNum > 24 / playerNum || treasureNum != parseInt(treasureNum)) {
        treasureNumError.innerText = "1 és " + 24 / playerNum + " közötti egész számot adjon meg!";
        return true;
    }

    return false;
}

function createPlayers() {
    for (let i = 0; i < playerNum; i++) {
        players.push({color: playerColors[i], collected: 0, treasurePos: { x: 0, y: 0 }, position: { x : corners[i].x, y : corners[i].y}, startingPoint: { x : corners[i].x, y : corners[i].y}, treasurePlusItem: false});
        createTreasure(players[i]);
    }
}

function createTreasure(player) {
    let x;
    let y;
    let freePlace;
    do {
        freePlace = true;
        x = random(6)+1;
        y = random(6)+1; 
        for (let i = 0; i < corners.length; i++) {
            if(x == corners[i].x && y == corners[i].y) {
                freePlace =false;
            }
        }

        for (let i = 0; i < players.length; i++) {
            if(x == players[i].treasurePos.x && y == players[i].treasurePos.y) {
                freePlace =false;
            }
        }
    }while(!freePlace);

    player.treasurePos.x = x;
    player.treasurePos.y = y;
}

function createModel() {
    let t;
    let tCount = 0;
    const tMax = 15;
    let sCount = 0;
    const sMax = 13;
    let iCount = 0;
    const iMax = 6;

    corners.forEach(e => {
        model[e.x][e.y] = {type: "turn", rotation: e.r, canMoveTo: false};
    });

    fixfields.forEach(e => {
        model[e.x][e.y] = {type: "intersection", rotation: e.r, canMoveTo: false};
    });

    arrows.forEach(e => {
        model[e.x][e.y] = {type: "arrow", rotation: e.r, canMoveTo: false};
    });

    for (let i = 1; i < 8; i++) {
        for (let j = 1; j < 8; j++) {
            if (i % 2 === 0 || j % 2 === 0) {
                let fine = false;
                while (!fine) {
                    t = types[random(3) - 1];
                    if (t === "turn" && tCount < tMax) {
                        fine = true;
                        tCount++;
                    } else if (t === "straight" && sCount < sMax) {
                        fine = true;
                        sCount++;
                    } else if (t === "intersection" && iCount < iMax) {
                        fine = true;
                        iCount++;
                    }
                }
                let r = random(4) - 1;
                model[i][j] = { type: t, rotation: r, canMoveTo: false};
            }
        }
    }

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if(model[i][j] == undefined) {
                model[i][j] = { type: "none", rotation: 0, canMoveTo: false};
            }
        }
    };

    if (tCount < tMax) {
        plusItem = { type: "turn", rotate: (random(4) - 1) };
    } else if (sCount < sMax) {
        plusItem = { type: "straight", rotate: (random(4) - 1) };
    } else if (iCount < iMax) {
        plusItem = { type: "intersection", rotate: (random(4) - 1) };
    }
}

function reloadTable() {
    gameBoard.innerHTML = "";
    hud.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        let tsor = document.createElement("tr");
        for (let j = 0; j < 9; j++) {
            let tcella = document.createElement("td");
            tcella.innerHTML = '<div>';

            for (let k = 0; k < playerNum; k++) {
                if(players[k].treasurePos.x == i && players[k].treasurePos.y == j && !players[k].treasurePlusItem) 
                    tcella.innerHTML += '<div class="gameAsset treasure' + (k + 1) + '"> </div>';
            }

            for (let l = 0; l < playerNum; l++) {
                if(players[l].position.x == i && players[l].position.y == j)
                    tcella.innerHTML += '<div class="gameAsset player' + (l + 1) + '"> </div>';
            }
            tcella.innerHTML += "</div>"
            
            tcella.classList = "cell " + model[i][j].type;
            tcella.style.transform = "rotate(" + (model[i][j].rotation * 90) + "deg)";

            if(model[i][j].canMoveTo) {
                tcella.classList += " canMoveTo";
            }
            tsor.appendChild(tcella);    
        }
        gameBoard.appendChild(tsor);
    }

    let whosonPlusItem = WhosTreasureOnPlusItem();
    let plusItemTreasureText = "";
    if(whosonPlusItem != -1) {
        plusItemTreasureText = '<div class="gameAsset treasure'+(whosonPlusItem+1) + '"></div>';
    }
    hud.innerHTML += '<div class="cell plusItem ' + plusItem.type + '" style="transform:rotate(' + (plusItem.rotate * 90) +'deg);">' + plusItemTreasureText + '</div><div class="plusItemText">A kimaradt elem:</div>';

    for (let i = 0; i < playerNum; i++) {
        let nextTreasureText;
        if(players[i].treasurePos.x === players[i].startingPoint.x && players[i].treasurePos.y === players[i].startingPoint.y) {
            nextTreasureText = " Az összes kincs megvan, térj vissza a kezdőpozíciódra a győzelemhez!(kincsed jelzi, hogy honnan kezdtél)</div>";
        } else if (!players[i].treasurePlusItem){
            nextTreasureText = " Következő kincs: (" + players[i].treasurePos.y + "," + players[i].treasurePos.x + ")</div>"; 
        } else {
            nextTreasureText = " Következő kincs: A kimaradt elemen van!</div>"; 
        }
        hud.innerHTML += "<div>" + players[i].color + " játékos: Összegyűjtött kincsek száma: "+ players[i].collected + "." + nextTreasureText;
    }

    nextPlayer.innerText = players[currentPlayer].color + " játékos következik!";
}

function turn(e) {
    if(e.target.classList.contains('gameAsset')) {
        target = e.target.parentNode;
    } else {
        target = e.target;
    }
    const coords = xyCoord(target);

    if (movingPhase) {
        if(!target.classList.contains('canMoveTo')) return;
        moving(coords);
        canMoveToInit();

        currentPlayer = (currentPlayer + 1) % playerNum;
        movingPhase = false;
    } else {
        if(!e.target.matches('td') || !e.target.classList.contains('arrow')) return;


        const coords = xyCoord(e.target);
        //lefele
        if(coords.x === 0) {

            if(treasureOnPlusItem) {
                players[WhosTreasureOnPlusItem()].treasurePos.x = 0;
                players[WhosTreasureOnPlusItem()].treasurePos.y = coords.y;
                treasureOnPlusItem = false;
                players[WhosTreasureOnPlusItem()].treasurePlusItem = false;
            }

            tmp.type = model[7][coords.y].type;
            tmp.rotation = model[7][coords.y].rotation;
            for (let i = 7; i > 1; i--) {
                model[i][coords.y].type = model[i-1][coords.y].type;     
                model[i][coords.y].rotation = model[i-1][coords.y].rotation;  
                model[i][coords.y].canMoveTo = model[i-1][coords.y].canMoveTo;        
            }
            model[1][coords.y].type = plusItem.type;
            model[1][coords.y].rotation = plusItem.rotate;
            plusItem.type = tmp.type;
            plusItem.rotate = tmp.rotation;

            for (let i = 0; i < playerNum; i++) {
                if(players[i].position.y == coords.y) {
                    if ((players[i].position.x + 1) < 8) {
                        players[i].position.x += 1;
                    } else {
                        players[i].position.x = 1;
                    }
                }

                if(players[i].treasurePos.y == coords.y) {
                    players[i].treasurePos.x += 1;
                    if(players[i].treasurePos.x > 7) {
                        players[i].treasurePlusItem = true;
                        treasureOnPlusItem = true;
                    }
                }
            }
        }
        //felfele
        if(coords.x === 8) {

            if(treasureOnPlusItem) {
                players[WhosTreasureOnPlusItem()].treasurePos.x = 8;
                players[WhosTreasureOnPlusItem()].treasurePos.y = coords.y;
                treasureOnPlusItem = false;
                players[WhosTreasureOnPlusItem()].treasurePlusItem = false;
            }

            tmp.type = model[1][coords.y].type;
            tmp.rotation = model[1][coords.y].rotation;
            for (let i = 1; i < 7; i++) {
                model[i][coords.y].type = model[i+1][coords.y].type;     
                model[i][coords.y].rotation = model[i+1][coords.y].rotation;  
                model[i][coords.y].canMoveTo = model[i+1][coords.y].canMoveTo;            
            }
            model[7][coords.y].type = plusItem.type;
            model[7][coords.y].rotation = plusItem.rotate;
            plusItem.type = tmp.type;
            plusItem.rotate = tmp.rotation;

            for (let i = 0; i < playerNum; i++) {
                if(players[i].position.y == coords.y) {
                    if ((players[i].position.x - 1) > 0) {
                        players[i].position.x -= 1;
                    } else {
                        players[i].position.x = 7;
                    }
                }
                   
                if(players[i].treasurePos.y == coords.y) {
                    players[i].treasurePos.x -= 1;
                    if(players[i].treasurePos.x < 1) {
                        players[i].treasurePlusItem = true;
                        treasureOnPlusItem = true;
                    }
                }
            }
        }
        //balra
        if(coords.y === 0) {

            if(treasureOnPlusItem) {
                players[WhosTreasureOnPlusItem()].treasurePos.x = coords.x;
                players[WhosTreasureOnPlusItem()].treasurePos.y = 0;
                treasureOnPlusItem = false;
                players[WhosTreasureOnPlusItem()].treasurePlusItem = false;
            }

            tmp.type = model[coords.x][7].type;
            tmp.rotation = model[coords.x][7].rotation;
            for (let i = 7; i > 0; i--) {
                model[coords.x][i].type = model[coords.x][i - 1].type;     
                model[coords.x][i].rotation = model[coords.x][i - 1].rotation;  
                model[coords.x][i].canMoveTo = model[coords.x][i - 1].canMoveTo;   
            }
            model[coords.x][1].type = plusItem.type;
            model[coords.x][1].rotation = plusItem.rotate;
            plusItem.type = tmp.type;
            plusItem.rotate = tmp.rotation;

            for (let i = 0; i < playerNum; i++) {
                if(players[i].position.x == coords.x) {
                    if ((players[i].position.y + 1) < 8) {
                        players[i].position.y += 1;
                    } else {
                        players[i].position.y = 1;
                    }
                }
                if(players[i].treasurePos.x == coords.x) {
                    players[i].treasurePos.y += 1;
                    if(players[i].treasurePos.y > 7) {
                        players[i].treasurePlusItem = true;
                        treasureOnPlusItem = true;
                    }
                }

            }
        }
        //jobbra
        if(coords.y === 8) {

            if(treasureOnPlusItem) {
                players[WhosTreasureOnPlusItem()].treasurePos.x = coords.x;
                players[WhosTreasureOnPlusItem()].treasurePos.y = 8;
                treasureOnPlusItem = false;
                players[WhosTreasureOnPlusItem()].treasurePlusItem = false;
            }
            tmp.type = model[coords.x][1].type;
            tmp.rotation = model[coords.x][1].rotation;
            for (let i = 1; i < 7; i++) {
                model[coords.x][i].type = model[coords.x][i + 1].type;     
                model[coords.x][i].rotation = model[coords.x][i + 1].rotation;  
                model[coords.x][i].canMoveTo = model[coords.x][i + 1].canMoveTo;             
            }
            model[coords.x][7].type = plusItem.type;
            model[coords.x][7].rotation = plusItem.rotate;
            plusItem.type = tmp.type;
            plusItem.rotate = tmp.rotation;

            for (let i = 0; i < playerNum; i++) {
                if(players[i].position.x == coords.x) {
                    if ((players[i].position.y - 1) > 0) {
                        players[i].position.y -= 1;
                    } else {
                        players[i].position.y = 7;
                    }
                }

                if(players[i].treasurePos.x == coords.x) {
                    players[i].treasurePos.y -= 1;
                    if(players[i].treasurePos.y < 1) {
                        players[i].treasurePlusItem = true;
                        treasureOnPlusItem = true;
                    }
                }
            }
        }

        whereCanIGo(players[currentPlayer].position.x, players[currentPlayer].position.y);
        movingPhase = true;
        
    }

    if(!gameOver) {
        reloadTable();
    } else {
        restartButton.style.display = "Block";
    }

    
}

function moving(coords) {
    players[currentPlayer].position.x = coords.x;
    players[currentPlayer].position.y = coords.y;

    if(players[currentPlayer].treasurePos.x === coords.x && players[currentPlayer].treasurePos.y === coords.y) {
        if (players[currentPlayer].collected == treasureNum) {
            winner(players[currentPlayer]);
        } else {
            players[currentPlayer].collected++;
            if(players[currentPlayer].collected != treasureNum) {
                createTreasure(players[currentPlayer]);
            } else {
                players[currentPlayer].treasurePos.x = players[currentPlayer].startingPoint.x;
                players[currentPlayer].treasurePos.y = players[currentPlayer].startingPoint.y;
            }
            reloadTable();
        }       
    }
}

function winner(player) {
    canMoveToInit();
    reloadTable();
    document.removeEventListener('contextmenu', plusItemSpin);
    gameBoard.removeEventListener('click', turn);
    nextPlayer.innerText = player.color +" játékos a győztes!";
    gameOver = true;
}

function random(num) {
    return Math.floor((Math.random() * num) + 1);
}

function WhosTreasureOnPlusItem() { 
    for (let i = 0; i < playerNum; i++) {
        if(players[i].treasurePlusItem) {
            return i;
        }
    }
    return -1;
}

function whereCanIGo(x, y) {
    let contains;
    let list = movingOptions(x,y);
    model[x][y].canMoveTo = true;
    for (let i = 0; i < list.length; i++) {
        contains = false;
        neighborCellOption = movingOptions(list[i].x, list[i].y)
        for (let j = 0; j < neighborCellOption.length; j++) {
            if(neighborCellOption[j].x == x && neighborCellOption[j].y == y) {
                contains = true;
            }
        }
        if (contains && model[list[i].x][list[i].y].canMoveTo == false) {
            model[x][y].canMoveTo = true;
            whereCanIGo(list[i].x, list[i].y);
        }
    }
}

function movingOptions(x,y) {
    let list = [];
        if (model[x][y].type == 'turn') {
            if (model[x][y].rotation % 4 === 0) {
                list.push({x : x, y :y-1}); //bal
                list.push({x : x+1, y :y}); //le
            } else if (model[x][y].rotation % 4 === 1) {
                list.push({x : x, y :y-1}); //bal
                list.push({x : x-1, y :y}); //fel
            } else if (model[x][y].rotation % 4 === 2) {
                list.push({x : x, y :y+1}); //jobb
                list.push({x : x-1, y :y}); //fel
            } else if (model[x][y].rotation % 4 === 3) {
                list.push({x : x, y :y+1}); //jobb
                list.push({x : x+1, y :y}); //le
            }
        } else if (model[x][y].type == 'straight') {
            if (model[x][y].rotation % 2 === 0) { // 0, 2
                list.push({x : x, y :y-1}); //bal
                list.push({x : x, y :y+1}); //jobb
            } else {                                //1, 3
                list.push({x : x+1, y :y}); //le
                list.push({x : x-1, y :y}); //fel
            }
        } else if (model[x][y].type == 'intersection') {
            if (model[x][y].rotation % 4 === 0) {
                list.push({x : x, y :y-1}); //bal
                list.push({x : x+1, y :y}); //le
                list.push({x : x, y :y+1}); //jobb
            } else if (model[x][y].rotation % 4 === 1) {
                list.push({x : x, y :y-1}); //bal
                list.push({x : x-1, y :y}); //fel
                list.push({x : x+1, y :y}); //le
            } else if (model[x][y].rotation % 4 === 2) {
                list.push({x : x, y :y+1}); //jobb
                list.push({x : x-1, y :y}); //fel
                list.push({x : x, y :y-1}); //bal
            } else if (model[x][y].rotation % 4 === 3) {
                list.push({x : x, y :y+1}); //jobb
                list.push({x : x+1, y :y}); //le
                list.push({x : x-1, y :y}); //fel
            }
        }
    return list;
}

function descriptionAppear() {
    if (description.hidden === true) {
        description.hidden = false;
      } else {
        description.hidden = true;
      }
}

function restart() {
    location.reload();
}

function plusItemSpin() {
    plusItem.rotate++;
    reloadTable();
}

function canMoveToInit() {
    for (let i = 0; i < model.length; i++) {
        for (let y = 0; y < model[0].length; y++) {
            model[i][y].canMoveTo = false; 
        }
    }
}

function xyCoord(td) {
    const y = td.cellIndex;
    const tr = td.parentNode;
    const x = tr.sectionRowIndex;
    return {x, y};
}