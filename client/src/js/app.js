import 'regenerator-runtime';
import Swal from 'sweetalert2';

import store from './store';
import CanvasManager from './canvas';

const state = store.getState();

// dom elements
const $env = $('#env');
const $itemNumber = $('#itemNumber');
const $template = $('#template');
const $output = $('#output');
const $coords = $output.find('.coords');
const $inner = $('#result .inner');
const $save = $('#save');

// instance vars
const canvas = document.getElementById('canvas');
const canvasManager = new CanvasManager({canvas});
const previouslySavedEnv = localStorage.getItem('env');

if (previouslySavedEnv) {
    $env.val(previouslySavedEnv);
}

store.dispatch({
    type: 'SET',
    key : 'env',
    val : $env.val()
});

store.subscribe(() => {
    if (state.textArea) {
        $output.removeClass('d-none');
        $coords.html(`Text Area: ${JSON.stringify(state.textArea)}`);
    } else {
        $output.addClass('d-none');
    }
});

/**
 * handle search form submission
 */
$('form').submit(async function (e) {
    e.preventDefault();

    // convert to uppercase
    const itemNumber = $itemNumber.val().toUpperCase();
    $itemNumber.val(itemNumber);

    if (!itemNumber || itemNumber === state.itemNumber) {
        return false;
    }

    store.dispatch({
        type: 'SET',
        key : 'itemNumber',
        val : itemNumber
    });

    const hits = await search(itemNumber);

    store.dispatch({
        type: 'SET',
        key : 'hits',
        val : hits
    });

    store.dispatch({
        type: 'SET',
        key : 'template',
        val : hits.length ? hits[0].c_templatePortion : null
    });

    populateTemplates(hits);

    if (hits.length) {
        $inner.css('background-image', `url(https://devbuilder.crownawards.com/StoreFront/ImageCompositionServlet?files=jsp/builderimages/plaques/${hits[0].c_templateImage})`);
        $inner.find('h4').addClass('d-none');
        canvas.classList.remove('d-none');

        store.dispatch({
            type: 'SET',
            key : 'textArea',
            val : drawFromHit(hits[0])
        });
    } else {
        canvasManager.clear();
        $inner.css('background-image', '');
        $inner.find('h4').removeClass('d-none');
        canvas.classList.add('d-none');

        Swal.fire({
            icon  : 'error',
            title : 'Oops...',
            text  : 'No Results Found!',
            footer: '<span class="text-primary font-weight-bold">Check your spelling and try again</span>'
        });
    }
});

/**
 * When the template dropdown is changed, we need to update the render
 */
$template.change(function () {
    const hit = state.hits.find((hit) => hit.c_templatePortion === $(this).val());

    if (hit) {
        store.dispatch({
            type: 'SET',
            key : 'template',
            val : $(this).val()
        });
        
        store.dispatch({
            type: 'SET',
            key : 'textArea',
            val : drawFromHit(hit)
        });
    }
});

/**
 * Update the environment we point to when the value changes and save in local storage for persistent reloads
 */
$env.change(function () {
    localStorage.setItem('env', $(this).val());

    store.dispatch({
        type: 'SET',
        key : 'env',
        val : $(this).val()
    });
});

/**
 * Save the engraving area
 */
$save.click(() => {
    const itemIndex = state.hits.findIndex((hit) => hit.c_templatePortion === state.template);

    if (itemIndex === -1) {
        return false;
    }

    const item = state.hits[itemIndex];

    return $.ajax({
        method : 'patch',
        url    : `https://${state.env}-webstore-crownawards.demandware.net/s/-/dw/data/v20_8/custom_objects/EngravingTemplateDetail/${item.c_itemPortion}-${item.c_templatePortion}`,
        headers: {
            'Authorization': `Bearer ${state.accessToken}`,
            'Content-Type' : 'application/json'
        },
        data: JSON.stringify({
            'c_textArea': JSON.stringify(state.textArea)
        })
    })
        .then(() => {
            // alert showing unable to parse text area
            Swal.fire({
                icon : 'success',
                title: 'Saved!',
                text : `${item.c_itemPortion}-${item.c_templatePortion} has been saved to ${state.env}`
            })
                .then(() => {
                    // update item in state with saved coords
                    store.dispatch({
                        type    : 'SET_TEXT_AREA',
                        index   : itemIndex,
                        textArea: state.textArea
                    });
                });
        });
});

/**
 * Helper method to draw rectangle from hit result
 *
 * @param hit
 * @returns {*}
 */
function drawFromHit (hit) {
    try {
        const textArea = JSON.parse(hit.c_textArea);

        return canvasManager.drawRect(...textArea);
    } catch (e) {
        canvasManager.clear();

        Swal.fire({
            icon : 'error',
            title: 'Oops...',
            text : 'The textarea for this template was either missing or contains invalid data and has been reset'
        });
    }
}

/**
 * Populate the 8511 dropdown after search
 *
 * @param hits
 */
function populateTemplates (hits) {
    // clear dropdown of previous results
    $template.empty();

    // populate the dropdown with new 8511 results
    hits.forEach((hit) => {
        $template.append(`<option id="${hit.c_templatePortion}">${hit.c_templatePortion}</option>`);
    });
}

/**
 * Fetch oauth access token
 *
 * @returns {*}
 */
function getAccessToken () {
    return $.ajax({
        method : 'post',
        url    : 'https://account.demandware.com/dw/oauth2/access_token',
        headers: {
            'Authorization': `Basic ${btoa('')}`,
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        data: {
            'grant_type': 'client_credentials'
        }
    }).then((res) => res.access_token);
}

/**
 * Search for templates for a particular item
 *
 * @param itemNumber
 * @returns {Promise<*>}
 */
async function search (itemNumber) {
    if (!state.accessToken) {
        store.dispatch({
            type: 'SET',
            key : 'accessToken',
            val : await getAccessToken()
        });
    }

    return $.ajax({
        method : 'post',
        url    : `https://${state.env}-webstore-crownawards.demandware.net/s/-/dw/data/v20_8/custom_objects_search/EngravingTemplateDetail`,
        headers: {
            'Authorization': `Bearer ${state.accessToken}`,
            'Content-Type' : 'application/json'
        },
        data: JSON.stringify({
            query: {
                'term_query': {
                    'fields'  : ['c_itemPortion'],
                    'operator': 'is',
                    'values'  : [itemNumber]
                }
            },
            'select': '(**)'
        })
    })
        .then((res) => {
            if (res.total === 0) {
                return [];
            }

            return res.hits.map((hit) => {
                return {
                    'id'               : hit.key_value_string,
                    'c_itemPortion'    : hit.c_itemPortion,
                    'c_templatePortion': hit.c_templatePortion,
                    'c_textArea'       : hit.c_textArea,
                    'c_templateImage'  : hit.c_templateImage,
                };
            });
        });
}