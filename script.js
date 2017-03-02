/*
*
* Inspired by a girl, Ms. Jayme Bergman
*
*/

var options = new function () {
        this.play_audio = true;
    },  
    container = document.getElementById('container'),
    container_origin = new Vector(0,0),
    container_scale = 1,
    container_offset = new Vector(0,0),
    canvas_offset = new Vector(0, 0),
    textCanvas = document.getElementById('text-canvas'),
    textCtx = textCanvas.getContext('2d', {alpha:true}),
    cursorCanvas = document.getElementById('cursor-canvas'),
    cursorCtx = cursorCanvas.getContext('2d'),
    cursorInput = document.getElementById('cursor-input'),
    keypress_audio = new makeMultiAudio('inc/keypress.mp3'),
    newline_audio = new makeMultiAudio('inc/return.mp3'),
    IS_IOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
    DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1,
    TEXT_COLOR = '#150904',
    CURSOR_COLOR = '#4787ea',
    GLOBAL_ALPHA = 0.72,
    ALPHA_MARGIN = 0.06,
    ROTATE_MARGIN = 0.05,
    TRANSLATE_MARGIN = 0.2,
    chars = [],
    letter_size = parseInt(Math.min(26, window.innerWidth / 17)),
    letter_width = letter_size * 12 / 20,
    line_height = letter_size + 8,
    padding_vec = (function () {
        var _x = Math.min(100, window.innerWidth / 8),
            _y = Math.min(_x, window.innerHeight / 8);
        return new Vector(_x, _y);
    })(),
    pos_vec = padding_vec,
    Cursor = new function () {
        /*
        Cursor singleton for controlling cursor 
        position and visibility
        */
        var _cursor_timeout,
            _raf,
            _time,
            _opacity;

        this.clear = function () {
            var _pos = pos_vec.subtract(1).divideBy(container_scale);

            cursorCtx.clearRect(_pos.x, _pos.y, letter_width + 2, line_height + 2);
        };

        this.update = function (vec) {
            this.clear();
            
            pos_vec = vec;
            cursorInput.style.left = Math.min(vec.x, innerWidth) + 'px';
            cursorInput.style.top = Math.min(vec.y, innerHeight) + 'px';
            this.draw();
        };

        this._draw = function () {
            var _pos = pos_vec.divideBy(container_scale);

            cursorCtx.fillRect(_pos.x, _pos.y, letter_width, line_height);
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

        this.nudge = function (vec) {
            this.update( pos_vec.add(vec.multiplyBy(container_scale)) );
        };

        this.moveleft = function () {
            this.nudge(new Vector(-letter_width, 0));
        };
        this.moveright = function () {
            this.nudge(new Vector(letter_width, 0));
        };
        this.moveup = function () {
            this.nudge(new Vector(0, -line_height));
        };
        this.movedown = function () {
            this.nudge(new Vector(0, line_height));
        };
        this.addtab = function () {
            this.nudge(new Vector(letter_width * 4, 0));
        };
        
        this.newline = function () {
            /*
            todo: newline might be better off
            moving to x = previous click location
            instead of paddingx
            */
            this.update(new Vector(padding_vec.x, pos_vec.y + line_height));
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
    // mapping for keys that move cursor 
    NAV_BUTTONS = {
        8: Cursor.moveleft.bind( Cursor ),
        9: Cursor.addtab.bind( Cursor ),
        37: Cursor.moveleft.bind( Cursor ),
        38: Cursor.moveup.bind( Cursor ),
        39: Cursor.moveright.bind( Cursor ),
        40: Cursor.movedown.bind( Cursor ),
        13: Cursor.newline.bind( Cursor ),
    },
    // mapping for soundless keys
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
        /*
        TypeWriter singleton for handling characters
        and global positioning system (GPS, ya know)
        */
        this.addCharacter = function (char_str, _x, _y) {
            if (_x && _y) {
                Cursor.update( new Vector(_x, _y));
            }
            for (var i = 0, len = char_str.length; i < len; i++) {
                var char = char_str[i];
               
                chars.push( new Character( char ) );
                Cursor.moveright();
            }
        };

        this.redraw = function () {
            /*
            pure redraw (no resetting/clearing)
            */
            asyncForLoop(chars, process_fn);

            function process_fn (char) {
                char.draw();
            }
        };

        this.reposition = function (vec) {
            /*
            offset characters for given x/y
            useful for moving/dragging
            useful for redrawing (b/c needs resetting)
            */
            canvas_offset._add( vec || new Vector(0, 0) );

            container.style.left = '0px';
            container.style.top = '0px';

            resetCanvases();
            this.redraw();
        };

        this.reset = function () {
            /*
            back to original blank canvas
            */
            chars = [];
            pos_vec = padding_vec;
            canvas_offset = new Vector(0, 0);
            container_origin = new Vector(0, 0);
            container_scale = 1;
            container.setAttribute('style', '');

            this.reposition();
            Cursor.draw();
            cursorInput.focus();
        };
    };

/*
*
* Vector class for handling positions
*
*/

function Vector (x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.add = function (vector) {
    if (typeof(vector) === 'number') {
        return new Vector(this.x + vector, this.y + vector);
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
};

Vector.prototype._add = function (vector) {
    this.x += (vector.x === undefined) ? vector : vector.x;
    this.y += (vector.y === undefined) ? vector : vector.y;
    return this;
};

Vector.prototype.subtract = function (vector) {
    if (typeof(vector) === 'number') {
        return new Vector(this.x - vector, this.y - vector);
    }
    return new Vector(this.x - vector.x, this.y - vector.y);
};

Vector.prototype._subtract = function (vector) {
    this.x -= (vector.x === undefined) ? vector : vector.x;
    this.y -= (vector.y === undefined) ? vector : vector.y;
    return this;
};

Vector.prototype.divideBy = function (num) {
    return new Vector(this.x / num, this.y / num);
};

Vector.prototype._divideBy = function (num) {
    this.x /= num;
    this.y /= num;
    return this;
};

Vector.prototype.multiplyBy = function (num) {
    return new Vector(this.x * num, this.y * num);
};

Vector.prototype._multiplyBy = function (num) {
    this.x *= num;
    this.y *= num;
    return this;
};

Vector.prototype.distanceTo = function (vector) {
    var diff = vector.subtract(this),
        x = diff.x,
        y = diff.y;
    return Math.sqrt(x * x + y * y);
};

/*
*
* Character class for drawing characters on TypeWriter singleton
*
*/
function Character (char_str, x, y) {
    var x = randMargin(x || pos_vec.x, TRANSLATE_MARGIN),
        y = randMargin(y || pos_vec.y, TRANSLATE_MARGIN);

    this.str = char_str;
    this.rotate = randMargin(0, ROTATE_MARGIN);
    this.alpha = randMargin(GLOBAL_ALPHA, ALPHA_MARGIN);
    
    // save vector position
    Vector.call(this, x, y);

    // save inverse of current typewriter offsets
    // useful for applying future changing offsets
    // in redraw functions
    this._subtract( canvas_offset.multiplyBy( container_scale ) )
        ._subtract( container_offset );

    this.draw();
}

Character.prototype = Object.create( Vector.prototype );

Character.prototype.draw = function () {
    // apply current typewriter offsets
    var vec = this.add( canvas_offset.divideBy(container_scale) );

    textCtx.save();
    if (container_scale !== 1) {
        textCtx.translate(container_offset.x, container_offset.y);
        textCtx.scale(container_scale, container_scale);
    }
    textCtx.translate(vec.x, vec.y);
    textCtx.rotate( this.rotate );
    textCtx.globalAlpha = this.alpha;
    textCtx.fillText(this.str, 0, 0);
    textCtx.restore();
};

/*
*
* cursor input handlers
*
*/

cursorInput.addEventListener('keydown', function (e) {
    /*
    keydown handles audio
    */
    var no_audio = NO_AUDIO[ e.which ];

    if (!no_audio && options.play_audio) {
        if (e.which === ENTER) {
            newline_audio.play();
        } else {
            keypress_audio.play();
        }
        return true;
    }
    
    if (no_audio === 'TAB') {
        /* todo : add 2 or 4 spaces */

        // refocus
        setTimeout(function () {
            cursorInput.focus();
        }, 10);
        e.preventDefault();
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

window.addEventListener('resize', function () {
    TypeWriter.reposition();
});

/*
*
* mobile app listener 
*
*/

document.addEventListener('deviceready', function(){

    // vibrate gives option to clear typewriter
    shake.startWatch(function () {

        navigator.notification.confirm("Do you want to clear the canvas?", function (button) {
            if (button === 1) {
                TypeWriter.reset();
            }
        });

    });

}, false);

/*
*
* basic app handlers
*
*/
var startTyping = (function () {
    /*

    button click handler to start basic 
    app functions/handlers

    */
    var typing;
    return function () {
        if (typing) return;

        typing = true;

        addEventHandlers();
        cursorInput.focus();
        Cursor.draw();

        document.getElementById('splash').style = 'display:none';

        sendEvent('function', 'startTyping');
    };
})();

function addEventHandlers () {

    /*
    super messy event handlers for document, input,
    ranging from mouse|touch start|move|stop events
    several shared local variables

    todo : cleanup?
    */
    var mouseuptimeout,
        mousemovedelay = 150,
        mousedowntime,
        clickdelay = 150,
        original_pos,
        zoom_distance,
        zoom_scale,
        zoom_center_diff;

    document.addEventListener('mouseup', mouseUp);
    document.addEventListener('touchend', mouseUp);
    document.addEventListener('mousedown', mouseDown);
    document.addEventListener('touchstart', mouseDown);

    if (IS_IOS) {
        document.addEventListener('touchstart', updateCursor);
    }

    function updateCursor (e) {
        var _position = getPositionFromEvent(e),
            letter_offset = new Vector(letter_width/2, line_height/2),
            _newpos = _position.subtract(letter_offset);
        Cursor.update( _newpos );
        cursorInput.focus();
    }

    function mousemove (e) {
        // move holder
        var _position = getPositionFromEvent(e);
            
        _position._subtract( original_pos );

        container.style.left = _position.x + 'px';
        container.style.top = _position.y + 'px';
        Cursor.clear();
    }

    function mouseUp (e) {
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
            var _position = getPositionFromEvent(e);
            
            _position._subtract( original_pos );

            TypeWriter.reposition( _position );
            original_pos = null;
        } else if (new Date() - mousedowntime <= clickdelay &&
            !IS_IOS) {
            // click
            updateCursor(e);
        }
    }

    function mouseDown (e) {

        // ignore right click
        if (e.button === 2) return;

        if (e.touches && e.touches.length === 2) {
            // two finger zoom
            removeMoveEvent();
            removeZoomEvent();
            zoomStart(e);
            e.preventDefault();
        } else {
            // single finger or mouse
            mousedowntime = new Date();

            mouseuptimeout = window.setTimeout(function () {
                
                original_pos = original_pos || getPositionFromEvent(e);

                document.addEventListener('mousemove', mousemove);
                document.addEventListener('touchmove', mousemove);
                document.addEventListener('mouseup', removeMoveEvent);
                
            }, mousemovedelay);
        }
    }

    function removeMoveEvent () {
        window.clearTimeout( mouseuptimeout );
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('touchmove', mousemove);
        document.removeEventListener('mouseup', removeMoveEvent);
    }

    function getFingerPositions (e) {
        var touches = e.touches,
            touch1 = touches[0],
            touch2 = touches[1];

        return [ 
            new Vector(touch1.clientX, touch1.clientY),
            new Vector(touch2.clientX, touch2.clientY)
        ];
    }

    /*
    extremely experimental zooming 
    */

    function zoomStart (e) {
        var positions = getFingerPositions(e),
            f1 = positions[0],
            f2 = positions[1];
        
        zoom_distance = f1.distanceTo( f2 );
        container_origin._add(f1)._add(f2)._divideBy(2);

        container.style.transformOrigin = container_origin.x + 'px ' + container_origin.y + 'px';

        document.addEventListener('touchmove', zoomMove);
        document.addEventListener('touchend', zoomEnd);
    }

    function removeZoomEvent () {
        document.removeEventListener('touchmove', zoomMove);
        document.removeEventListener('touchend', zoomEnd);
    }

    function zoomMove (e) {
        // css resize
        var positions = getFingerPositions(e),
            f1 = positions[0],
            f2 = positions[1],
            zc = f1.add(f2).divideBy(2);

        zoom_center_diff = zc.subtract(container_origin);
        
        zoom_scale = f1.distanceTo(f2) / zoom_distance;

        // scale (impacted by origin in zoomStart)
        container.style.transform = 'scale(' + zoom_scale + ')';

        // translate
        container.style.left = zoom_center_diff.x + 'px';
        container.style.top = zoom_center_diff.y + 'px';
       
        e.preventDefault();
    }

    function zoomEnd (e) {

        // get new offset for canvas to figure out
        container_scale *= zoom_scale;
        container_offset = container_origin.multiplyBy(1 - container_scale);

        container.setAttribute('style', '');

        // reposition by zoom_center_diff
        TypeWriter.reposition( zoom_center_diff );

        removeZoomEvent();
    }

    simulatorReady();
}

function simulatorReady () {
    resetCanvases();
}

/*
*
* some miscellaneous functions
*
*/
function sendEvent() {
    var args = Array.prototype.slice.call( arguments );

    console.log( args );

    // send to Google
    ga.apply(this, ['send','event'].concat( args ));
}

function resetCanvases () {
    [textCtx, cursorCtx].forEach(function (ctx) {
        var canvas = ctx.canvas;

        ctx.setTransform(1,0,0,1,0,0);

        canvas.width = innerWidth * DEVICE_PIXEL_RATIO;
        canvas.height = innerHeight * DEVICE_PIXEL_RATIO;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';

        ctx.scale(DEVICE_PIXEL_RATIO, DEVICE_PIXEL_RATIO);

        ctx.globalAlpha = GLOBAL_ALPHA;
    });

    // reset contexts, because resizing wipes them
    textCtx.font = letter_size + "px Special Elite, serif";
    textCtx.textBaseline = "top";
    textCtx.fillStyle = TEXT_COLOR;

    cursorCtx.fillStyle = CURSOR_COLOR;
    cursorCtx.scale(container_scale, container_scale);
}

function forceSpace () {
    // firefox allows navigation within input
    // this forces cursor to the end
    this.value = '';
    this.value = ' ';
}

function getPositionFromEvent (e) {
    var touch = e.touches && e.touches[0] || {},
        _x = e.clientX || touch.clientX || pos_vec.x,
        _y = e.clientY || touch.clientY || pos_vec.y;
    return new Vector(_x, _y);
}

function setFontSize (new_size) {
    letter_size = new_size;
    letter_width = letter_size * 12 / 20;
    line_height = letter_size + 8;
}

/*
*
* helper functions
*
*/

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