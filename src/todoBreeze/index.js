import { TodoItem } from './todo-item';
import lodash from 'lodash';
import { AuthServiceGTZ } from '../services';
import { api } from '../utils/api';
import { inject } from 'aurelia-framework';
import { ObserverLocator } from 'aurelia-binding';
//import {inject, LogManager, ObserverLocator} from 'aurelia-framework';
const ENTER_KEY = 13;
@inject(AuthServiceGTZ,ObserverLocator)
// const STORAGE_NAME = 'todomvc-aurelia';
export class Todos {
   // static inject() { return [ObserverLocator]; }
    constructor(authgtz, observerLocator) {
        this.observerLocator = observerLocator;
        //    observerLocator.getObserver(this, 'includeArchived')
        //     .subscribe(() => this.getTodos());

        this.authgtz = authgtz;
        this.suspendSave = false;
        this.newTodoDescription = '';
        this.items = [];
        this.selectedlen = 0;
        this.includeArchived = false;

        this.getTodos();
        //   this.dataservice.addPropertyChangeHandler(this.propertyChanged.bind(this));
    }

    onSelectionChanged(e) {
        let selected = this.list.getSelected();
        this.selectedlen = selected.length;
        let titles = selected.map(i => i.title);
        this.logger.log('selection changed: ' + titles.join(', '));
        // this.logger.log(`selection changed ${e.detail.item.name}`);
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
        this.selectedlen = selected.length;

// this.getTodos()


    }

  

    getTodos() {
         let token = this.authgtz.token;
        let user = this.authgtz.user;
        let userid = 11832;//this.authgtz.loginuserid;
       
        api.getTodostoken(userid, token)
            .then((jsonRes) => {

                this.items = jsonRes;// .data;
                console.log('Fetched Todos this.items' + this.items);//a.data);
               })
    }
    //,   error => logger.error(error.message, "Query failed"));


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
            archivednote: ''

        });

        let token = this.authgtz.token;
        let user = this.authgtz.user;
        let userid = 11832;//this.authgtz.loginuserid;

        api.addTodo(userid, item, token)
            .then((data) => {
                // this.newnote =data;// data[0].title; 

            });

        this.items.push(item);
        this.newTodoDescription = '';
    }

   ////////////////////

get markAllCompleted() {
   console.log('this is being watched ')
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

//   getTodos() {
//     this.dataservice.getTodos(this.includeArchived)
//       .then(
//         data => {
//           this.items = data.results;
//           logger.info('Fetched Todos ' + (this.includeArchived ? 'including archived' : 'excluding archived'));
//         },
//         error => logger.error(error.message, "Query failed"));
//   }

//   addItem() {
//     var description = this.newTodoDescription;
//     if (!description) { return; }

//     var item = this.dataservice.createTodo({
//       Description: description,
//       CreatedAt: new Date(),
//       IsDone: false
//     });

//     this.save(true).catch(
//       () => {
//         var index = this.items.indexOf(item);
//         if (index > -1) {
//           setTimeout(() => this.items.splice(index, 1), 2000);
//         }
//       });
//     this.items.push(item);
//     this.newTodoDescription = '';
//   }

  editBegin(item) {
    item.isEditing = true;
  }

  editEnd(item) {
    item.isEditing = false;
  }

  deleteItem(item) {
    this.items.splice(this.items.indexOf(item), 1);
    this.dataservice.deleteTodoAndSave(item);
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
    //   return this.dataservice.saveChanges();
    // }
    // Decided not to save; return resolved promise w/ no result
    return new Promise((resolve, reject) => resolve(false));
  }


   ///////////////////



}
