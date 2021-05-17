const fs = require("fs");
let users = [];
readUsers();

module.exports = function (app, requiresAuth) {
    users,
    readUsers();
    app.get("/", (req, res) => {
        res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
    });
    app.get('/auth/login',requiresAuth(), (req, res) => res.oidc.login({ returnTo: '/api/me' }));
    app.get("/api/me", requiresAuth(), (req, res) => {
     
        let user = (req.oidc.user);
        user.id = getUser(req.oidc.user.email);
        res.json(user);
    });
    app.get("/auth/register", requiresAuth(), (req, res) => {
        let user = req.oidc.user;
        user.id = addUser(user);
        addUser(req.oidc.user);
        res.json(user);
    });
    app.get('/custom-logout', (req, res) => res.send('Bye!'));

}


function addUser(data) {
    let i = 0;
    console.log(data);
    for (i = 0; i < users.length; i++) {
        if (users[i].email == data.email) {
            break;
        }
    }

    if (i < users.length) {
        users[i] = data;

    } else {
        users.push(data);
    }
    const jsonString = JSON.stringify(users);
    fs.writeFile("./users.json", jsonString, err => {
        if (err) console.log("Error writing file:", err);
    });
    return i;
}

function readUsers() {
    fs.readFile("./users.json", "utf8", (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err);
            return;
        }
        users = JSON.parse(jsonString);
    });
}

function getUser(email) {
    for (let i = 0; i < users.length; i++) {
        console.log(email, users[i].email);
        if (users[i].email == email) return i;

    }

    return -1;
}