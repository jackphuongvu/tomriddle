/*
*
* Inspired by a girl, Ms. Jayme Bergman
*
*/

var container = document.getElementById('container'),
    textCanvas = document.getElementById('text-canvas'),
    textCtx = textCanvas.getContext('2d'),
    cursorCanvas = document.getElementById('cursor-canvas'),
    cursorCtx = cursorCanvas.getContext('2d'),
    cursorInput = document.getElementById('cursor-input'),
    docElem = document.documentElement,
    keypress_audio = new makeMultiAudio('inc/keypress.mp3'),
    newline_audio = new makeMultiAudio('inc/return.mp3'),
    chars = [],
    letter_size = 26,
    letter_width = letter_size * 12 / 20,
    line_height = letter_size + 8,
    paddingx = Math.min(100, window.innerWidth / 8),
    paddingy = Math.min(paddingx, window.innerHeight / 8),
    offsetx = 0,
    offsety = offsetx,
    posx = paddingx,
    posy = paddingy,
    DEVICE_PIXEL_RATIO = window.devicePixelRatio || 0,
    TEXT_COLOR = '#150904',
    CURSOR_COLOR = '#4787ea',
    GLOBAL_ALPHA = 0.76,
    ALPHA_MARGIN = 0.06,
    ROTATE_MARGIN = 0.04,
    TRANSLATE_MARGIN = 0.1,
    Cursor = new function () {
        var cursor_height = line_height,
            _cursor_timeout,
            _raf,
            _time,
            _opacity;

        this.clear = function () {
            cursorCtx.clearRect(posx - 1, posy - 1, letter_width + 2, cursor_height + 2);
        };

        this.update = function (x, y) {
            this.clear();
            posx = x || posx;
            posy = y || posy;
            cursorInput.style.left = posx + 'px';
            cursorInput.style.top = posy + 'px';
            this.draw();
        };

        this._draw = function () {
            cursorCtx.fillRect(posx, posy, letter_width, cursor_height);
        };

        this.draw = function () {
            this._draw();
            
            window.clearTimeout(_cursor_timeout);
            if (_raf) {
                window.cancelAnimationFrame(_raf);
            }
            _opacity = GLOBAL_ALPHA;
            _cursor_timeout = window.setTimeout(this.fadeOut.bind(this), 2200);
        };

        this.moveleft = function () {
            this.update(posx - letter_width);
        };
        this.moveright = function () {
            this.update(posx + letter_width);
        };
        this.moveup = function () {
            this.update(posx, posy - line_height);
        };
        this.movedown = function () {
            this.update(posx, posy + line_height);
        };
        this.newline = function () {
            this.update(paddingx, posy + line_height);
        };

        this.fadeOut = function () {
            _time = new Date();
            _raf = window.requestAnimationFrame( this._fadeanim.bind(this) );
        };

        this._fadeanim = function () {
            var dt = new Date() - _time,
                new_opacity = _opacity - 0.1 * dt / 300;

            if (new_opacity <= 0) {
                this.clear();
            } else {
                cursorCtx.save();
                this.clear();
                _opacity = new_opacity;
                cursorCtx.globalAlpha = _opacity;
                this._draw();
                cursorCtx.restore();
                _raf = window.requestAnimationFrame( this._fadeanim.bind(this) );
            }
        };
    },
    NAV_BUTTONS = {
        8: Cursor.moveleft.bind( Cursor ),
        37: Cursor.moveleft.bind( Cursor ),
        38: Cursor.moveup.bind( Cursor ),
        39: Cursor.moveright.bind( Cursor ),
        40: Cursor.movedown.bind( Cursor ),
        13: Cursor.newline.bind( Cursor ),
    },
    NO_AUDIO = {
        0 : 'PRTSCR',
        8 : 'BACKSPACE',
        9 : 'TAB',
        16 : 'SHIFT',
        17 : 'CTRL',
        18 : 'ALT',
        20 : 'CAPSLOCK',
        27 : 'ESC',
        32 : 'SPACE',
        33 : 'PGUP',
        34 : 'PGDN',
        35 : 'END',
        36 : 'HOME',
        37 : 'LEFT',
        38 : 'UP',
        39 : 'RIGHT',
        40 : 'DOWN',
        45 : 'INSERT',
        46 : 'DEL',
        115 : 'F4',
        117 : 'F6',
        119 : 'F8',
        120 : 'F9',
        121 : 'F10',
        123 : 'F12'
    },
    ENTER = 13,
    TypeWriter = new function () {
        this.addCharacter = function (char_str) {
            for (var i = 0, len = char_str.length; i < len; i++) {
                var char = char_str[i];
                chars.push( new Character( char ) );
                Cursor.update(posx + letter_width);
            }
        };

        this.redraw = function () {
            asyncForLoop(chars, process_fn);

            function process_fn (char) {
                char.draw();
            }
        };

        this.reposition = function (x, y) {
            offsetx += x;
            offsety += y;

            container.style.left = '0px';
            container.style.top = '0px';

            resetCanvases();
            this.redraw();
        };

        this.reset = function () {
            chars = [];
            posx = paddingx;
            posy = paddingy;
            offsetx = 0;
            offsety = 0;

            this.reposition(0, 0);
            Cursor.draw();
            cursorInput.focus();
        };
    };

function resetCanvases () {
    [textCtx, cursorCtx].forEach(function (ctx) {
        var canvas = ctx.canvas;

        if (DEVICE_PIXEL_RATIO) {
            canvas.width = innerWidth * DEVICE_PIXEL_RATIO;
            canvas.height = innerHeight * DEVICE_PIXEL_RATIO;
            canvas.style.width = innerWidth + 'px';
            canvas.style.height = innerHeight + 'px';
            ctx.scale(DEVICE_PIXEL_RATIO, DEVICE_PIXEL_RATIO);
        } else {
            canvas.width = innerWidth;
            canvas.height = innerHeight;
        }
        ctx.globalAlpha = GLOBAL_ALPHA;
    });

    // reset contexts, because resizing wipes them
    textCtx.font = letter_size + "px Special Elite, serif";
    textCtx.textBaseline = "top";
    textCtx.fillStyle = TEXT_COLOR;

    cursorCtx.fillStyle = CURSOR_COLOR;
}

// characters
function Character (char_str, x, y) {
    var x = randMargin(x || posx, TRANSLATE_MARGIN),
        y = randMargin(y || posy, TRANSLATE_MARGIN);
   
    this.str = char_str;
    this.x = x - offsetx;
    this.y = y - offsety;
    this.rotate = randMargin(0, ROTATE_MARGIN);
    this.alpha = randMargin(GLOBAL_ALPHA, ALPHA_MARGIN);
    this.draw();
}

Character.prototype.draw = function () {
    textCtx.save();
    textCtx.translate(this.x + offsetx, this.y + offsety);
    textCtx.rotate( this.rotate );
    textCtx.globalAlpha = this.alpha;
    textCtx.fillText(this.str, 0, 0);
    textCtx.restore();
};

window.addEventListener('load', function () {
    var mouseuptimeout,
        mousemovedelay = 150,
        mousedowntime,
        clickdelay = 150,
        original_pos;

    document.addEventListener('mouseup', mouseUp);
    document.addEventListener('touchend', mouseUp);

    document.addEventListener('mousedown', mouseDown);
    // document.addEventListener('click', mouseDown);

    document.addEventListener('touchstart', mouseDown);

    function getPositionFromEvent (e) {
        var touch = e.touches && e.touches[0] || {},
            _x = e.clientX || touch.clientX || posx,
            _y = e.clientY || touch.clientY || posy;
        return {
            x : _x,
            y : _y
        };
    }

    function onClick (e) {
        var _position = getPositionFromEvent(e),
            _x = _position.x,
            _y = _position.y;
        Cursor.update(_x - letter_width/2, _y - line_height/2);
        cursorInput.focus();
    }

    function mousemove (e) {
        // move holder
        var _position = getPositionFromEvent(e),
            _x = _position.x,
            _y = _position.y;
        container.style.left = (_x - original_pos.x) + 'px';
        container.style.top = (_y - original_pos.y) + 'px';
        Cursor.clear();
    }

    function mouseUp (e) {
        window.clearTimeout(mouseuptimeout);
        removeMoveEvent();

        if (e.type === 'touchend' && !e.touches.length) {
            if (e.changedTouches.length) {
                e.clientX = e.changedTouches[0].clientX;
                e.clientY = e.changedTouches[0].clientY;
            } else {
                return;
            }
        }

        if (original_pos) {
            var _position = getPositionFromEvent(e),
                _x = _position.x,
                _y = _position.y;

            TypeWriter.reposition(_x - original_pos.x, _y - original_pos.y);
            original_pos = null;
        } else if (new Date() - mousedowntime <= clickdelay) {
            // click
            onClick(e);
        }
    }

    function mouseDown (e) {

        if (e.button === 2) return;

        mousedowntime = new Date();

        mouseuptimeout = window.setTimeout(function () {
            
            original_pos = original_pos || getPositionFromEvent(e);

            document.addEventListener('mousemove', mousemove);
            document.addEventListener('touchmove', mousemove);
            document.addEventListener('mouseup', removeMoveEvent);
            
        }, mousemovedelay);
    }

    function removeMoveEvent () {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('touchmove', mousemove);
        document.removeEventListener('mouseup', removeMoveEvent);
    }

    cursorInput.addEventListener('keydown', function (e) {
        /*
        keydown handles audio
        */
        var no_audio = NO_AUDIO[ e.which ];

        if (!no_audio) {
            if (e.which === ENTER) {
                newline_audio.play();
            } else {
                keypress_audio.play();
            }
            return true;
        }
        
        if (no_audio === 'TAB') {
            /* refocus */
            setTimeout(focus, 10);
        }
    });

    cursorInput.addEventListener('keyup', function (e) {
        /*
        keyup handles character input and navigation
        */
        var nav = NAV_BUTTONS[ e.which ],
            value = this.value.substr(1);

        if (!value && !nav) return;

        if (nav) {
            nav();
        } else {
            TypeWriter.addCharacter( value );
        }
        forceSpace.call(this);
    });

    cursorInput.addEventListener('focus', forceSpace);

    function forceSpace () {
        // firefox allows navigation within input
        // this forces cursor to the end
        this.value = '';
        this.value = ' ';
    }

    resetCanvases();
    Cursor.draw();
    cursorInput.focus();
});

document.addEventListener("deviceready", function(){

    // vibrate gives option to clear typewriter
    shake.startWatch(function () {

        navigator.notification.confirm("Do you want to clear the canvas?", function (button) {
            if (button === 1) {
                TypeWriter.clear();
            }
        });
        
    });

}, false);

//
// helper functions
//

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

function randRange (min, max) {
    var value = (Math.random() * (max - min)) + min;
    return value;
}

function randMargin (num, margin) {
    return randRange(num - margin, num + margin);
}

function asyncForLoop (arr, process_fn, cb_fn) {
    // Copyright 2009 Nicholas C. Zakas. All rights reserved.
    // MIT Licensed
    // http://www.nczonline.net/blog/2009/08/11/timed-array-processing-in-javascript/
    
    var i = 0,
        len = arr.length,
        loop_finished = cb_fn || function () {};

    if (!len) {
        loop_finished();
        return;
    }

    window.setTimeout(function () {
        var start = +new Date();
        do {
            process_fn.call(this, arr[i], i);
        } while (++i < len && (+new Date() - start < 50));

        if (i < len) {
            // call next item
            window.setTimeout(arguments.callee, 25);
        } else {
            loop_finished();
        }
    }, 25);
}