/**
 * Top5ListView.js
 * 
 * This class deals with the view of our Web application providing services
 * for loading data into our controls and building other UI controls.
 * 
 * @author McKilla Gorilla
 * @author PeteyLumpkins
 */
export default class Top5View {
    // REFRESHES ALL THE LISTS IN THE LEFT SIDEBAR
    refreshLists(lists) {
        // GET THE UI CONTROL WE WILL APPEND IT TO
        let listsElement = document.getElementById("sidebar-list");
        listsElement.innerHTML = "";

        for (let i = 0; i < lists.length; i++) {
            let list = lists[i];
            this.appendListToView(list);
        }
    }

    setController(initController) {
        this.controller = initController;
    }

    // ADDS A LIST TO SELECT FROM IN THE LEFT SIDEBAR
    appendListToView(newList) {
        // MAKE AND ADD THE NODE
        let listId = "top5-list-" + newList.id;

        // MAKE THE CARD DIV
        let card = document.createElement("div");
        card.setAttribute("id", listId);
        card.setAttribute("class", "list-card");
        card.setAttribute("class", "unselected-list-card");

        // MAKE THE TEXT SPAN
        let textSpan = document.createElement("span");
        textSpan.setAttribute("id", "list-card-text-" + newList.id);
        textSpan.setAttribute("class", "list-card-text");
        textSpan.appendChild(document.createTextNode(newList.name));

        // MAKE THE DELETE LIST BUTTON
        let deleteButton = document.createElement("input");
        deleteButton.setAttribute("type", "button");
        deleteButton.setAttribute("id", "delete-list-" + newList.id);
        deleteButton.setAttribute("class", "list-card-button");
        deleteButton.setAttribute("value", "\u2715");

        // PUT EVERYTHING IN THE MOST OUTER DIV
        card.appendChild(textSpan);
        card.appendChild(deleteButton);

        // AND PUT THE NEW CARD INTO THE LISTS DIV
        let listsElement = document.getElementById("sidebar-list");
        listsElement.appendChild(card);

        // SETUP THE HANDLER FOR WHEN SOMEONE MOUSE CLICKS ON OUR LIST
        this.controller.registerListSelectHandlers(newList.id);

    }

    // Adds text field to input new list name
    appendListNameInput(listId, textValue) {
        let textInput = document.createElement("input");
        textInput.type = "text";
        textInput.classList = ["title-input"];

        textInput.id = "list-text-input-" + listId;
        textInput.value = textValue;

        document.getElementById("list-card-text-" + listId).innerHTML = "";
        document.getElementById("list-card-text-" + listId).appendChild(textInput);

        // Setup handlers for this input thingy
        this.controller.registerListNameEditField(textInput.id, listId);
    }

    /**
     * Updates the views workspace of list-items with the given list. The given list 
     * should be the list as the models current list.
     * 
     * @param {*} list the list of items from the model we want to fill the list-items
     * with.
     */
    update(list) {
        let items = document.getElementById("edit-items").children;

        for (let i = 0; i < items.length; i++) {
            // let item = document.getElementById("item-" + (i+1));
            let item = items[i];

            item.innerHTML = "";
            this.enableDrag(item.id);
            // We initially set list items to draggable
            // this.enableDrag("item-" + (i + 1));
            
            item.appendChild(document.createTextNode(list.getItemAt(i)));
        }
    }

    /**
     * Removes the text for all of the list-items and disables dragging 
     * for each of the list-item elements.
     */
    clearWorkspace() {
        // REMOVE THE ITEMS
        for (let i = 0; i < 5; i++) {
            let item = document.getElementById("item-" + (i+1));
            item.innerHTML = "";

            // When there's no items, they shouldn't be draggable
            item.draggable = false;
        }
    }

    /**
     * Disables the button with the given id
     * 
     * @param {*} id the id of the button to be disabled
     */
    disableButton(id) {
        let button = document.getElementById(id);
        button.classList.add("disabled");
    }

    /**
     * Enables the button with the given id 
     * 
     * @param {*} id the id of the button to be enabled
     */
    enableButton(id) {
        let button = document.getElementById(id);
        button.classList.remove("disabled");
    }

    /**
     * Enables dragging for the list-item with the given id
     * 
     * @param {*} id the id of the list-item we want to enable dragging for
     */
    enableDrag(id) {
        let item = document.getElementById(id);
        item.draggable = true;
    }

    /**
     * Disables dragging for the list-item with the given id
     * 
     * @param {*} id the id of the list-item we want to disable dragging for
     */
    disableDrag(id) {
        let item = document.getElementById(id);
        item.draggable = false;
    }

    /**
     * Highlights the list we are hovering over
     * 
     * @param {*} listId the id of the list we want to highlight
     */
    mouseOverHighlight(listId) {
        let listCard = document.getElementById("top5-list-" + listId);
        listCard.classList.add("hovering-list-card");
    }

    /**
     * Unhighlights the list name we were hovering over
     * 
     * @param {*} listId the id of the list we want to unhighlight
     */
    mouseOverUnHighlight(listId) {
        let listCard = document.getElementById("top5-list-" + listId);
        listCard.classList.remove("hovering-list-card");
    }

    /**
     * Highlights the list as the selected list with the given id 
     * 
     * @param {*} listId the id of the list we want to highlight
     */
    highlightList(listId) {
        // HIGHLIGHT THE LIST
        let listCard = document.getElementById("top5-list-" + listId);
        listCard.classList.remove("unselected-list-card");
        listCard.classList.add("selected-list-card");
    }

    /**
     * Updates the pinkish status bar with the given text 
     * 
     * @param {*} text the text we want to display in the status bar
     */
    updateStatusBarText(text) {
        let statusBar = document.getElementById("top5-statusbar");
        // First we clear the status bar
        statusBar.innerHTML = "";
        // Then we add the new title to the status status bar
        statusBar.append(text);
    }

    /**
     * Unhighlights the list with the given id in the view
     * 
     * @param {*} listId the id of the list we want to unhighlight
     */
    unhighlightList(listId) {
        // UNHIGHLIGHT THE LIST
        let listCard = document.getElementById("top5-list-" + listId);
        listCard.classList.add("unselected-list-card");
        listCard.classList.remove("selected-list-card");
    }

    /**
     * Updates all of the buttons in the toolbar, either enabling or 
     * disabling them.
     * 
     * @param {*} model the model that the view represents
     */
    updateToolbarButtons(model) {
        let tps = model.tps;

        // Enable/Disable undo button
        if (tps.hasTransactionToUndo() && model.hasCurrentList()) {
            this.enableButton("undo-button");
        } else {
            this.disableButton("undo-button");
        }
        
        // Enable/Disable redo button
        if (tps.hasTransactionToRedo() && model.hasCurrentList()) {
            this.enableButton("redo-button");
        } else {
            this.disableButton("redo-button");
        }

        // Enable/Disable close list button
        if (model.hasCurrentList()) {
            this.enableButton("close-button");
        } else {
            this.disableButton("close-button");
        }

        // Enable/Disable add list button
        if (model.hasCurrentList()) {
            this.disableButton("add-list-button");
        } else {
            this.enableButton("add-list-button");
        }
    }
}