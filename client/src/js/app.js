console.log('Loaded! 😀'); // eslint-disable-line no-console

import initCanvas from './init_canvas';
import {drawRectangle} from './init_canvas';

const canvas = document.getElementById('canvas');
const $inner = $('#result .inner');

// tells us if the canvas is initialized
let canvasInitialized = initCanvas(canvas);

/**
 * Load the default engraving area for a product if it exists
 *
 * @param data
 * @returns {boolean}
 */
const loadDefault = (points, image) => {
    $inner.css('background-image', `url(${image})`);

    if (!points || !(points instanceof Array) || points.length !== 4) {
        return false;
    }

    if (!canvasInitialized) {
        canvas.classList.remove('d-none');
        $inner.find('h4').addClass('d-none');
        canvasInitialized = initCanvas(canvas);

        if (!canvasInitialized) {
            return false;
        }
    }

    drawRectangle(...points);

    const $output = $('#output');
    const $coords = $output.find('.coords');

    $coords.html(`Coordinates: ${JSON.stringify(points)}`);
    $output.removeClass('d-none');
};

$('form').submit(function (e) {
    e.preventDefault();

    const itemNumber = $(this).find('#itemNumber').val().toUpperCase();

    if (!itemNumber) {
        return false;
    }

    // fetch all 8511s for this item and store all data in a state
    // load 8511 values into dropdown
    // load first background
    // initialize canvas if not already
    // draw existing rectangle if coordinates exist
});

// test code
$('#test').click((e) => {
    e.preventDefault();

    loadDefault([50, 54, 227, 304], 'https://devbuilder.crownawards.com/StoreFront/ImageCompositionServlet?files=jsp/builderimages/plaques/LUCBB4_eng.png');
});