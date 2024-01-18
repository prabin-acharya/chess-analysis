console.log("Hello I am inserted")

window.addEventListener("load", function () {
    const chessboard = document.querySelector(".board");

    if (chessboard) {
        const observer = new MutationObserver(function (mutationsList) {
            for (const mutation of mutationsList) {
                if (mutation.target.classList.contains("board")) {
                    const positions = getBoardPositions();
                    console.log("Current Board Positions:", positions);
                }
            }
        });

        const observerConfig = { attributes: true, childList: true, subtree: true };
        observer.observe(chessboard, observerConfig);
    }
});

function getBoardPositions() {
    // Implement logic to extract board positions from the existing chessboard
    // You may need to inspect the structure of the chess.com page to achieve this
    // An example: const positions = extractPositionsFromChessboard();
    // Return the positions
    return positions;
}