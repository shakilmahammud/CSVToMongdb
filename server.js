// import express
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors');
const multer=require('multer')
const path = require('path')
const fs = require('fs')

// connecting the mongo database
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

// decleare of the port
const port =30001

// file type convert to json data
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors());

//file upload process
const upload_folder = './Upload/';
const storage = multer.diskStorage({
    destination:(req,file,cb) => {
 cb(null,upload_folder)
    },
    filename:(req,file,cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileExt,"").toLocaleLowerCase().split(" ").join("_") + "_" + Date.now();

       cb (null,fileName + fileExt);
    }
})
//upload system code
const upload = multer({
    storage: storage,
    limits:{
        fileSize:1000000, //user can upload there image up to 1 MB
    },

    //file type like jpeg, jpg, png user only can upload this type of image
    fileFilter:(req,file,cb) => {
        if(file.fieldname === 'avatar'){
            if(
                file.mimetype ==='image/jpeg'||
                file.mimetype ==='image/jpg' ||
                file.mimetype ==='image/png'
            ){
                cb (null,true);
            }
            else{
                cb (new Error("only .jpg , .png, .jpeg format image are Allowed"));
            }
        }
    }
})
//connecting to the mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0oz1r.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const PostCollection = client.db(process.env.DB_NAME).collection("UserPost");
  // perform actions on the collection object
  console.log("data base connect");
  app.post('/upload',upload.array("avatar",5),(req,res) => {
const message=req.body.message
const files=req.files
PostCollection.insertOne({image:files,message:message})
.then(result => {
    res.send(result.insertedCount > 0)
})
// let img=fs.readFileSync(req.files.avatar[0].path);
// let encode_image=img.toString('base64')
// let finalImg={
//     contentType:req.files.avatar[0].mimetype,
//     path:req.files.avatar[0].path,
//     image:new Buffer(encode_image,'base64')
// }      
// res.contentType(finalImg.contentType)
// res.send(finalImg.image)
// console.log(req.files.avatar[0].path)
})

app.get("/posts",(req,res)=>{
    PostCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
})
//   client.close();
});



app.listen(process.env.PORT || port)
