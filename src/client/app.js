const {
    init,
    render
} = require('client/main')

function loop() {
    requestAnimationFrame(loop);
    render();
}

init();
loop();