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
                        console.log(data);
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
                        console.log(data);
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
            icon.src = "./file.png";
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
            processedDiv.className = "container vertical nested disabled";
            processedElementActual.enabled = false;
            processedElementActual.div = processedDiv;
            vertical_div.appendChild(processedDiv);

        }
    }

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

    return [vertical_div, element_value];
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
            for (const property in parsed.subelements) {
                const output = processFile(property, []);
                query_result.appendChild(output[0]);
                parsed.enabled = false;
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
                    console.log("OPA!");
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
