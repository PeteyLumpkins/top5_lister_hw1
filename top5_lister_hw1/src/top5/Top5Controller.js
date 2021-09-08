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

                event.dataTransfer.setData("id", event.target.id);

                // Creates a dummy element with id = "dummy"
                let dummy = document.createElement("div");
                dummy.id = "item-dummy";

                // Inserts dummy element where original element we are dragging was
                let parent = document.getElementById("edit-items");
                parent.insertBefore(dummy, event.target.nextSibling);
                
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

            let dummy = document.getElementById("item-dummy");

            // Location we drop at must be within the parent element
            if (event.target.parentNode.id === "edit-items") {
                let id = event.dataTransfer.getData("id");
                let hoverId = event.target.id;
                
                // Getting elements
                let parent = document.getElementById("edit-items");
                let prev = document.getElementById(hoverId);

                // Getting dimensions of items
                let dummyRect = dummy.getBoundingClientRect();
                let prevRect = prev.getBoundingClientRect();

                let curr = document.getElementById(id);

                let prevY = (prevRect.bottom - prevRect.top) / 2 + prevRect.top;
                let dummyY = (dummyRect.bottom - dummyRect.top) / 2 + dummyRect.top;

                if (prevY >= dummyY) {
                    parent.insertBefore(curr, prev.nextSibling);
                } else {
                    parent.insertBefore(curr, prev);
                }
                dummy.parentNode.removeChild(dummy);
            }
            // Dummy is created whether drop is in valid place or not, so need to 
            // remove regardless of condition

            // TODO update the model!!!
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