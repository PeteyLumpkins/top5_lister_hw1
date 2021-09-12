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

    // TODO highlighting element that we are hovering over
    setHoverList(id) {
        this.hoveringList = this.getList(this.getListIndex(id));
        this.view.mouseOverHighlight(id);
    }

    // TODO unhighlighting element when we move out of it
    resetHoverList(id) {
        this.hoveringList = null;
        this.view.mouseOverUnHighlight(id);
    }

    unselectAll() {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            this.view.unhighlightList(i);
        }
    }

    // FIXME There is something wrong with the highlighting going on with selected list
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
                this.view.highlightList(id); // FIXME bug -> was "i" should have been "id"

                this.view.updateStatusBarText(this.currentList.getName());

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

    // TODO moves the list items of the current list and updates the view
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