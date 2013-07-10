/**
 * Tab keycodes
 */
var KB_TAB = 9;
var KB_SHIFT = 16;
var KB_ENTER = 13;

/**
 * EZ-Access keycode declarations
 */
var EZ_KEY_SKIPFORWARD = 135; // is >>
var EZ_KEY_SKIPBACKWARD = 134; // is <<
var EZ_KEY_HELP = 128; // is ?
var EZ_KEY_BACK = 132; // is BACK
var EZ_KEY_NEXT = 133; // is NEXT
var EZ_KEY_UP = 129; // is up arrow key
var EZ_KEY_DOWN = 130; // is down arrow key
var EZ_KEY_ENTER = 131; // is green circle enter key

/**
 * Whether slide to read is enabled universally
 * @type {boolean}
 */
var slideToRead = true;

/**
 * Determines key autorepeat preperty or not
 * @type {string}
 */
var autoRepeat = 'off';

/**
 * Tabular navigation behavior (& cooperation w/ browser)
 * @type {string}
 */
var tabNav = 'ezaccess';

/**
 * Global idle loop timer if no user action is taken
 */
var idleLoop;

// If autoadvance is enabled or not
// Also autoadvance timer is global to disable from other functions
var autoAdvance = 0;
var autoAdvTimer;


/* Referred to by window.onload anonymous function.
   http://www.dreamincode.net/code/snippet1246.htm */

/**
 * Handles key events for EZ Access (except for multi-key pressed, like tab+shift handled by multikey_event)
 * @param {event} e Event object passed from set up on EZ Access startup.
 * @returns {boolean} If false, disables default key action.
 */
function key_event(e) {
	// 'if' keycode statements
	if(e.keyCode == EZ_KEY_HELP || e.keyCode == 72) { // 72 == 'h'
		if(tinyOpen) {
			tinyOpen = false;
			TINY.box.hide();
		} else {
			tinyOpen = true;
			ez_help(selectEl);
		}
	} else if(e.keyCode == EZ_KEY_UP) {
		if(tinyOpen) {
			tinyOpen = false;
			TINY.box.hide();
		} else {
			if(ez_navigateToggle) {
				window.scroll(0, findPos(selectEl));
				ez_navigate('up');
			} else {
				ez_navigate_start();
			}
		}
	} else if(e.keyCode == EZ_KEY_DOWN) {
		if(tinyOpen) {
			tinyOpen = false;
			TINY.box.hide();
		} else {
			if(ez_navigateToggle) {
				window.scroll(0, findPos(selectEl));
				ez_navigate('down');
			} else {
				ez_navigate_start();
			}
		}
	} else if(e.keyCode == EZ_KEY_BACK || e.keyCode == 66) { // 'b' == 66
		// TODO
        var inGroup = findGroupParent();
		if(inGroup == currIndex) {
			if(tinyOpen) {
				tinyOpen = false;
				TINY.box.hide();
			} else {
				if(ez_navigateToggle) {
					window.history.back();
				} else {
					ez_navigate_start();
				}
			}
		} else {
			// ez_jump(inGroup); // TODO
		}
	} else if(e.keyCode == EZ_KEY_ENTER || e.keyCode == KB_ENTER) {
		if(tinyOpen) {
			tinyOpen = false;
			TINY.box.hide();
		} else {
			if(ez_navigateToggle) {
				ez_enter();
			} else {
				ez_navigate_start();
			}
			return false; // Disable any browser actions
		}
	} else if(e.keyCode == EZ_KEY_SKIPFORWARD) {
		if(selectEl.type == 'range') {
			selectEl.value = parseFloat(selectEl.value) + parseFloat(selectEl.step);
			sounds[AUDIO_MOVE].feed.play();
			voice(selectEl.value);
		} else if(selectEl.tagName == 'SELECT') {
			if(selectEl.selectedIndex < selectEl.length - 1) {
				selectEl.selectedIndex++;
				sounds[AUDIO_MOVE].feed.play();
				voice(selectEl.value + '... option ' + (selectEl.selectedIndex + 1) + ' of ' + selectEl.length);
			} else {
				document.getElementById(ezSelectorId).className = 'pulse';
				setTimeout(function () {
					document.getElementById(ezSelectorId).className = '';
				}, 300);
				sounds[AUDIO_NOACTION].feed.play();
			}
		} else {
			if(audioVolume <= 90) {
				audioVolume += 10;
				sessionStorage.setItem("EZ_Volume", audioVolume);
				set_volume();
				sounds[AUDIO_MOVE].feed.play();
				voice("Volume... " + audioVolume + " percent");
			} else {
				document.getElementById(ezSelectorId).className = 'pulse';
				setTimeout(function () {
					document.getElementById(ezSelectorId).className = '';
				}, 300);
				sounds[AUDIO_NOACTION].feed.play();
				voice("Maximum volume");
			}
		}
	} else if(e.keyCode == EZ_KEY_SKIPBACKWARD) {
		if(selectEl.type == 'range') {
			selectEl.value = parseFloat(selectEl.value) - parseFloat(selectEl.step);
			sounds[AUDIO_MOVE].feed.play();
			voice(selectEl.value);
		} else if(selectEl.tagName == 'SELECT') {
			if(selectEl.selectedIndex > 0) {
				selectEl.selectedIndex--;
				sounds[AUDIO_MOVE].feed.play();
				voice(selectEl.value + '... option ' + (selectEl.selectedIndex + 1) + ' of ' + selectEl.length);
			} else {
				document.getElementById(ezSelectorId).className = 'pulse';
				setTimeout(function () {
					document.getElementById(ezSelectorId).className = '';
				}, 300);
				sounds[AUDIO_NOACTION].feed.play();
			}
		} else {
			if(audioVolume >= 10) {
				sessionStorage.setItem("EZ_Volume", audioVolume);
				audioVolume -= 10;
				set_volume();
				sounds[AUDIO_MOVE].feed.play();
				voice("Volume... " + audioVolume + " percent");
			} else {
				document.getElementById(ezSelectorId).className = 'pulse';
				setTimeout(function () {
					document.getElementById(ezSelectorId).className = '';
				}, 300);
				sounds[AUDIO_NOACTION].feed.play();
				voice("Minimum volume");
			}
		}
	} else if(selectEl.type == 'textarea' || selectEl.type == 'text') {
		var key = String.fromCharCode(e.keyCode);
		if(!key.match(/[^A-Za-z0-9\-_]/)) voice(key);
	}
	return true;
}

function getChildNodRange(range) {
    var ret = [];
    var obj = range.first;

    while(obj !== range.last) {
        ret.push(obj);
        obj = node_after(obj);
        if(obj === null) throw new Error("Invalid range object!");
    }
    ret.push(obj);

    return ret;
}

function getActionableElement(e, source) {
    var childNod = getChildNodRange(e); // TODO: Source

    // Nv'd inside an element's text
    if(childNod.length === 1 && childNod[0].nodeType === 3) {
        return childNod[0].parentElement;
    }

    // Get the element if multiple nodes and one element are navagable.
    var els = 0;
    var lastEl;
    for(i = 0; i < childNod.length; i++) {
        if(isElement(childNod[i])) {
            els++;
            lastEl = childNod[i];
        }
    }
    if(els === 1) {
        return lastEl;
    }
    return childNod[0];
}

/**
 * Returns block-level element for drawing box algo
 * @param {HTMLElement} e The element to check for
 * @param {'nav'|'point'} source The navigation mechanism
 * @returns {HTMLElement} The child block (if it is)
 */
function getBlock(e, source) {
    var children = getChildNodRange(e); // TODO: Source
    if(children.length === 1 && !isInlineElement(children[0], 'nav')) {
        return children[0];
    }
    return e;
}

/**
 * Main EZ Navigation function: Moves selector up or down selectElements, and calls all relevant functions (speech,
 * tooltips etc.)
 * @param {'up'|'down'|'top'|'bottom'} move Direction/position of navigation.
 * skipping hidden elements, this should be disabled because it takes too much time.
 */
function ez_navigate(move) {
    if(move === 'down') {
        selectEl = getNextSelection('nav');
    } else if(move === 'up') {
        selectEl = getPrevSelection('nav');
    } else if(move === 'top') {
        selectEl = getFirstSelection('nav');
        move = 'down';
    } else if(move === 'bottom') {
        selectEl = getLastSelection('nav');
        move = 'up';
    } else {
        throw new Error("Parameter *move* must be 'up'|'down'|'top'|'bottom'.")
    }

    if(selectEl === null) {
        if(move === 'down') {
            pulseSelector();
            sounds[AUDIO_NOACTION].feed.play();
            ez_navigate('bottom');
        }
        else if(move === 'up'){
            pulseSelector();
            sounds[AUDIO_NOACTION].feed.play();
            ez_navigate('top');
        }
        return;
    }
    if(!drawSelected(getBlock(selectEl))) {
        ez_navigate(move);
        return;
    }

    // Check to make sure it's not a short, weird selection TODO: INFLEXIBLE

    var children = getChildNodRange(selectEl);

    var allInline = true;
    for(i = 0; i < children.length; i++) {
        if(!isInlineElement(children[i])) {
            allInline = false;
            break;
        }

    }

    if(allInline
        && children.length === 1
        && is_all_punct(children[0])) {
        ez_navigate(move);
        return;
    }

    var actionable = getActionableElement(selectEl, 'nav');

    sounds[getElementAudio(actionable)].feed.play();
    actionable.focus();
    voice(actionable, 'nav'); // TODO: Need to look through all possibilities! NOT JUST ACTIONABLE
}

/**
 * Jump directly to a specific element.
 * TODO WARNING: Doesn't check if valid.
 * @param {number} location Valid index to jump to.
 */
function ez_jump(location) {
	selectEl.blur();
	currIndex = parseFloat(location);
	drawSelected(selectEl);
	sounds[getElementAudio()].feed.play();
	selectEl.focus();
	voice(selectEl, 'nav');
}

/**
 * Decides what to do, if anything, when EZ Action is pressed.
 * TODO Will be revamped to handle better speech synthesis on EZ Action.
 */
function ez_enter() {
	var obj = selectEl;
	if(obj.tagName == "A") {
		if(obj.href.indexOf("#") != -1) {
			var hrefBase = obj.href.substring(0, obj.href.indexOf("#"));
			if(window.location.href.indexOf("#") != -1) {
				pageBase = window.location.href.substring(0, window.location.href.indexOf("#"));
			} else {
				pageBase = window.location.href;
			}
			if(hrefBase == "" || hrefBase == pageBase) { // If from same URL base
				var jumpTo = obj.href.substring(obj.href.indexOf("#") + 1);
				var idLocation = getCurrIndexById(jumpTo);
				var nameLocation = getCurrIndexByName(jumpTo);
				if(idLocation != -1) {
					ez_jump(idLocation);
					obj.click();
					return;
				} else if(nameLocation != -1) {
					ez_jump(nameLocation);
					obj.click();
					return;
				}
			}
		}
	}
	if(getClick(obj) !== undefined) {
		obj.click();
	} else if(obj.tagName == 'INPUT' && (obj.type == 'radio' || obj.type == 'checkbox')) {
		obj.click();
		if(obj.checked) {
			sounds[AUDIO_SELECT].feed.play();
		} else {
			sounds[AUDIO_DESELECT].feed.play();
		}
		voice(obj);
	} else if(obj.tagName == 'INPUT' && (obj.type == 'submit' || obj.type == 'image')) {
		obj.click();
	} else if(selectEl.getAttribute('data-ez-chunking') == 'group' && selectEl.getAttribute('data-ez-subnavtype') == 'nested' || selectEl.getAttribute('data-ez-subnavtype') == 'hierarchical') {
		ez_navigate_in_group();
	} else {
		document.getElementById(ezSelectorId).className = 'pulse';
		setTimeout(function () {
			document.getElementById(ezSelectorId).className = '';
		}, 300);
		sounds[AUDIO_NOACTION].feed.play();
		document.getElementById(ezSelectorId).className = 'pulse';
		setTimeout(function () {
			document.getElementById(ezSelectorId).className = '';
		}, 300);
		voice(obj, 0, true);
	}
}

function pulseSelector() {
    document.getElementById(ezSelectorId).className = 'pulse';
    setTimeout(function () {
        document.getElementById(ezSelectorId).className = '';
    }, 300);
}

/**
 * Check if new element (and exists to be highlighted), and then highlights
 * @param {object} e Object currently mouseover'd
 */
function mouseOver(e) {
	var newElement = true;
	var found = false;
	for(var i = 0; i < selectElements.length; i++) {
		if(e == selectElements[i]) {
			if(currIndex == i) {
				newElement = false;
			}
			if(!selectElements[i].hasAttribute('data-ez-focusable-point') && !selectElements[i].hasAttribute('data-ez-focusable')) {
				// If we're not supposed to navigate here by pointing
				selectEl.blur(); // Add blur to old element
				currIndex = i;
				selectEl.focus(); // Add focus to new element
				found = true;
			}
		}
	}
	if((newElement && found) || !ez_navigateToggle) { //Override if ez is not enabled
		sessionStorage.setItem("EZ_Toggle", "1");
		ez_navigateToggle = true;
		sounds[getElementAudio()].feed.play();
		drawSelected(selectEl);
		voice(selectEl, 'point');
	}
}

/**
 * Handles multi-key events, such as shift+tab
 * @param {event} e Key event passed to be evaluated.
 * @returns {boolean} If false, overrides default action.
 */
function multikey_event(e) {
	e = e || event; //to deal with IE
	map[e.keyCode] = !!(e.type == 'keydown');
	if(map[KB_TAB] && map[KB_SHIFT] && tabNav != 'none') { //SHIFT+TAB
		if(tinyOpen) {
			tinyOpen = false;
			TINY.box.hide();
		}
		if(ez_navigateToggle) {
			ez_navigate('up');
			smoothScroll(findPos(selectEl));
			//window.scroll(0,findPos(selectEl));
		} else {
			ez_navigate_start();
		}
		return false; // Overwrite default browser functionality
	} else if(map[KB_TAB] && tabNav != 'none') { //TAB
		if(tinyOpen) {
			tinyOpen = false;
			TINY.box.hide();
		}
		if(ez_navigateToggle) {
			ez_navigate('down');
			smoothScroll(findPos(selectEl));
			//window.scroll(0,findPos(selectEl));
		} else {
			ez_navigate_start();
		}
		return false;
	}
	return true;
}

/**
 * Sets autoadvancing timer.
 */
function auto_advance_set() {
	// If this is a new element to start autoadvancing, set the timer
	if(find_parent_attr(selectEl, 'data-ez-autoadvance') !== undefined) {
		if(find_parent_attr(selectElements[currIndex - 1], 'data-ez-autoadvance') === undefined) {
			autoAdvance = find_parent_attr(selectEl, 'data-ez-autoadvance');
			autoAdvance = parseInt(autoAdvance);
			if(autoAdvance < 100) {
				console.log("Please choose a autoadvance pause of 100 ms or greater.");
				autoAdvance = 100;
			}
			auto_advance_decide();
		}
	}
}

/**
 * Handles autoadvancing, and stopping autoadvancing if runs into end.
 */
function auto_advance_decide() {
	window.clearInterval(autoAdvTimer);
	if(autoAdvance !== 0) {
		autoAdvTimer = setInterval(function () {
			ez_navigate('down');
			if(currIndex >= findFocusable('last')) {
				autoAdvance = 0;
				window.clearInterval(autoAdvTimer);
			}
			if(find_parent_attr(selectEl, 'data-ez-autoadvance') === undefined) {
				autoAdvance = 0;
				window.clearInterval(autoAdvTimer);
			}
		}, autoAdvance);
	}
}

/**
 * Finds y value of given object -- for automated scrolling
 * @param {object} obj Object in question
 * @returns {Array} Position nested.
 */
function findPos(obj) {
	var curtop = -100;
	if(obj.offsetParent) {
		do {
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
		return [curtop];
	}
    return [null];
}

/**
 * Smooth Scrolling
 * http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
 * @returns {number} Where to scroll to
 */
function currentYPosition() {
	// Firefox, Chrome, Opera, Safari
	if(self.pageYOffset) return self.pageYOffset;
	// Internet Explorer 6 - standards mode
	if(document.documentElement && document.documentElement.scrollTop)
		return document.documentElement.scrollTop;
	// Internet Explorer 6, 7 and 8
	if(document.body.scrollTop) return document.body.scrollTop;
	return 0;
}

/**
 * Does the smooth scrolling + slow advancing
 * @param stopY Where to stop the incremental scrolling
 */
function smoothScroll(stopY) {
	var startY = currentYPosition();
	var distance = stopY > startY ? stopY - startY : startY - stopY;
	if(distance < 100) {
		scrollTo(0, stopY);
		return;
	}
	var speed = Math.round(distance / 100);
	if(speed >= 20) speed = 20;
	var step = Math.round(distance / 200);
	var leapY = stopY > startY ? startY + step : startY - step;
	var timer = 0;
	if(stopY > startY) {
		for(i = startY; i < stopY; i += step) {
			setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
			leapY += step;
			if(leapY > stopY) leapY = stopY;
			timer++;
		}
		return;
	}
	for(i = startY; i > stopY; i -= step) {
		setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
		leapY -= step;
		if(leapY < stopY) leapY = stopY;
		timer++;
	}
}