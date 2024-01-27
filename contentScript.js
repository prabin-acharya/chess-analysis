console.log("Hello, I am in ContentScript")

function injectLine(from, to) {
    // const allPieces = extractPositionData();
    const chessBoard = document.querySelector('wc-chess-board.board');

    if (!chessBoard) {
        console.error('Chess board not found.');
        return;
    }

    // const piece1 = Array.from(allPieces).find(piece => piece.type === pieceType1);
    // const piece2 = Array.from(allPieces).find(piece => piece.type === pieceType2);
    // console.log(piece1, piece2)


    // if (!piece1 || !piece2) {
    //     console.error(`${pieceType1} or ${pieceType2} not found.`);
    //     return;
    // }

    const svgContainer = chessBoard.querySelector('.arrows');

    if (!svgContainer) {
        console.error('SVG container not found.');
        return;
    }


    console.log(from, to, "+++")

    const piece1X = 100 / 8 * from.col - 100 / 16;
    const piece1Y = 100 / 8 * (9 - from.row) - 100 / 16;

    const piece2X = 100 / 8 * to.col - 100 / 16;
    const piece2Y = 100 / 8 * (9 - to.row) - 100 / 16;

    const length = calculateLength(piece1X, piece1Y, piece2X, piece2Y);
    const bottomLeftPoint = findBottomLeftPoint(piece1X, piece1Y, piece2X, piece2Y)

    const angle = calculateAngle(piece1X, piece1Y, piece2X, piece2Y)
    console.log(angle, "angle")


    const newPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    newPolygon.setAttribute('id', 'custom-line');
    newPolygon.setAttribute('class', 'line');


    const lineWidth = 4;

    // const points = `${piece1X} ${piece1Y}, ${piece2X} ${piece2Y}`;
    // const points = `${piece1X} ${piece1Y - lineWidth / 2}, ${piece2X} ${piece2Y - lineWidth / 2}, ${piece2X} ${piece2Y + lineWidth / 2}, ${piece1X} ${piece1Y + lineWidth / 2}`;
    const points = `${piece1X} ${piece1Y - lineWidth / 2},${piece2X + lineWidth} ${piece2Y - (lineWidth / 2)}, ${piece2X + lineWidth} ${piece2Y - (lineWidth / 2 + lineWidth / 2)},${piece2X} ${piece2Y},${piece2X + lineWidth} ${piece2Y + (lineWidth / 2 + lineWidth / 2)}, ${piece2X + lineWidth} ${piece2Y + lineWidth / 2}, ${piece1X} ${piece1Y + lineWidth / 2}`;

    console.log(points)
    console.log(bottomLeftPoint)

    newPolygon.setAttribute('points', points);
    // newPolygon.setAttribute('style', 'fill: none; stroke: rgba(0, 0, 255, 0.5); stroke-width: 2;');
    newPolygon.setAttribute('style', 'fill: rgba(0, 0, 255, 0.5); stroke: none;');


    svgContainer.appendChild(newPolygon);

    const redPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    redPoint.setAttribute('cx', piece2X);
    redPoint.setAttribute('cy', piece2Y);
    redPoint.setAttribute('r', 1);
    redPoint.setAttribute('fill', 'green');

    svgContainer.appendChild(redPoint);

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


function calculateLength(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    return length;
}

function findBottomLeftPoint(x1, y1, x2, y2) {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
        return { x: x1, y: y1 };
    } else {
        return { x: x2, y: y2 };
    }
}

function calculateAngle(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;

    // Calculate the angle in radians
    const angleRad = Math.atan2(deltaY, deltaX);

    // Convert radians to degrees
    const angleDeg = angleRad * (180 / Math.PI);

    return angleDeg;
}



function logPositionData() {
    const positionData = extractPositionData();
    console.log('Chess Piece Position Data:', positionData);
}



// ##################################################################### 

setTimeout(() => {
    logPositionData();
    // injectLine('white-king', 'black-knight')
}, 3000);







const getSuggestedMove = () => {
    let suggestedMove = ""
    const analysisLinesElement = document.querySelector('.analysis-view-lines');

    if (analysisLinesElement) {
        const engineLineComponentElement = analysisLinesElement.querySelector('.engine-line-component');

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
                console.log("no engine line node--------------")
            }
        }
    }

    return suggestedMove;
};

const mutationCallback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const suggestedMove = getSuggestedMove()

            const existingPolygon = document.getElementById("custom-line");

            if (existingPolygon) {
                existingPolygon.remove();
            }
            if (suggestedMove) {
                const allPieces = extractPositionData();
                const suggestedFrom = suggestedMove.split(" ")[0]
                const suggestedFromRowCol = Array.from(allPieces).find(piece => piece.type === suggestedFrom)
                const suggestedTo = suggestedMove.split(" ")[1].substring(suggestedMove.split(" ")[1].length - 2)
                const piece1 = Array.from(allPieces).find(piece => piece.type === suggestedFrom);
                const suggestedToRowCol = { col: letterToNumber(suggestedTo[0]), row: parseInt(suggestedTo[1], 10) }
                console.log(piece1, "  to ", suggestedToRowCol)
                injectLine(suggestedFromRowCol, suggestedToRowCol)
            }
        }
    }
};



// Optionally, you can disconnect the observer when it's no longer needed
// observer.disconnect();


setTimeout(() => {
    // getSuggestedMove()

    const topElementToObserve = document.querySelector('.engine-line-component');

    const observer = new MutationObserver(mutationCallback);

    const observerConfig = { childList: true };

    observer.observe(topElementToObserve, observerConfig);

}, 3000)




function letterToNumber(letter) {
    letter = letter.toLowerCase();
    const baseCharCode = 'a'.charCodeAt(0);
    const numericValue = letter.charCodeAt(0) - baseCharCode + 1;
    return numericValue;
}