import jsTPS from "../common/jsTPS.js"
import Top5List from "./Top5List.js";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"
import MoveItem_Transaction from "./transactions/MoveItem_Transaction.js"

/**
 * Top5Model.js
 * 
 * This class provides access to all the data, meaning all of the lists. 
 * 
 * This class provides methods for changing data as well as access
 * to all the lists data.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author PeteyLumpkins
 */
export default class Top5Model {
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.top5Lists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS IS WHETHER THE USER IS EDITING THE MODEL OR NOT
        this.editing = false;

        // THIS IS THE LIST BEING HOVERED OVER
        this.hoveringList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;
    }

    // Returns the list at the given index
    getList(index) {
        return this.top5Lists[index];
    }

    // Returns the current list being edited
    getCurrentList() {
        return this.currentList;
    }

    // Gets the index of a Top5List by it's ID
    getListIndex(id) {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    // Closes the current list
    closeList() {
        // Set current list to null, unselected highlighted lists
        this.currentList = null;
        this.unselectAll();

        // Clear workspace and update toolbars, need to disable
        // close button after clearing workspace
        this.view.clearWorkspace();

        // Also need to clear the status bar after closing
        this.view.updateStatusBarText("");
        this.view.updateToolbarButtons(this);
    }

    // Initializes the model view
    setView(initView) {
        this.view = initView;
    }

    // Adds a new Top5List to the model
    addNewList(initName, initItems) {
        let newList = new Top5List(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initItems)
            newList.setItems(initItems);
        this.top5Lists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.top5Lists);
        return newList;
    }

    // Deletes list at given index from Top5Lists
    deleteList(listIndex) {
        // If we are deleting the current list...
        if (this.currentList !== null && this.currentList.getId() === this.getList(listIndex).getId()) {
            // Set current list in model to null
            this.currentList = null;
            // Clear the workspace in the view
            this.view.clearWorkspace();
            // Clear the text in the status bar
            this.view.updateStatusBarText("");
        }

        // Delete the list from the top5lists
        this.top5Lists.splice(listIndex, 1);
        // Refresh the lists in the view
        this.view.refreshLists(this.top5Lists);
        // Update our toolbar in the view and buttons
        this.view.updateToolbarButtons(this);

        // If we didn't delete the current list, we need to rehighlight it,
        // refreshing the lists will unhighlight it
        if (this.currentList !== null) {
            this.view.highlightList(this.currentList.getId());
        }
    }

    // FIXME modified this a little bit, might not work right...
    sortLists() {
        this.top5Lists.sort((listA, listB) => {
            let aName = listA.getName().replace(" ", "").toLowerCase(); 
            let bName = listB.getName().replace(" ", "").toLowerCase();

            if (aName < bName) {
                return -1;
            }
            else if (aName === bName) {
                return 0;
            }
            else {
                return 1;
            }
        });
        this.view.refreshLists(this.top5Lists);
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    // Starts editing the name of a top5list 
    editListName(listId) {
        if (!this.editing) {
            this.view.appendListNameInput(listId, this.getList(this.getListIndex(listId)).getName());
            this.editing = true;
        }
    }

    // Starts editing the name of an item in the current list
    editItemName() {}

    // Sets editing to false -> indicates that we can edit something else in the model
    stopEditing() { this.editing = false; }

    // Checks if we are editing a text field 
    isEditing() { return this.editing; }

    // Sets the list being hovered over and highlights the list in the view
    setHoverList(id) {
        this.hoveringList = this.getList(this.getListIndex(id));
        this.view.mouseOverHighlight(id);
    }

    // Resets hoveringList and clears hovering highlight in the view
    resetHoverList(id) {
        this.hoveringList = null;
        this.view.mouseOverUnHighlight(id);
    }

    unselectAll() {
        // FIXME List id numbers won't always match up with index in top5 list
        // Needed to change to forEach -> get id of each element instead

        this.top5Lists.forEach((element) => {
            this.view.unhighlightList(element.getId());
        });
    }

    loadList(id) {
        let list = null;
        let found = false;
        let i = 0;
        while ((i < this.top5Lists.length) && !found) {
            list = this.top5Lists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                this.currentList = list;
                this.view.update(this.currentList);
                this.view.highlightList(id); // bug -> was "i" should have been "id"

                this.view.updateStatusBarText("Top 5 " + this.currentList.getName());

                found = true;
            }
            i++;
        }
        this.tps.clearAllTransactions();
        this.view.updateToolbarButtons(this);
    }

    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        let recentLists = localStorage.getItem("recent_work");
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.top5Lists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                let items = [];
                for (let j = 0; j < listData.items.length; j++) {
                    items[j] = listData.items[j];
                }
                this.addNewList(listData.name, items);
            }
            this.sortLists();   
            this.view.refreshLists(this.top5Lists);
            return true;
        }        
    }

    saveLists() {
        // WILL THIS WORK? @todo
        let top5ListsString = JSON.stringify(this.top5Lists);
        localStorage.setItem("recent_work", top5ListsString);
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    // Everything below here is basically for handling undo and redo operations
    addChangeItemTransaction = (id, newText) => {
        // GET THE CURRENT TEXT
        let oldText = this.currentList.items[id];
        let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);

        // Update toolbar after adding a new transaction
        this.view.updateToolbarButtons(this);
    }

    addMoveItemTransaction = (oldPosition, newPosition) => {
        let transaction = new MoveItem_Transaction(this, oldPosition, newPosition);
        this.tps.addTransaction(transaction);

        // Update the toolbar items after adding a transaction
        this.view.updateToolbarButtons(this);
    }

    // Moves the list items of the current list and updates the view
    moveItem(oldIndex, newIndex) {
        this.currentList.moveItem(oldIndex, newIndex);

        this.view.update(this.currentList);
        this.view.updateToolbarButtons(this);

        this.saveLists();
    }

    changeItem(id, text) {
        this.currentList.items[id] = text;

        this.view.update(this.currentList);
        this.view.updateToolbarButtons(this);

        this.saveLists();
    }

    // SIMPLE UNDO/REDO FUNCTIONS
    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    redo() {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.view.updateToolbarButtons(this);
        }
    }
}