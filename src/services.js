import { inject, singleton } from 'aurelia-dependency-injection';

@inject()
export class AuthServiceGTZ {

    constructor(http) {
        this.user = {};// new way not used 7/24/2016
        this.email = '';
        this.loginuserid = '';
        this.roles = [];
        this.roleid = '';
        this.users = [];// old way not used 7/24/2016
        this.article = {}; // put artile here
        this.isAuthenticated = '';
        this.token = "";

    }

    isLoggedIn() {
        return this.user !== '';
    }
}

