import { TodoItem } from './todo-item';
import lodash from 'lodash';
import { AuthServiceGTZ } from '../services';
// import { api } from '../utils/api';
import { ApiService } from '../servicesApi'
import Primus from '../scripts/primus';
import { inject } from 'aurelia-framework';
import { ObserverLocator } from 'aurelia-binding';
const ENTER_KEY = 13;

@inject(AuthServiceGTZ, ApiService, ObserverLocator)

// const STORAGE_NAME = 'todomvc-aurelia';
export class Todos {
    //   static inject() { return [ObserverLocator]; }

    constructor(authgtz, api, observerLocator) {
        this.observerLocator = observerLocator;

        this.authgtz = authgtz;
        this.suspendSave = false;
        this.newTodoDescription = '';
        this.items = [];
        this.selectedlen = 0;
        this.includeArchived = false;
        this.api = api
        this.getTodos();
        //   this.dataservice.addPropertyChangeHandler(this.propertyChanged.bind(this));
    }

    onSelectionChanged(e) {
        let selected = this.list.getSelected();
        this.selectedlen = selected.length;
        let titles = selected.map(i => i.title);
        e.detail.item.isSelected = !e.detail.item.isSelected
        this.logger.log('selection changed: ' + e.detail.item.isSelected + ' ' + titles.join(', '));
        // this.logger.log(`selection changed ${e.detail.item.name}`);
    }
    getTodos() {
        let token = this.authgtz.token;
        let user = this.authgtz.user;
        let userid = 11832;//this.authgtz.loginuserid;

        this.api.getTodostoken(userid, token)
            .then((jsonRes) => {

                this.items = jsonRes;// .data;
                console.log('Fetched Todos this.items' + this.items);//a.data);
            })
    }
    process() {



        let token = this.authgtz.token;
        let selected = this.list.getSelected();
        let counter = selected.length;

        for (let val of selected) {
            let x = this.items.indexOf(val)
            this.items.splice(x, 1);
            // this works but cant get rid of checkmark

        }

        lodash.forEach(selected, function (rec, idx) {
            rec.status = 'closed';
            rec.IsDone = true;
            rec.isSelected = false
            // rec.open = false;
            // rec.isComplete = true;
            // rec.completed = true;
            // rec.IsArchived = true;

            api.updateTodo(rec, token)
                .then((jsonRes) => {

                })
            // this.items.splice(idx, 1);     //removeTodo

        });
        // if (selected.length>0) this.getTodos();// refresh as a temp solution
        // this.list.setSelected='';
        selected = ''
        this.selectedlen = selected.length;

        // this.getTodos()


    }

    get markAllCompleted() {
        return this.items.filter(x => !x.IsDone && !x.IsArchived).length === 0;
    }
    set markAllCompleted(newValue) {
        this.items.filter(x => !x.IsArchived).forEach(x => x.IsDone = newValue);
        this.save();
    }

    get archiveCompletedMessage() {
        var count = this.getStateOfItems().itemsDoneCount;
        if (count > 0) {
            return "Archive " + count + " completed item" + (count > 1 ? "s" : "");
        }
        return null;
    }

    get itemsLeftMessage() {
        var count = this.getStateOfItems().itemsLeftCount;
        if (count > 0) {
            return count + " item" + (count > 1 ? "s" : "") + " left";
        }
        return null;
    }

    archiveCompletedItems() {
        var state = this.getStateOfItems();
        this.suspendSave = true;
        state.itemsDone.forEach(item => {
            if (!this.includeArchived) {
                this.items.splice(this.items.indexOf(item), 1);
            }
            item.IsArchived = true;
        });
        this.suspendSave = false;
        this.save();
    }




    addItem() {
        var description = this.newTodoDescription;
        if (!description) { return; }


        var item = ({
            title: description,
            name: 'trails demo ',
            user: "11832",
            status: 'open',
            open: true,
            completed: false,
            isComplete: false,
            IsDone: false,
            isSelected: false,
            archivednote: ''

        });

        let token = this.authgtz.token;
        let user = this.authgtz.user;
        let userid = 11832;//this.authgtz.loginuserid;

        this.api.addTodo(userid, item, token)
            .then((data) => {
                // this.newnote =data;// data[0].title; 

            });

        this.items.push(item);
        this.newTodoDescription = '';
    }

    editBegin(item) {
        //        item.isEditing = true;
        if (item.IsDone) {
            item.IsDone = false;
            //  item.IsArchived= false;
            item.archivednote = '';
        } else {
            item.IsDone = true;
            //  item.IsArchived= true;
            item.archivednote = 'maked for archive';
        }
        return
    }

    editEnd(item) {
        item.isEditing = false;
    }

    deleteItem(item) {
        this.items.splice(this.items.indexOf(item), 1);
        //this.dataservice.deleteTodoAndSave(item);
    };

    getStateOfItems() {
        var itemsDone = [], itemsLeft = [];

        this.items.forEach(item => {
            if (item.IsDone) {
                if (!item.IsArchived) {
                    itemsDone.push(item); // only unarchived items
                }
            } else {
                itemsLeft.push(item);
            }
        });

        return {
            itemsDone: itemsDone,
            itemsDoneCount: itemsDone.length,
            itemsLeft: itemsLeft,
            itemsLeftCount: itemsLeft.length
        };
    }

    propertyChanged(changeArgs) {
        // propertyChanged triggers save attempt UNLESS the property is the 'Id'
        // because THEN the change is actually the post-save Id-fixup
        // rather than user data entry so there is actually nothing to save.
        if (changeArgs.args.propertyName !== 'Id') {
            this.save();
        }
    }

    purge() {
        return this.dataservice.purge(() => this.getTodos());
    }

    reset() {
        return this.dataservice.reset(() => this.getTodos());
    }

    save(force) {
        // Save if have changes to save AND
        // if must save OR save not suspended
        // if (this.dataservice.hasChanges() && (force || !this.suspendSave)) {
        //     return this.dataservice.saveChanges();
        // }
        // Decided not to save; return resolved promise w/ no result
        return new Promise((resolve, reject) => resolve(false));
    }
}
