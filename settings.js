/* Feel free to change, add and remove elements, but MAKE SURE it is valid JSON.
 Common mistakes:
 1. Not including comma after every element (except for last, or first if only one)
 2. Including a comma on last element.
 Use http://jsonlint.com/ to validate WITHOUT the "var foo = " part.
 */
var alerts = {
    "idle": {
        "value": "If you have difficulty using the touchscreen, press the blue, diamond-shaped EZ Help button.",
        "wait": "-1" // In milliseconds, -1 for infinity
    },
    "top": [
        {"value": ""},
        {"value": "First item on screen."},
        {"value": "First item on screen.<br>Use the Down arrow button."},
        {"value": "You are on the first item on this screen.<br>Use the Down arrow button to move back down through the rest of the items"},
        {"value": "You are still on the first item at the top of this screen.<br>Please, use the Down arrow button to move back down through the rest of the items on this screen"},
        {"value": "The Down arrow button is just below the button that you most recently pressed."}
    ],
    "bottom": [
        {"value": ""},
        {"value": "Last item on screen."},
        {"value": "Last item on screen.<br>Use the Up arrow button."},
        {"value": "You are on the last item on this screen.<br>Use the Up arrow button to move back down through the rest of the items."},
        {"value": "You are still on the last item at the bottom of this screen.<br>Please, use the Up arrow button to move back down through the rest of the items on this screen."},
        {"value": "The Up arrow button is just above the button that you most recently pressed."}
    ]
};
var sounds = [
    {
        "name": "action",
        "src": "earcons/action.wav"
    },
    {
        "name": "action-none",
        "src": "earcons/action-none.wav"
    },
    {
        "name": "action-check",
        "src": "earcons/action-check.wav"
    },
    {
        "name": "action-uncheck",
        "src": "earcons/action-uncheck.wav"
    },
    {
        "name": "nav-interactive",
        "src": "earcons/nav-interactive.wav"
    },
    {
        "name": "nav-move",
        "src": "earcons/nav-move.wav"
    },
    {
        "name": "nav-checked",
        "src": "earcons/nav-checked.wav"
    },
    {
        "name": "nav-unchecked",
        "src": "earcons/nav-interactive.wav"
    },
    {
        "name": "pagechange",
        "src": "earcons/pagechange.wav"
    },
    {
        "name": "nav-alert",
        "src": "earcons/alert.wav"
    }
];