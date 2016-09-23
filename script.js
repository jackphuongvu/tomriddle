/*
 *
 * Inspired by a girl, Ms. Jayme Bergman
 *
 */

var TypeWriter = new function () {
    // parent of characters and has methods to update/render/reset all
    this.characters = [];
    this.reset = function () {

    };
}

function Character () {
    // holds functions for updating and rendering characters

}

var paperCanvas = document.getElementById('paper-canvas'),
    paperCtx = paperCanvas.getContext('2d'),
    textCanvas = document.getElementById('text-canvas'),
    textCtx = textCanvas.getContext('2d'),
    cursorCanvas = document.getElementById('cursor-canvas'),
    cursorCtx = cursorCanvas.getContext('2d'),
    cursorInput = document.getElementById('cursor-input'),
    canvases = [paperCanvas, textCanvas, cursorCanvas],
    docElem = document.documentElement,
    keypress_audio = new makeMultiAudio('inc/keypress.mp3'),
    newline_audio = new Audio('inc/return.mp3'),
    chars = [],
    paddingx,
    paddingy,
    posx,
    posy,
    letter_width,
    letter_height,
    letter_size,
    cursorposx,
    cursorposy,
    alpha,
    is_focused,
    jittered_char_pos = {},
    rotated_char_pos = {};

// constants !
var IS_IOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
    IS_TOUCH = ('ontouchstart' in docElem),
    DEVICE_PIXEL_RATIO = window.devicePixelRatio,
    PADDINGMIN = 10,
    PADDINGMAX = 100,
    ALPHA_MAX = 0.7,
    ALPHA_VARIANCE = 0.1,
    LETTER_JITTER = 0.1,
    LETTER_ROTATE = 0.02,
    TEXT_COLOR = '#150904',
    CURSOR_COLOR = '#ea4747',
    NAV_BUTTONS = {
        8: 'moveleft',
        37: 'moveleft',
        38: 'moveup',
        39: 'moveright',
        40: 'movedown',
        13: 'newline',
    },
    NO_AUDIO = {
        8: 'moveleft',
        9: 'TAB',
        16 : 'SHIFT',
        17 : 'CTRL',
        18 : 'ALT',
        20 : 'CAPSLOCK',
        32 : 'SPACE',
        37: 'moveleft',
        38: 'moveup',
        39: 'moveright',
        40: 'movedown'
    };

drawText();

if (!IS_IOS) {
    focus();
}

// event handlers
function focus () {
    is_focused = true;
    updateCursor();
    cursorInput.value = ' ';
    if (IS_IOS) {
        // ios can' focus in a timeout
        // but other os's need a timeout or a freakout
        cursorInput.focus();
    } else {
        setTimeout(function () {
            cursorInput.focus();
        }, 150);
    }
}

function blur () {
    is_focused = false;
    removeCursor();
    cursorInput.blur();
}

document.addEventListener('touchstart', function (e) {
    var e = e.changedTouches[0];
    if (is_focused) {
        blur();
    } else {
        if (chars.length) {
            posx = e.clientX;
            posy = e.clientY;
        }
        focus();
    }
});

document.addEventListener('click', function (e) {
    if (is_focused) {
        blur();
    } else {
        posx = e.offsetX;
        posy = e.offsetY;
        focus();
    }
});

cursorInput.addEventListener('keydown', function (e) {
    var no_audio = NO_AUDIO[ e.which ];
    
    if (!no_audio) {
        if (e.which == 13) {
            newline_audio.play();
        } else {
            keypress_audio.play();
        }
        return true;
    } 
    
    if (no_audio == 'TAB') {
        /* refocus */
        setTimeout(focus, 10);
    }
});

cursorInput.addEventListener('keyup', function (e) {
    var nav_button = NAV_BUTTONS[e.which],
        value = nav_button || this.value.substr(1);

    if (!value) return;

    // wipe input to handle one character at a time.
    // leave a single space so that mobile isn't forced to upper case
    this.value = ' ';

    if (nav_button) {

        updateCursor( value );

    } else {

        // update multiple characters in case they keydown more than keyup
        for (var i = 0, len = value.length; i < len; i++) {
            var single_char = value[i];

            if (!jittered_char_pos[single_char]) {
                // save general position
                jittered_char_pos[single_char] = randRange(-LETTER_JITTER, LETTER_JITTER);
                rotated_char_pos[single_char] = randRange(-LETTER_ROTATE, LETTER_ROTATE);
            }

            addToChars(single_char);
            updateCursor('moveright');
        }
    }
});

function drawText () {
    var _chars = chars;

    // resize
    for (var i = 0, len = canvases.length; i < len; i++) {
        var canvas = canvases[ i ];
        canvas.width = innerWidth;
        canvas.height = innerHeight;

        // make Canvas Retina Proof
        if (DEVICE_PIXEL_RATIO) {
            canvas.width = innerWidth * DEVICE_PIXEL_RATIO;
            canvas.height = innerHeight * DEVICE_PIXEL_RATIO;
            canvas.style.width = innerWidth + 'px';
            canvas.style.height = innerHeight + 'px';
        }

    }

    // pad as necessary with size change
    paddingx = Math.max(Math.min((innerWidth / 2 / 10), PADDINGMAX), PADDINGMIN);
    paddingy = Math.min(paddingx * 2, 100);
    posx = posx || paddingx;
    posy = posy || paddingy;
    cursorposx = cursorposx || posx;
    cursorposy = cursorposy || posy;

    // change letter size as necessary with size change
    letter_width = linearInterpolate(paddingx, [PADDINGMIN, PADDINGMAX], [12, 20]);
    letter_size = letter_width * 20 / 12;
    letter_height = letter_size + 6;

    alpha = ALPHA_MAX;

    // reset contexts, because resizing wipes them
    textCtx.font = letter_size + "px Special Elite, serif";
    textCtx.fillStyle = TEXT_COLOR;
    textCtx.globalAlpha = alpha;
    textCtx.scale(DEVICE_PIXEL_RATIO, DEVICE_PIXEL_RATIO);

    cursorCtx.fillStyle = CURSOR_COLOR;
    cursorCtx.globalAlpha = ALPHA_MAX;
    cursorCtx.scale(DEVICE_PIXEL_RATIO, DEVICE_PIXEL_RATIO);

    // wipe and redraw any characters
    chars = [];
    for (var i = 0, len = _chars.length; i < len; i++) {
        var char = _chars[i];
        updateText( char );
    }
}

function updateCursor ( value ) {
    if (value === 'moveleft') {
        posx -= letter_width;
    } else if (value === 'moveup') {
        posy -= letter_height;
    } else if (value === 'movedown') {
        posy += letter_height;
    } else if (value === 'moveright') {
        posx += letter_width;
    } else if (value === 'newline') {
        posx = paddingx;
        posy += letter_height;
    }

    drawCursor(posx, posy);    
}

function removeCursor () {
    cursorCtx.clearRect(cursorposx, cursorposy, letter_width + 20, letter_height / 10 + 20);
}

function drawCursor (x, y) {
    var diff = y - (innerHeight - (docElem.clientHeight / 2));
    cursorInput.style.top = (y + 100) + 'px';
    if (diff > 0) {
        innerHeight += diff;
        drawText();
    }
    removeCursor();

    y += 2;

    cursorCtx.fillRect(x, y, letter_width, letter_height / 10);
    cursorposx = x - 10;
    cursorposy = y - 10;
}

function addToChars ( char ) {
    var jitter_y = (function() {
            var general_position = jittered_char_pos[char] || 0;
            // add more random
            return general_position + randRange(-LETTER_JITTER, LETTER_JITTER);
        })(),
        rotate_xy = (function() {
            var general_position = rotated_char_pos[char] || 0;
            // add more random
            return general_position + randRange(-LETTER_ROTATE, LETTER_ROTATE);
        })();
    
    alpha -= .0001;

    updateText({
        opacity: randRange(alpha - ALPHA_VARIANCE, alpha),
        value: char,
        rotate_xy: rotate_xy,
        x : posx,
        y : posy + jitter_y
    });
}

function updateText (charobj) {
    var value = charobj.value,
        opacity = charobj.opacity,
        rotate_xy = charobj.rotate_xy,
        x = charobj.x, 
        y = charobj.y;

    chars.push(charobj);        

    textCtx.save();
    textCtx.translate(x, y);
    textCtx.rotate(rotate_xy);
    textCtx.fillText(value, 0, 0);
    textCtx.restore();
}

function exportImage () {
    var background,
        temp = document.createElement('canvas'),
        tctx = temp.getContext('2d'),
        square_size = (Math.max(left_extent, bottom_extent) + paddingx),
        width = Math.min(square_size, textCanvas.width),
        height = Math.min(square_size, textCanvas.height),
        width_retina = width * DEVICE_PIXEL_RATIO,
        height_retina = height * DEVICE_PIXEL_RATIO,
        image;

    if (!chars.length) return false;

    (function () {
        var img = new Image();
        img.src = 'inc/handmadepaper.png';
        img.onload = function () {
            background = textCtx.createPattern(img, 'repeat');
        };
        return 'pending...';
    })()

	// make sure the cursor is not drawn
	is_exporting = true;
	drawText();

	setTimeout(function () {

	    // crop canvas to content extents + padding
	    // temp.width = width;
	    // temp.height = height;
	    makeCanvasRetinaProof(temp, width, height);

	    // draw retina canvas onto non-retina canvas 
	    tctx.drawImage(textCanvas, 0, 0, width_retina, height_retina, 0, 0, width, height);
	    image = temp.toDataURL('image/jpeg');

		window.open(image);
		//window.open(image);
		//export_form.submit();
		is_exporting = false;

	}, 150);
}

function randRange (min, max) {
    var value = (Math.random() * (max - min)) + min;
    return value;
}

function makeMultiAudio (src) {
    var output = [],
         current = 0,
         num = 5;
    for (var i = 0; i < num; i++) {
        output.push(new Audio(src));
    }
    this.play = function () {
        output[current++ % num].play();
    };
}

function linearInterpolate (val, from_range, to_range) {
    var minX = from_range[0],
        minY = to_range[0],
        rangeX = from_range[1] - from_range[0],
        rangeY = to_range[1] - to_range[0];

    return (val - minX) * rangeY / rangeX + minY;
}