/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author PeteyLumpkins
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS

        // Sets up add list button handlers
        this.initAddListButton();

        // Sets up close button handlers
        this.initCloseButton();

        // Sets up undo button handlers
        this.initUndoButton();

        // Sets up redo button handlers
        this.initRedoButton();

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // TODO SET DRAGGABLE TO FALSE
                    item.draggable = false;

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                        item.draggable = true;
                    }

                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                        }
                        item.draggable = true;
                    }

                    textInput.onblur = (event) => {
                        this.model.restoreList();
                        item.draggable = true;
                    }

                }
            }

            // TODO FOR DRAGGING ITEMS
            item.ondragstart = (event) => {
                
                let elements = document.getElementById("edit-items").children
                let oldIndex = 0;

                while (elements[oldIndex].id !== event.target.id) {
                    oldIndex += 1;
                }

                event.dataTransfer.setData("oldIndex", oldIndex);
                
                // Transfer the text content of the item we're dragging
                // event.dataTransfer.setData("oldIndex", this.model.getCurrentList().getItemIndex(event.target.textContent));
                
            }

        }

        // TODO Sets up drop box handlers here too
        this.registerDropBoxHandlers();
    }

    // Sets up controls for add list button
    initAddListButton() {
        let button = document.getElementById("add-list-button");

        // Clicking add list creates and adds new list to the view
        button.onmousedown = (event) => {
            if (!this.model.hasCurrentList()) {
                let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
                this.model.loadList(newList.id);
                this.model.saveLists();
            }
        }

        // While hovering
        button.onmouseover = (event) => {
            if (!button.classList.contains("disabled")) {
                button.style.cursor = "pointer";
            }
        }

        button.onmouseout = (event) => {
            button.style.cursor = "default";
        }
    }

    // Sets up controls for close list button
    initCloseButton() {
        let button = document.getElementById("close-button")

        // Close the list, change cursor style back to default
        button.onmousedown = (event) => {
            this.model.closeList();
            button.style.cursor = "default";
        }

        // Change style to pointer while hovering and button enabled
        button.onmouseover = (event) => {
            if (!button.classList.contains("disabled")) {
                button.style.cursor = "pointer";
            }
        }
    }

    // Sets up controls for undo button
    initUndoButton() {
        let button = document.getElementById("undo-button");

        button.onmousedown = (event) => {
            this.model.undo();
            if (button.classList.contains("disabled")) {
                button.style.cursor = "default";
            }
        }

        button.onmouseover = (event) => {
            if (!button.classList.contains("disabled")) {
                button.style.cursor = "pointer";
            }
        }
    }

    // Sets up controls for redo button
    initRedoButton() {
        let button = document.getElementById("redo-button")
        
        button.onmousedown = (event) => {
            this.model.redo();
            if (button.classList.contains("disabled")) {
                button.style.cursor = "default";
            }
        }

        button.onmouseover = (event) => {
            if(!button.classList.contains("disabled")) {
                button.style.cursor = "pointer";
            }
        }
    }

    registerCursorStyle(id, style) {
        let elem = document.getElementById(id);
        elem.onmouseover = (event) => {
            elem.style.cursor = style;
        }
    }

    registerListSelectHandlers(id) {

        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();

            // GET THE SELECTED LIST
            this.model.loadList(id);
        }

        // TODO FOR CHANGING LIST NAME
        document.getElementById("list-card-text-" + id).ondblclick = (event) => {
            this.model.editListName(id);
        }
        
        // FOR HOVERING OVER THE LISTS
        document.getElementById("top5-list-" + id).onmouseover = (event) => {
            this.model.setHoverList(id);
        }

        // FOR UNHOVERING OVER THE LISTS
        document.getElementById("top5-list-" + id).onmouseout = (event) => {
            this.model.resetHoverList(id);
        }

        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;

            // FIXME make sure to get index of list first, then call get list

            let listName = this.model.getList(this.model.getListIndex(id)).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");

            document.getElementById("dialog-confirm-button").onmousedown = (event) => {
                // Clear the delete box
                let modal = document.getElementById("delete-modal");
                modal.classList.remove("is-visible");

                // Delete the list
                this.model.deleteList(this.model.getListIndex(id));
                this.model.saveLists();
            }

            document.getElementById("dialog-cancel-button").onmousedown = (event) => {
                // Clear the delete box
                let modal = document.getElementById("delete-modal");
                modal.classList.remove("is-visible");

                // Don't do anythng else
            }
        }
    }

    // Registers the container, "edit-items" as a dropbox
    registerDropBoxHandlers() {

        // TODO handles dropping of list item
        document.getElementById("edit-items").ondrop = (event) => {
            event.preventDefault();

            if (event.target.parentNode.id === "edit-items") {
                let oldIndex = event.dataTransfer.getData("oldIndex");

                let elements = document.getElementById("edit-items").children
                let newIndex = 0;

                while (elements[newIndex].id !== event.target.id) {
                    newIndex += 1;
                }
            
                this.model.addMoveItemTransaction(oldIndex, newIndex);

                // this.model.getCurrentList().getItemIndex(event.target.textContent);

                // Adding transaction also performs the transaction
                // this.model.addMoveItemTransaction(oldIndex, newIndex);
            }
        }

        // TODO Prevents drag action from being stopped I think
        document.getElementById("edit-items").ondragover = (event) => {
            event.preventDefault();
        }

    }

    // Registers handlers for the text-input field with given id
    registerListNameEditField(inputId, listId) {
        let textInput = document.getElementById(inputId);

        document.body.onclick = (ev) => {
            if (this.model.isEditing() && ev.target.id !== inputId) {
                // Saves the new name of the list to our model
                this.model.getList(this.model.getListIndex(listId)).setName(textInput.value);
                
                // Resort our top5lists
                this.model.sortLists();

                this.model.loadList(this.model.getCurrentList().getId());

                // Save the lists
                this.model.saveLists();

                // Removes text input element from the view
                textInput.parentNode.removeChild(textInput);

                // Updates the view with the new name
                // document.getElementById("list-card-text-" + listId).append(ev.target.value)
                this.model.stopEditing();
            }
        }

        textInput.ondblclick = (ev) => {
            this.ignoreParentClick(ev);
        }

        textInput.onkeydown = (ev) => {
            if (ev.key === "Enter") {
                // Saves the new name of the list to our model
                this.model.getList(this.model.getListIndex(listId)).setName(ev.target.value);

                // Resort our top5lists
                this.model.sortLists();

                this.model.loadList(this.model.getCurrentList().getId());

                // Save the lists
                this.model.saveLists();

                // Removes text input element from the view
                textInput.parentNode.removeChild(textInput);

                // Updates the view with the new name
                // document.getElementById("list-card-text-" + listId).append(ev.target.value)
                this.model.stopEditing();
            }
        }

        textInput.onblur = (ev) => {
            this.ignoreParentClick(ev);
        }
    }

    registerListItemEditField(inputId, listId) {

    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}