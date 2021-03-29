// import express
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors');
const multer=require('multer')
const path = require('path')
const fs = require('fs')
const csv=require('csvtojson')
const objectId=require('mongodb').ObjectID


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
    //file type like jpeg, jpg, png user only can upload this type of image
    fileFilter:(req,file,cb) => {
        if(file.fieldname === 'avatar'){
            if(
                file.mimetype ==='text/csv'
                
            ){
                cb (null,true);
            }
            else{
                cb (new Error("only CSV format image are Allowed"));
            }
        }
    }
})

//connecting to the mongodb
const uri = "mongodb+srv://test:testS@cluster0.0aziu.mongodb.net/TestSimple?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true ,});
client.connect(err => {
  const csvCollection = client.db("TestSimple").collection("Simple")
  const loginCollection = client.db("TestSimple").collection("login")
  const editCollection = client.db("TestSimple").collection("CountEdit")
  console.log("data base connect");
  app.post('/upload',upload.single("avatar"),(req,res) => {
// const message=req.body.message
const files=req.file.path
const csvFilePath=files
csv()
.fromFile(csvFilePath)
.then((csv)=>{
   csvCollection.insertMany(csv)
.then(result => {
    res.status(200).send("File Upload Done .")
})
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
app.post('/update/:id',(req,res) => {
    // const message=req.body.message
   const id=req.params.id
   const number=req.body.preNumber
   const newNumber=req.body.number
   const agentMail=req.body.agentEmail
   if(number==newNumber){
       csvCollection.updateMany({_id:objectId(id)},{$set:{New_Number:newNumber,Agent_Email:agentMail,Remark:"Same"}},function(err,result){
        console.log("inserted")
        // db.close()
    })
   }else{
        csvCollection.updateMany({_id:objectId(id)},{$set:{New_Number:newNumber,Agent_Email:agentMail,Remark:"Change"}},function(err,result){
         console.log("inserted")
         // db.close()
     })
   }
    })

app.get("/allCsv",(req,res,next)=>{
    const search=req.query.sc
    // console.log(search)
    csvCollection.find({Mobile:search})
        .toArray((err, documents) => {
            if(documents.length<=0){
                csvCollection.find({NID:search})
        .toArray((err, documents) => {
            if(documents<=0){
                
                csvCollection.find({"MIS ID":search})
                .toArray((err, documents) => {
                    if(documents<=0){
                        csvCollection.find({"Name In English":search})
                        .toArray((err, documents) => {
                            res.send(documents);
                        })
                    }else{
                        res.send(documents);
                    }
                })
            }else{
                res.send(documents);
            }
        })
            }else{
                res.send(documents);
            }
        })
        
})
app.get('/',(req,res)=>{
    res.status(200).send("Api ok")
})
app.get('/dwonloadCsv',(req,res)=>{
    csvCollection.find({})
    .toArray((err, documents) => {
        res.status(200).send(documents);
    })
})
app.post('/coutEdit',(req,res) => {
    // const message=req.body.message
     const email=req.body.email
     const count=req.body.count
     editCollection.insertOne({email:email,count:count})
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    
    })
    app.get('/totalaCount',(req,res) => {
        // const message=req.body.message
        const email=req.query.email
        editCollection.find({email:email})
        .toArray((err, documents) => {
            res.status(200).send(documents);
        })
        })
app.post('/login',(req,res) => {
    // const message=req.body.message
     const email=req.body.email
     const password=req.body.password
     loginCollection.insertOne({email:email,password:password})
        .then(result => {
            res.status.send(result.insertedCount > 0)
        }).catch(err=>{
            res.send(err)
        })
            
        
    
    })
    app.get('/loginMatch',(req,res)=>{
        const email=req.query.email
        // console.log(email)
        const password=req.query.password
        loginCollection.find({email:email})
        .toArray((err, documents) => {
            res.status(200).send(documents);
        })
    })
// app.post('/others',(req,res) => {
//     // const message=req.body.message
//      const number=req.body.number
//      const agentEmail=req.body.agentEmail
//      const preNumber=req.body.preNumber
//      console.log(number,agentEmail,preNumber)
//      if(number==preNumber){
//         othesCollection.insertMany({New_Number:number,agentEmail:agentEmail,Remarks:"same",preNumber:preNumber})
//         .then(result => {
//             res.send(result.insertedCount > 0)
//         })
//      }else{
//         othesCollection.insertOne({New_Number:number,agentEmail:agentEmail,Remarks:"change",preNumber:preNumber})
//         .then(result => {
//             res.send(result.insertedCount > 0)
//         })
//      }
//     })
//     app.get('/allothers',(req,res)=>{
//         const oh=req.query.oh
//         othesCollection.find({New_Number:oh})
//         .toArray((err, documents) => {
//             res.send(documents);
//         })
//     })
// app.put('/update/:id',(req,res)=>{
//     const id=req.params.id
//     const number=req.body.number
//     const myquery = {_id:id};
//     const newvalues = { $set: {New_Number:number,_id:"hi"} };
//     console.log(number)
//     csvCollection.updateOne(myquery, newvalues, function(err, res) {
//         if (err) throw err;
//         console.log("1 document updated");
//       });
// })
// //   client.close();
});

app.listen(process.env.PORT || port)
