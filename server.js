 
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors');
const multer=require('multer')
const path = require('path')
const csv=require('csvtojson')
const objectId=require('mongodb').ObjectID


// connecting the mongo database
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

// decleare of the port
const port =40001

// file type convert to json data
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors());

//file upload process
const upload_folder = './Upload/';
const storage = multer.diskStorage({
//     destination:(req,file,cb) => {
//  cb(null,upload_folder)
//     },
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
const uri = "mongodb://localhost:27017";
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
})
app.post('/update/:id',(req,res) => {
    // const message=req.body.message
   const id=req.params.id
   const number=req.body.preNumber
   const newNumber=req.body.number
   const agentMail=req.body.agentEmail
   const pageNumber=req.body.page_number
   if(number==newNumber){
       csvCollection.updateMany({_id:objectId(id)},{$set:{New_Number:newNumber,Agent_Email:agentMail,Remark:"Same","page_number":pageNumber}},function(err,result){
        console.log("inserted")
        // db.close()
    })
   } else if(number==""){
    csvCollection.updateMany({_id:objectId(id)},{$set:{New_Number:newNumber,Agent_Email:agentMail,Remark:"New","page_number":pageNumber}},function(err,result){
        console.log("inserted")
   })
}else{
    csvCollection.updateMany({_id:objectId(id)},{$set:{New_Number:newNumber,Agent_Email:agentMail,Remark:"Change","page_number":pageNumber}},function(err,result){
     console.log("inserted")
     // db.close()
 })
}
    })

app.get("/allCsv",(req,res,next)=>{
    const search=req.query.sc
    // console.log(search)
    csvCollection.find({phone:search})
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
    app.post('/new',(req,res)=>{
        
        const id=req.body.id
        const diid=req.body.diid
        const bn_id=req.body.bn_id
        const nid=req.body.nid
        const bn_name=req.body.bn_name
        const En_Name=req.body.En_Name
        const Bn_M_Name=req.body.Bn_M_Name
        const En_M_Name=req.body.En_M_Name
        const Bn_F_Name=req.body.Bn_F_Name
        const En_F_Name=req.body.En_F_Name
        const H_W_Name=req.body.H_W_Name
        const dOB=req.body.dOB
        const Age=req.body.Age
        const District=req.body.District
        const upuzela_Thana=req.body.upuzela_Thana
        const Ward=req.body.Ward
        const Village=req.body.Village
        const Religion=req.body.Religion
        const Occupation=req.body.Occupation
        const Gender=req.body.Gender
        const Mobile=req.body.Mobile
        const Program_Name=req.body.Program_Name
        const Pass_Book_No=req.body.Pass_Book_No
        const Bank_Name=req.body.Bank_Name
        const Bank_Branch=req.body.Bank_Branch
        const Account_Status=req.body.Account_Status
        const Bank_Account_No=req.body.Bank_Account_No
        const Stipend_Date=req.body.Stipend_Date
        const phone=req.body.phone 
        const Phone_Owner=req.body.Phone_Owner
        const Bn_Status=req.body.Bn_Status
        const Nid_Status=req.body.Nid_Status
        const Approval_Status=req.bodyApproval_Status
        const User_Name=req.body.User_Name
        const user_id =req.body.user_id
        const Agent_mail=req.body.Agent_mail
        const New_Number=req.body.New_Number
        const Remarks =req.body.Remarks
        const page_number=req.body.page_number
        if(id!==""){
            csvCollection.insertMany([{ 
                "id":id,
                "diid":diid,
                "bn_id":bn_id,
                "nid":nid,
                "bn_name":bn_name,
                "En_Name":En_Name,
                "Bn_M_Name":Bn_M_Name,
                "En_M_Name":En_M_Name,
                "Bn_F_Name":Bn_F_Name,
               "En_F_Name":En_F_Name,
               "H_W_Name":H_W_Name,
               "DOB":dOB,
               "Age":Age,
               "District":District,
               "upuzela_Thana":upuzela_Thana,
               "Ward":Ward,
               "Village":Village,
              "Religion":Religion,
              "Occupation":Occupation,
              "Gender":Gender,
              "Mobile":Mobile,
              "Program_Name":Program_Name,
              "Pass_Book_No":Pass_Book_No,
              "Bank_Name":Bank_Name,
            "Bank_Branch":Bank_Branch,
            "Account_Status":Account_Status,
            "Bank_Account_No":Bank_Account_No,
            "Stipend_Date":Stipend_Date,
            "phone":phone,
            "Phone_Owner":Phone_Owner,
            "Bn_Status"  :Bn_Status,
            "Nid_Status":Nid_Status,
            "Approval_Status":Approval_Status,
            "User_Name":User_Name,
            "user_id":user_id,
            "Agent_mail":Agent_mail,
            "New_Number":New_Number,
            "Remarks":Remarks,
           "page_number":page_number
        }])
        .then(result => {
            res.status(200).send("Excle Data Entry Done .")
        })
        }
    })

// //   client.close();
});

app.listen(process.env.PORT || port)
