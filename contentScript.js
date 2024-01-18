console.log("Hello, I am in ContentScript")

function injectLine(allPieces) {
    const chessBoard = document.querySelector('wc-chess-board.board');

    if (!chessBoard) {
        console.error('Chess board not found.');
        return;
    }

    const blackQueen = Array.from(allPieces).find(piece => piece.type == "black-king")
    const whiteQueen = Array.from(allPieces).find(piece => piece.type == "white-king")
    console.log(blackQueen, whiteQueen)

    if (!blackQueen || !whiteQueen) {
        console.error('Black or white queen not found.');
        return;
    }

    const svgContainer = chessBoard.querySelector('.arrows');

    if (!svgContainer) {
        console.error('SVG container not found.');
        return;
    }




    // Calculate relative positions based on the chess pieces and the entire board
    const blackQueenX = 100 / 8 * (blackQueen.col) - 100 / 16
    const blackQueenY = 100 / 8 * (blackQueen.row) - 100 / 16


    const whiteQueenX = 100 / 8 * (whiteQueen.col) - 100 / 16
    const whiteQueenY = 100 / 8 * (whiteQueen.row) - 100 / 16



    const newPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    newPolygon.setAttribute('id', 'custom-line');
    newPolygon.setAttribute('class', 'line');

    // Points to draw a line as a polygon
    const points = `${blackQueenX},${blackQueenY} ${whiteQueenX},${whiteQueenY}`;

    newPolygon.setAttribute('points', points);
    newPolygon.setAttribute('style', 'fill: none; stroke: black; stroke-width: 3;');

    svgContainer.appendChild(newPolygon);
}


function injectArrow() {
    const newPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    newPolygon.setAttribute('id', 'custom-arrow');
    newPolygon.setAttribute('class', 'arrow');
    newPolygon.setAttribute('transform', 'rotate(30 50 50)');
    newPolygon.setAttribute('points', '40 50, 50 30, 60 50');
    newPolygon.setAttribute('style', 'fill: blue; opacity: 0.7;');

    const chessBoard = document.querySelector('wc-chess-board.board');
    if (chessBoard) {
        const svgContainer = chessBoard.querySelector('.arrows');
        if (svgContainer) {
            svgContainer.appendChild(newPolygon);
        }
    }
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

        const [row, col] = squareClass.split('-')[1].split('');

        const pieceData = {
            type: pieceType,
            row: parseInt(row, 10),
            col: parseInt(col, 10),
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




function logPositionData() {
    const positionData = extractPositionData();
    console.log('Chess Piece Position Data:', positionData);
}



// ##################################################################### 

injectArrow();
setTimeout(() => {
    console.log('Hello');

    logPositionData();
    const allPieces = extractPositionData();
    injectLine(allPieces)
}, 3000);





