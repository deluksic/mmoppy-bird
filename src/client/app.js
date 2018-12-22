const {
    init,
    render,
    playerAction
} = require('client/main')

function loop() {
    requestAnimationFrame(loop);
    render();
}

init();
loop();