var parsed;
var current_result;
var active_item;
var id_format = "1234567890-";

function toggleTree(element) {
    element.enabled = !element.enabled;
    changeIcon(element, element.icon_div);

    if (element.enabled) {
        element.tree_select.children[0].src = "./arrow_toggle.png";
        for (const property in element.subelements) {
            element.subelements[property].div.className = "container vertical nested";
        }
    } else {
        element.tree_select.children[0].src = "./arrow.png";
        for (const property in element.subelements) {
            element.subelements[property].div.className = "container vertical nested disabled";
        }
    }
}

function traverse(path) {
    let current = {...parsed};
    for (let i = 0; i < path.length; i++) {
        current = {...current};
        current = current.subelements[path[i]];
    }
    return current;
}
        



function changeFocus(element) {
    const frame = document.getElementById("content");
    let response;
    switch (element.type) {
        default:
        case "document":
        case "directory":
            response = fetch('./database/'+current_result+'/'+element.path.join('/')+"/"+"markdown.md")
                .catch((thing) => (console.log("ops!")))
                .then((response) => {
                    if (response.ok) {
                        return response.text();
                    } else {
                        return false;
                    }})
                .then((data) => {
                    if (data) {
                        if (active_item) {
                            active_item.className = "container";
                        }
                        element.item_title.className = "container enabled";
                        active_item = element.item_title;
                        const old_child = document.getElementById("content_child");
                        if (old_child) { old_child.remove();}
                        const child = document.createElement("div");
                        child.id = "content_child";
                        child.innerHTML = marked.parse(data);
                        frame.appendChild(child);
                    }
                });
            break;
        case "image":
            response = fetch('./database/'+current_result+'/'+element.path.join('/'))
                .catch((thing) => (console.log("ops!")))
                .then((response) => {
                    if (response.ok) {
                        return true;
                    } else {
                        return false;
                    }})
                .then((data) => {
                    if (data) {
                        element.path[-1]
                        if (active_item) {
                            active_item.className = "container";
                        }
                        element.item_title.className = "container enabled";
                        active_item = element.item_title;
                        const old_child = document.getElementById("content_child");
                        if (old_child) { old_child.remove();}
                        const child = document.createElement("div");
                        child.id = "content_child";

                        const image = document.createElement("img");
                        image.id = "display_image";
                        image.src = './database/'+current_result+'/'+element.path.join('/');
                        child.appendChild(image);
                        frame.appendChild(child);
                    }
                });
            break;

    }

}

function changeIcon(element, icon) {
    switch (element.type) {
        case "directory":
            if (element.enabled) {
                icon.src = "./open_folder.png";
            } else {
                icon.src = "./closed_folder.png";
            }
            return icon;
        case "document":
            icon.src = "./document.png";
            break;
        case "image":
            icon.src = "./image.png";
            break;
        default:
            response = fetch("./"+element.type+".png")
                .catch((thing) => (icon.src = "./file.png"))
                .then((response) => {
                    if (response.ok) {
                        icon.src = "./"+element.type+".png";
                    } else {
                        icon.src = "./file.png";
                    }})
                }
}
            

function getTreeSelectDiv(element, vertical_div) {
    switch (element.type) {
        case "document":
        case "directory":
            console.log(element);
            if (element.subelements && Object.keys(element.subelements).length > 0) {
                console.log("oi?");
                const node_div = document.createElement("div");
                node_div.className = "select_icon";
                const image = document.createElement("img");
                image.className = "icon";
                image.src = "./arrow.png";
                node_div.appendChild(image);
                element.icondiv = node_div;
                node_div.addEventListener('click', function(){
                    toggleTree(element);
                });
                return node_div;
            }
            break;
        default:
            console.log("sorry lol");
    }
}

function processFile(element, parent_path) {

    let count = 1;

    const element_path = [...parent_path];
    element_path.push(element);
    const element_value = traverse(element_path);
    element_value.path = element_path;
    const vertical_div = document.createElement("div");
    vertical_div.className = "container vertical";

    const horizontal_div = document.createElement("div");
    horizontal_div.className = "horizontal container item";

    const node_div = getTreeSelectDiv(element_value, vertical_div);

    vertical_div.appendChild(horizontal_div);

    if (element_value.subelements) {
        for (const property in element_value.subelements) {
            const processedElement = processFile(property, element_value.path);
            const processedDiv = processedElement[0];
            const processedElementActual = processedElement[1];
            console.log("checking how many elements in "+processedDiv.textContent);
            console.log(processedElement[2]);
            console.log(count);
            count+=processedElement[2];
            console.log(count);
            console.log("finished");
            processedDiv.className = "container vertical nested disabled";
            processedElementActual.enabled = false;
            processedElementActual.div = processedDiv;
            vertical_div.appendChild(processedDiv);

        }
    }

    console.log("after checking all, count is "+count);

    if (node_div) { horizontal_div.appendChild(node_div); }

    const item_title = document.createElement("div");
    item_title.className = "container";
    item_title.id = "item_title";
    const icon_div = document.createElement("img");
    icon_div.className = "icon";
    changeIcon(element_value, icon_div);
    element_value.icon_div = icon_div;
    element_value.tree_select = node_div;
    element_value.item_title = item_title;
    item_title.appendChild(icon_div);
    const overflow_text = document.createElement("div");
    overflow_text.className = "overflow_text";
    overflow_text.appendChild(document.createTextNode(element_value.title));
    item_title.appendChild(overflow_text);
    item_title.addEventListener('click', function(){
        changeFocus(element_value);
    });

    horizontal_div.appendChild(item_title);

    return [vertical_div, element_value, count];
}

function createResponse(search_result) {

    const response = fetch('./database/'+search_result+'/data.json')
        .then(response => response.json())
        .then(json => {
            parsed = json;
            current_result = search_result;
            const result = document.getElementById("query_result");
            if (result) {
                result.remove();
            }
            const tree = document.getElementById("tree");
            const query_result = document.createElement("div");
            query_result.className = "main_frame";
            query_result.id = "query_result";
            let count = 0;
            for (const property in parsed.subelements) {
                const output = processFile(property, []);
                count += output[2];
                query_result.appendChild(output[0]);
                parsed.enabled = false;
            }
            const files_loaded = document.getElementById("files");
            if (count != 1 ) {
                files_loaded.textContent = count+" files loaded";
            } else {
                files_loaded.textContent = count+" file loaded";
            }
            tree.appendChild(query_result);
        });
}

window.addEventListener('load', (event) => {
    var search_id = document.getElementById("search_id");
    search_id.addEventListener("keyup", (event) => {
        if (event.keyCode === 13) {
            var valid = true;
            for (let i = 0; i < search_id.value.length; i++) {
                if (!id_format.includes(search_id.value.charAt(i))) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                createResponse(search_id.value);
            }
                
        }
    });
});



// LOGIN FUNCTIONS



const icon = document.querySelector(".toggle-image")
const passwordInput = document.querySelector(".password")
const checkboxPassword = document.querySelector(".show-password")
const emailInput = document.querySelector(".email");
const submitButton = document.querySelector(".submit-button")


const correctLogins = [
    {
        email: 'bells95@scicpkl.inc.us',
        password: 'feynman@sWxw8Ml'
    },
    {
        email: 'johndoe@email.com',
        password: 'password123'
    },
    {
        email: 'kudy',
        password: '123'
    }
]


// events
checkboxPassword.addEventListener("click", showPasswordOnCheckbox)


function showPasswordOnCheckbox() {
    if (passwordInput.type === "password") {
        passwordInput.type = "text"
    }
    else {
        passwordInput.type = "password"
    }
}


const errorMessageLocation = document.querySelector(".error-message-wrapper")



function validate_form(email, password, dict) {
    let foundData = false;

    for (let i = 0; i < dict.length; i++) {
        if (email.value === dict[i].email && password.value === dict[i].password) {
            foundData = true
        }
    }

    if (!foundData) {
        generateErrorMessage("Your credentials do not match our current employee database.  Make sure your email and password are both correct and try again.", "If the problem persists, contact your department's employee assistance center and request a new TACY access password.")
    }
    else {
        console.log("Access Granted")
        renderMainContent()
    }
}


function generateErrorMessage(firstMessage, secondMessage) {
    const div = document.createElement('div')
    div.classList.add('message')
    errorMessageLocation.appendChild(div)

    const p1 = document.createElement("p")
    p1.innerHTML = firstMessage

    const p2 = document.createElement("p")
    p2.innerHTML = secondMessage

    div.appendChild(p1)
    div.appendChild(p2)
}



// makes the cursor load for 5 seconds
function loadMousePointer() {
    const body = document.querySelector("body");

    body.style.cursor = "wait";

    setTimeout(function() {
        body.style.cursor = "default";
    }, 5000);
}



// Hides the login form and displays the main content
function renderMainContent() {
    const loginContent = document.querySelector(".login-wrapper")
    loginContent.style.display = "none"

    const mainContent = document.querySelector(".content")

    mainContent.classList.add("active")
}


submitButton.addEventListener("click", function(e) {
    e.preventDefault()
    validate_form(emailInput, passwordInput, correctLogins)
    
})



// loading section logic
const blinkingTitle = document.querySelector(".blink-title")

function blinkFunction() {
    blinkingTitle.style.display = "none"
    setInterval(function() {
        if (blinkingTitle.style.display === "none") {
            blinkingTitle.style.display = "block"
        }
        else {
            blinkingTitle.style.display = "none"
        }

    }, 500)
    
    blinkingTitle.style.display = "block"
}

blinkFunction()



const displayDotsLocation = document.querySelector(".dots")


function dots(element) {
    element.innerHTML = ''
    const dotsInterval = setInterval(function(e) {
        element.innerHTML += '.'
        if (element.innerHTML === '....') {
            element.innerHTML = ''
            clearInterval(dotsInterval)
            setTimeout(dots(element), 166)
        }
    }, 166)

}

dots(displayDotsLocation)


function loadingBar() {
    const divLocation = document.querySelector(".progress-bar-inner")

    const div = document.createElement("div")
    div.classList.add("progress-square")

    divLocation.appendChild(div)

    console.log("div created")


}

let counter = 0

let stopLoadingBarEvent = setInterval(function(e) {
    loadingBar()
    counter++

    // if (counter < 8) {
    //     console.log("1000ms")
    // }
    // else if (counter < 16) {
    //     console.log("3500ms")
    // }
    // else {
    //     console.log("1000ms")
    // }

    if (counter === 20) {
        clearInterval(stopLoadingBarEvent)
        return
        // TODO redirect to homepage
    }

    
}, 100)


// ###########################################
// 5500ms ====> 100% ===> 20 blocks


// 1st
// 1000ms ====> 40% ===> 8 blocks

// 2nd
//  3500ms ====> 40% ===> 8 blocks

// 3th
// 1000ms ===> 20% ===> 4 blocks


// function burner(timeInterval, numberOfBlocks, stdPercentage=100) {
//     let percentageValue = "%"
//     setInterval(function(e) {
    
    //     })
    
    //     return percentageValue;
    // }
    
// ###########################################

const percentageLocation = document.querySelector(".percentage-value")



// const demo = setInterval(function(e) {
//     percentageValue++

//     percentageLocation.innerText = `${percentageValue}%`

//     if (percentageValue == 100) {
//         clearInterval(demo)
//     }
// }, speed)


function firstPart(speed, percentage) {
    const firstPartInterval = setInterval(function(e) {
        percentageValue++

        percentage.innerText = `${percentageValue}%`
    }, speed)
}


class Percentage {
    constructor(speed, percentageLocation, initialPercentage, finalPercentage) {
        this.speed = speed
        this.percentageLocation = percentageLocation
        this.initialPercentage = initialPercentage
        this.finalPercentage = finalPercentage
    }


    static timeSpanOne () {

    }


}


const firstPart = new Percentage(1000, percentageLocation, 0, 40)
const secondPart = new Percentage(3500, percentageLocation, 40, 80)
const thirdPart = new Percentage(1500, percentageLocation, 80, 100)





