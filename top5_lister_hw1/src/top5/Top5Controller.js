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
        document.getElementById("add-list-button").onmousedown = (event) => {
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
            this.model.loadList(newList.id);
            this.model.saveLists();
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }

        // SETUP REDO BUTTON
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }

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

                // Transfer the text content of the item we're dragging
                event.dataTransfer.setData("oldIndex", this.model.getCurrentList().getItemIndex(event.target.textContent));
                
            }

        }

        // TODO Sets up drop box handlers here too
        this.registerDropBoxHandlers();
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
            
            let textInput = document.createElement("input");
            textInput.type = "text";
            textInput.classList = ["title-input"];

            textInput.id = "list-text-input-" + id;
            textInput.value = this.model.getList(id).getName();

            document.getElementById("list-card-text-" + id).innerHTML = "";
            document.getElementById("list-card-text-" + id).appendChild(textInput);

            textInput.ondblclick = (ev) => {
                this.ignoreParentClick(ev);
            }

            textInput.onkeydown = (ev) => {
                if (ev.key === "Enter") {
                    // Saves the new name of the list to our model
                    this.model.getList(this.model.getListIndex(id)).setName(ev.target.value);
                    this.model.saveLists();

                    // Removes text input element from the view
                    textInput.parentNode.removeChild(textInput);

                    // Updates the view with the new name
                    document.getElementById("list-card-text-" + id).append(ev.target.value)
                    
                }
            }

            textInput.onblur = (ev) => {
                this.model.restoreList();
            }

        }

        // TODO FOR HOVERING OVER THE LISTS
        document.getElementById("top5-list-" + id).onmouseover = (event) => {
            this.model.selectHoverList(id);
        }

        // TODO  FOR UNHOVERING OVER THE LISTS
        document.getElementById("top5-list-" + id).onmouseout = (event) => {
            this.model.unselectHoverList(id);
        }

        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(id).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");
        }
    }

    // TODO register the container, "edit-items" as a dropbox
    registerDropBoxHandlers() {

        // TODO handles dropping of list item
        document.getElementById("edit-items").ondrop = (event) => {
            event.preventDefault();

            if (event.target.parentNode.id === "edit-items") {
                let oldIndex = event.dataTransfer.getData("oldIndex");
                let newIndex = this.model.getCurrentList().getItemIndex(event.target.textContent);

                // Adding transaction also performs the transaction
                this.model.addMoveItemTransaction(oldIndex, newIndex);
            }
        }

        // TODO Prevents drag action from being stopped I think
        document.getElementById("edit-items").ondragover = (event) => {
            event.preventDefault();
        }

    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}