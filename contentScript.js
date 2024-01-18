console.log("Hello, I am in ContentScript")

function injectLine(pieceType1, pieceType2) {
    const allPieces = extractPositionData();
    const chessBoard = document.querySelector('wc-chess-board.board');

    if (!chessBoard) {
        console.error('Chess board not found.');
        return;
    }

    const piece1 = Array.from(allPieces).find(piece => piece.type === pieceType1);
    const piece2 = Array.from(allPieces).find(piece => piece.type === pieceType2);
    console.log(piece1, piece2)


    if (!piece1 || !piece2) {
        console.error(`${pieceType1} or ${pieceType2} not found.`);
        return;
    }

    const svgContainer = chessBoard.querySelector('.arrows');

    if (!svgContainer) {
        console.error('SVG container not found.');
        return;
    }


    const piece1X = 100 / 8 * piece1.col - 100 / 16;
    const piece1Y = 100 / 8 * (9 - piece1.row) - 100 / 16;

    const piece2X = 100 / 8 * piece2.col - 100 / 16;
    const piece2Y = 100 / 8 * (9 - piece2.row) - 100 / 16;

    const newPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    newPolygon.setAttribute('id', 'custom-line');
    newPolygon.setAttribute('class', 'line');

    const points = `${piece1X} ${piece1Y}, ${piece2X} ${piece2Y}`;

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

        const [col, row] = squareClass.split('-')[1].split('');

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
    logPositionData();
    injectLine('white-rook', 'white-king')
}, 3000);





