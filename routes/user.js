const multer = require('multer');
const path = require('path');
const fs = require("fs");
let images = [];
 let  express = require('express');
// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './images/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});



// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myImage');



function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

let imagesPath;
module.exports = function (app, requiresAuth , p) {
    readImages();
    imagesPath = p;

    app.get('/uploadimage/', function (req, res) {
        res.sendFile(__dirname + '/upload.html');

    });

    app.post('/upload', requiresAuth(), async (req, res) => {
        upload(req, res, (err) => {
            if (err) {
                res.status(200).send({
                    'index': {
                        msg: err
                    }
                });
            } else {
                if (req.file == undefined) {
                    res.status(200).send({
                        'index': {
                            msg: 'Error: No File Selected!'
                        }
                    });
                } else {
                    res.status(200).send({
                        'index': {
                            email: req.oidc.email,
                            msg: 'File Uploaded!',
                            file: `uploads/${req.file.filename}`
                        }
                    });
                    addToImages({ user: req.oidc.user.email, file: req.file.filename });
                }
            }
        });

    }, (error, req, res, next) => {
        res.status(400).send({ error: error.message })
    })



    app.get('/public/images/:userId', async (req, res) => {
        let host = req.get('host');
       getImages(req.params.userId,host,res)
    })

}


function getImages(userId,baseUrl,res){
    let imgs= [];
   let found = false;
    images.forEach(img => {
        if(img.userId == userId){ 
            found = true;
            imgs.push(img);
            var options = {
                root: path.join(imagesPath + "/images")
            };
            res.sendFile(img.file, options, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Sent:', img.file);
                }
            });
        }
    });
    if(!found)res.send("no file");
}

function addToImages(data) {

    fs.readFile("./users.json", "utf8", (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err);
            return;
        }
        let users = JSON.parse(jsonString);
        for (let j = 0; j < users.length; j++) {
            if (users[j].email == data.user) {
                data.userId = j;

                let i = 0;
                for (i = 0; i < images.length; i++) {
                    if (images[i].email == data.user) {
                        break;
                    }
                }
            
                if (i < images.length-1) {
                    images[i] = data;
            
                } else {
                    images.push(data);
                }

                const jsonString = JSON.stringify(images);
                fs.writeFile("./images.json", jsonString, err => {
                    if (err) console.log("Error writing file:", err);
                });
                break;
            }


        }
    });


}

function readImages() {
    fs.readFile("./images.json", "utf8", (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err);
            return;
        }
        images = JSON.parse(jsonString);
    });
}