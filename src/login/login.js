import { inject } from 'aurelia-dependency-injection';
import { ComponentService } from '../shared/component-service';
import { AuthServiceGTZ } from '../services'
import { lodash } from 'lodash';
import { Router, Redirect } from 'aurelia-router';

// import { api } from '../utils/api';
import { ApiService } from '../servicesApi'
import Primus from '../scripts/primus';

@inject(AuthServiceGTZ, ApiService, Router, Redirect)
export class Login {

    heading = 'Login';
    headingLogin = 'please login';

    password = '';

    constructor(authgtz, api, router, redirect) {

        this.authgtz = authgtz;
        this.authgtz.isAuthenticated = false;
        this.authgtz.loginuserid = "";
        this.message = "Security";
        this.theRouter = router;
        this.api = api
    }

    //  activate(params, queryString, routeConfig) {

    // this.param = routeConfig.params.childRoute;
    // if (   this.param === undefined )    this.param =0;
    // if (this.authgtz.users.length === 0) {
    //     return api.getUsers().then((jsonRes) => {
    //         this.users = jsonRes.data;
    //   })
    // } else {
    //     this.users = this.authgtz.users;
    // }

    // }

    login() {

        let apos = '';

        let em = this.email.toUpperCase()
        let pass = this.password;
        this.api.getUserJwt(em, pass)
            .then((jsonRes) => {

                if (jsonRes.code === "E_WRONG_PASSWORD") {

                    this.authgtz.isAuthenticated = false;
                    this.authgtz.loginuserid = "";
                    this.authgtz.user = '';
                    this.headingLogin = 'Please check useranme or password ';



                } else {


                    this.authgtz.token = jsonRes.token;
                    this.authgtz.user = jsonRes.user.username;
                    this.authgtz.loginuserid = jsonRes.user.id;
                    // if (jsonRes.data.token.length > 10) {
                    this.authgtz.isAuthenticated = true;
                    this.serverType = 'local';

                    ////primus
                    let token = this.authgtz.token;
                     const primus = new Primus(`ws://localhost:3000?token=${token}`)
                    // const primus = new Primus(`ws://192.168.15.45:3000?token=${token}`)
                    console.log('primus ',token,primus)

                    primus.on('initialised', data => {
                        console.log('initialised', data)
                    });

                    primus.on('connexion', data => {
                        console.log('connexion', data)
                    });

                    primus.on('disconnect', data => {
                        console.log('disconnect', data)
                    });

                    primus.on('create', (model, data) => {
                        console.log('create', model, data);
                        this._emitter.next({ command: 'create', type: model, item: data, id: data.id });
                    });

                    primus.on('update', (model, data) => {
                        console.log('update', data);
                        this._emitter.next({ command: 'update', type: model, item: data, id: data.id });
                    });

                    primus.on('destroy', (model, data) => {
                        console.log('destroy', data);
                        this._emitter.next({ command: 'destroy', type: model, item: data, id: data.id });
                    });

                    primus.on('notification', data => {
                        this._notificationService.manageNotification(data)
                        console.log('notification', data)
                    });

                    primus.on('error', data => {
                        console.log(data);
                        debugger;
                    });
                    primus.join('room');
                    primus.join('device');
                    primus.join('notification');

                    ////end primus
                    this.theRouter.navigate("todo/index");
                }

            });

    }


    attached() {
        Materialize.updateTextFields();


    }

}
