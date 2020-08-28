let canvas = null;
let ctx = null;

/**
 * Draw a rectangle on the canvas
 * @param lastMouseX
 * @param lastMouseY
 * @param width
 * @param height
 */
export const drawRectangle = (lastMouseX, lastMouseY, width, height) => {
    ctx.clearRect(0,0, canvas.width, canvas.height); //clear canvas
    ctx.beginPath();

    ctx.rect(lastMouseX, lastMouseY, width, height);

    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;
    ctx.stroke();

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#007bff';
    ctx.fill();
};

/**
 * Initialize event handlers for the canvas
 *
 * @param c
 * @returns {boolean}
 */
export default (c) => {
    canvas = c;

    if (!canvas || (canvas.offsetWidth === 0 && canvas.offsetHeight === 0)) {
        return false;
    }

    ctx = canvas.getContext('2d');

    const canvasX = $(canvas).offset().left;
    const canvasY = $(canvas).offset().top;
    const $output = $('#output');
    const $coords = $output.find('.coords');

    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let width = 0;
    let height = 0;
    let mousedown = false;

    // handle mouse down
    $(canvas).on('mousedown', (e) => {
        lastMouseX = parseInt(e.clientX - canvasX);
        lastMouseY = parseInt(e.clientY - canvasY);

        // reset width and height to 0 because we are drawing a new box
        width = 0;
        height = 0;

        mousedown = true;
    });

    // handle mouse up
    $(canvas).on('mouseup', () => {
        mousedown = false;

        if (width !== 0 && height !== 0) {
            $output.removeClass('d-none');
            $output.find('button').removeClass('d-none');

            if (mouseX < lastMouseX) {
                mouseX = mouseX ^ lastMouseX;
                lastMouseX = lastMouseX ^ mouseX;
            }

            if (mouseY < lastMouseY) {
                mouseY = mouseY ^ lastMouseY;
                lastMouseY = lastMouseY ^ mouseY;
            }

            $coords.html(`Coordinates: [${lastMouseX}, ${lastMouseY}, ${Math.abs(width)}, ${Math.abs(height)}]`);
        }
    });

    // handle mouse move
    $(canvas).on('mousemove', (e) => {
        if (mousedown) {
            mouseX = parseInt(e.clientX - canvasX);
            mouseY = parseInt(e.clientY - canvasY);

            width = mouseX - lastMouseX;
            height = mouseY - lastMouseY;

            drawRectangle(lastMouseX, lastMouseY, width, height);
        }
    });

    return true;
};