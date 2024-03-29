console.log("Hello, I am in ContentScript")

function drawLine(from, to, index) {
    const chessBoard = document.querySelector('wc-chess-board.board');

    if (!chessBoard) {
        console.error('Chess board not found.');
        return;
    }

    const piece1X = 100 / 8 * from.col - 100 / 16;
    const piece1Y = 100 / 8 * (9 - from.row) - 100 / 16;

    let piece2X = 100 / 8 * to.col - 100 / 16;
    let piece2Y = 100 / 8 * (9 - to.row) - 100 / 16;

    // console.log("x1, y1, x2, y2 endpoints of arrow: ", piece1X, piece1Y, piece2X, piece2Y)

    const length = calculateLength(piece1X, piece1Y, piece2X, piece2Y);
    const angle = calculateAngle(piece1X, piece1Y, piece2X, piece2Y)  // angle with x-axis in clockwise direction, range [0, 360)

    piece2X = piece1X + length
    piece2Y = piece1Y

    // console.log("angle: ", angle, " length: ", length)

    const newPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const id = "custom-line" + index
    newPolygon.setAttribute('id', id);
    newPolygon.setAttribute('class', 'line');

    const lineWidth = 2;

    const points = `${piece1X} ${piece1Y - lineWidth / 2}, ${piece2X - lineWidth} ${piece2Y - lineWidth / 2}, ${piece2X - lineWidth} ${piece2Y - (lineWidth / 2 + lineWidth / 2)},${piece2X} ${piece2Y},${piece2X - lineWidth} ${piece2Y + (lineWidth / 2 + lineWidth / 2)}, ${piece2X - lineWidth} ${piece2Y + lineWidth / 2}, ${piece1X} ${piece1Y + lineWidth / 2}`;

    // console.log("points of polygon", points)
    const colors = [
        'rgb(48, 132, 216, 1)',
        'rgb(48, 132, 216, 0.8)',
        'rgb(48, 132, 216, 0.6)',
        'rgb(48, 132, 216, 0.4)',
        'rgb(48, 132, 216, 0.2)'
    ];

    newPolygon.setAttribute('points', points);
    newPolygon.setAttribute('style', `fill: ${colors[index]}; stroke: none;`);
    newPolygon.style.zIndex = "999999";
    newPolygon.style.transformOrigin = `${piece1X}px ${piece1Y}px`;
    newPolygon.style.transform = `rotate(${angle}deg)`;


    const coordinates = document.querySelector('.coordinates');

    if (!coordinates) {
        console.log('coordinates div not found.');
        return;
    }

    coordinates.appendChild(newPolygon)
}


function extractPositionData() {
    const chessBoard = document.querySelector('wc-chess-board.board');

    if (!chessBoard) {
        console.error('Chess board not found.');
        return [];
    }

    const chessPieces = chessBoard.querySelectorAll('.piece');

    const positionData = [];

    chessPieces.forEach(piece => {
        const classList = piece.classList;
        const pieceType = getPieceType(classList);

        let squareClass = '';
        for (let i = 0; i < classList.length; i++) {
            if (classList[i].startsWith('square-')) {
                squareClass = classList[i];
                break;
            }
        }

        const [col, row] = squareClass.split('-')[1].split('');

        const pieceData = {
            type: pieceType,
            col: parseInt(col, 10),
            row: parseInt(row, 10),
        };

        positionData.push(pieceData);
    });

    return positionData;
}

function calculateLength(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    return length;
}


// ##################################################################### 

const getSuggestedMove = () => {
    let suggestedMove = ""
    const allSuggestedMoves = []

    const analysisLinesElement = document.querySelector('.analysis-view-lines');

    if (analysisLinesElement) {
        const engineLineComponentElements = analysisLinesElement.querySelectorAll('.engine-line-component');


        engineLineComponentElements.forEach(engineLineComponentElement => {
            if (engineLineComponentElement) {
                const engineLineNode = engineLineComponentElement.querySelector(".engine-line-node")

                if (engineLineNode) {
                    const moveNumbering = engineLineNode.querySelector(".move-san-premove").textContent
                    const color = moveNumbering.includes("...") ? "black" : "white"
                    const iconFontChessDiv = engineLineNode.querySelector('.icon-font-chess');

                    if (iconFontChessDiv) {
                        const pieceName = Array.from(iconFontChessDiv.classList).filter(className => className !== 'icon-font-chess');
                        const arrangedPieceName = pieceName[1].split("-")[1] + "-" + pieceName[1].split("-")[0]
                        suggestedMove += arrangedPieceName + " "
                    } else {
                        suggestedMove += color + "-" + "pawn" + " "
                    }

                    const suggestedMoveText = engineLineNode.querySelector('.move-san-san').textContent

                    if (suggestedMoveText) {
                        suggestedMove += suggestedMoveText
                    } else {
                        const suggestedMoveText = engineLineNode.querySelector('.move-san-afterfigurine').textContent

                        if (suggestedMoveText) {
                            suggestedMove += suggestedMoveText;
                        }
                    }
                } else {
                    // console.log("no engine line node--------------")
                }
            }

            allSuggestedMoves.push(suggestedMove)
            suggestedMove = ""
        })
    }

    // console.log(allSuggestedMoves, "allSuggestedMovesByEngines")

    return allSuggestedMoves;
};

const mutationCallback = (mutationsList, observer) => {
    // console.log("after a move-----------------------")
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const suggestedMoves = getSuggestedMove()

            removeAllArrowsFromBoard()

            suggestedMoves.forEach((suggestedMove, index) => {
                if (suggestedMove) {
                    const movingPieceName = suggestedMove.split(" ")[0]
                    const pieceDestinationContainer = suggestedMove.split(" ")[1]

                    let suggestedTo = suggestedMove.split(" ")[1]
                    if (movingPieceName.split("-")[1] == "pawn") {
                        if (suggestedTo.length == 4) {
                            suggestedTo = suggestedTo.substring(2, 4)
                        }
                    } else {
                        if (suggestedTo.length == 3) suggestedTo = suggestedTo.substring(1)
                        else if (suggestedTo.length == 4) suggestedTo = suggestedTo.substring(1, 3)
                    }

                    const suggestedToRowCol = { col: letterToNumber(suggestedTo[0]), row: parseInt(suggestedTo[1], 10) }

                    const allPieces = extractPositionData();
                    let suggestedFromRowCol = Array.from(allPieces).filter(piece => piece.type === movingPieceName)

                    // pawn
                    if (movingPieceName.split("-")[1] == "pawn") {
                        if (pieceDestinationContainer.length == 2)
                            suggestedFromRowCol = suggestedFromRowCol.filter(piece => piece.col == suggestedToRowCol.col)
                        else {
                            suggestedFromRowCol = suggestedFromRowCol.filter(piece => {
                                if (piece.col == letterToNumber(pieceDestinationContainer[0])) {
                                    if (Math.abs(piece.row - suggestedToRowCol.row) == 1) return piece
                                }
                            }
                            )
                        }
                    }

                    if (movingPieceName.split("-")[1] == "knight") {
                        suggestedFromRowCol = suggestedFromRowCol.filter(piece => {
                            if (Math.abs(piece.row - suggestedToRowCol.row) == 1 && Math.abs(piece.col - suggestedToRowCol.col) == 2) return piece
                            if (Math.abs(piece.row - suggestedToRowCol.row) == 2 && Math.abs(piece.col - suggestedToRowCol.col) == 1) return piece
                        })
                    }

                    if (movingPieceName.split("-") == "rook") {
                        suggestedFromRowCol = suggestedFromRowCol.filter(piece => {
                            if (piece.row == suggestedToRowCol.row || piece.col == suggestedToRowCol.col) return piece
                        })
                    }

                    drawLine(suggestedFromRowCol[0], suggestedToRowCol, index)
                }
            })
        }
    }
};



// Optionally, you can disconnect the observer when it's no longer needed
// observer.disconnect();


function checkElementLoaded() {
    const AnalysisViewLines = document.querySelector('.analysis-view-lines');
    if (AnalysisViewLines) {
        clearInterval(intervalId);
        console.log('Element loaded');

        const topElementToObserve = AnalysisViewLines.querySelector('.engine-line-component');
        console.log(topElementToObserve, "engine-line-component---timer")


        const observer = new MutationObserver(mutationCallback);

        const observerConfig = { childList: true };

        console.log(topElementToObserve, "**")

        observer.observe(topElementToObserve, observerConfig);

    } else {
        console.log('Element not loaded yet');
    }
}

const intervalId = setInterval(checkElementLoaded, 1000);




const sidebarObserverCallback = (mutationsList, observer) => {
    removeAllArrowsFromBoard()

    const AnalysisViewLines = document.querySelector('.analysis-view-lines');
    if (AnalysisViewLines) {

        const topElementToObserve = AnalysisViewLines.querySelector('.engine-line-component');
        console.log(topElementToObserve, "engine-line-component---sidebar observer")

        const observer = new MutationObserver(mutationCallback);

        const observerConfig = { childList: true };


        observer.observe(topElementToObserve, observerConfig);
    }
}


setTimeout(() => {
    console.log(document.body)
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
}, 15000)


const sidebarViewComponent = document.querySelector(".sidebar-view-component")
console.log(sidebarViewComponent)
const sidebarObserver = new MutationObserver(sidebarObserverCallback)
const sidebarObserverConfig = { childList: true };
sidebarObserver.observe(sidebarViewComponent, sidebarObserverConfig)



// -------------------------------------------------------------------------------------------------

function calculateAngle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

function letterToNumber(letter) {
    letter = letter.toLowerCase();
    const baseCharCode = 'a'.charCodeAt(0);
    const numericValue = letter.charCodeAt(0) - baseCharCode + 1;
    return numericValue;
}


const removeAllArrowsFromBoard = () => {
    const existingPolygon0 = document.getElementById("custom-line0");
    if (existingPolygon0) {
        existingPolygon0.remove();
    }


    const existingPolygon1 = document.getElementById("custom-line1");
    if (existingPolygon1) {
        existingPolygon1.remove();
    }

    const existingPolygon2 = document.getElementById("custom-line2");
    if (existingPolygon2) {
        existingPolygon2.remove();
    }

    const existingPolygon3 = document.getElementById("custom-line3");
    if (existingPolygon3) {
        existingPolygon3.remove();
    }

    const existingPolygon4 = document.getElementById("custom-line4");
    if (existingPolygon4) {
        existingPolygon4.remove();
    }

    const existingPolygon5 = document.getElementById("custom-line5");
    if (existingPolygon5) {
        existingPolygon5.remove();
    }
}

function getPieceType(classList) {
    if (classList.contains('bp')) return 'black-pawn';
    if (classList.contains('bk')) return 'black-king';
    if (classList.contains('bq')) return 'black-queen';
    if (classList.contains('br')) return 'black-rook';
    if (classList.contains('bb')) return 'black-bishop';
    if (classList.contains('bn')) return 'black-knight';


    if (classList.contains('wp')) return 'white-pawn';
    if (classList.contains('wk')) return 'white-king';
    if (classList.contains('wq')) return 'white-queen';
    if (classList.contains('wr')) return 'white-rook';
    if (classList.contains('wb')) return 'white-bishop';
    if (classList.contains('wn')) return 'white-knight';

    return '';
}


//  origin(0,0) is at the top left

