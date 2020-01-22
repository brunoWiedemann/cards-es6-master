const axios = require("axios");

class App {
    constructor() {
        this.buttonCreate = document.getElementById("btn_create");
        this.buttonLogin = document.getElementById("btn_login");
        this.buttonEdit = document.getElementById("btn_edit");
        
        this.title = document.getElementById("input_title");
        this.content = document.getElementById("input_content");
        
        this.email = document.getElementById("input_email");
        this.password = document.getElementById("input_password");
        this.configAuth = null;
        
        this.cardEditing = null;
        
        // this.url = 'https://api-scrapbook.herokuapp.com/cards/';
        this.url = 'http://localhost:3333/cards/';
        this.urlLogin = 'http://localhost:3333/login';
        
        this.getScraps(this);
        this.registerEvents();
    }   
    
    registerEvents() {
        this.buttonCreate.onclick = (event) => this.createCard(event);
        this.buttonLogin.onclick = (event) => this.loginUser(event);
        this.buttonEdit.onclick = (event) => this.editCard(event);
    }
    
    authToken(){
        // const token = sessionStorage.getItem('token');
                
        const auth = {
            headers: { Authorization: `Bearer ${this.configAuth}` },
        };
        return auth;
    }
    
    getScraps(app) {
        axios.get(this.url, app.authToken())
        .then(function (response) {
            app.recoveryScraps(response.data);
            
        })
        .catch(function (error) {
            console.log(error);
            const formLoginShow = $("#row_login").modal('show');
        })
        .finally(function () {
        });
    }
    
    recoveryScraps(data) {
        for(item of data) {
            const html = this.cardLayout(item.id, item.title, item.content);
            
            this.insertHtml(html);
        }
        
        this.registerButtons();
    }
    
    registerButtons() {
        document.querySelectorAll('.delete-card').forEach(item => {
            item.onclick = event => this.deleteCard(event);
        });
        
        document.querySelectorAll('.edit-card').forEach(item => {
            item.onclick = event => this.openEditCard(event);
        });
        
        console.log("Register Buttons!");
    }
    
    createCard(event) {
        event.preventDefault();
        
        if(this.title.value && this.content.value) {
            this.sendToServer(this);
        } else {
            alert("Preencha os campos!");
        }
    }
    
    loginUser(event) {
        event.preventDefault();
        
        if(this.email.value && this.password.value) {
            this.sendToLogin(this);
        } else {
            alert("Preencha seus dados cadastrais!");
        }
    }
    
    sendToLogin(app) {
        axios.post(this.urlLogin, {
            email: this.email.value,
            password: this.password.value
        }, app.authToken() )
        .then(function (response) {
            const { token } = response.data;
            app.configAuth = token;

            const formLoginHide = $("#row_login").modal('hide');
            app.getScraps(app);
            
        })
    }
    
    sendToServer(app) {
        axios.post(this.url, {
            title: this.title.value,
            content: this.content.value
        },app.authToken())
        .then(function (response) {
            const {id, title, content} = response.data;
            let html = app.cardLayout(id, title, content);
            
            app.insertHtml(html);
            
            app.clearForm();
            
            app.registerButtons();
            
        })
        .catch(function (error) {
            console.log(error);
            alert("Ops! Tente novamente mais tarde.");
        })
        .finally(function () {
        });
    }
    
    cardLayout(id, title, content) {
        const html = `
        <div class="col mt-5" scrap="${id}">
        <div class="card">
        <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${content}</p>
        <button type="button" class="btn btn-primary edit-card" data-toggle="modal" data-target="#editModal">
        Editar
        </button>
        <button type="button" class="btn btn-danger delete-card">Excluir</button>
        </div>
        </div>
        </div>
        `;
        
        return html;
    }
    
    insertHtml(html) {
        document.getElementById("row_cards").innerHTML += html;
    }
    
    clearForm() {
        this.title.value = "";
        this.content.value = "";
    }
    
    deleteCard = (event) => {
        const id = event.path[3].getAttribute('scrap');
        
        axios.delete(`${this.url}${id}`,this.authToken())
        .then(function (response) {
            event.path[3].remove();
        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(function () {
        });
    };
    
    openEditCard = (event) => {
        const id = event.path[3].getAttribute('scrap');
        const title = event.path[1].children[0].innerHTML;
        const content = event.path[1].children[1].innerHTML;
        
        document.getElementById("edit-title").value = title;
        document.getElementById("edit-content").value = content;
        document.getElementById("edit-id").value = id;
        
        this.cardEditing = event.path[1];
        this.cardEditing.editId = id;
    };
    
    editCard = (event) => {
        const id = this.cardEditing.editId;
        const title = document.getElementById("edit-title").value;
        const content = document.getElementById("edit-content").value
        
        axios.put(`${this.url}${id}`, {
            title: title,
            content: content
        }, this.authToken())
        .then( (response) => {
            this.cardEditing.children[0].innerHTML = title;
            this.cardEditing.children[1].innerHTML = content;
        })
        .catch(function (error) {
            console.log(error);
            alert("Ops! Tente novamente mais tarde.");
        })
        .finally(function () {
        }); 
    }
    
}

new App();