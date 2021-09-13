var expr= require("express")
var app=expr()
var pth=require("path")


app.use(expr.urlencoded({extended:true}))
app.use(expr.json())
app.set('view engine', 'pug');
app.set('views','./views');

var {MongoClient,ObjectId} =require("mongodb")
var url ="mongodb://localhost:27017/";

const mult=require("multer")
app.use(expr.static('upload'));
const store= mult.diskStorage({
    destination: function(req,file,cb){
        cb(null,__dirname+'/upload')
    },
    filename:function(req,file,cb){
        console.log("file in filname:",file)
        var filetext=pth.extname(file.originalname)
        const uniqueSuffix=Date.now() + '-' + Math.round(Math.random()*1E9)
        cb(null,file.fieldname + '-' + uniqueSuffix+filetext)
    }
})
const upload=mult({storage:store})
app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/home.html")
})

app.get('/c',(req,res)=>{
    MongoClient.connect(url,(err,conn)=>{
        var dbo=conn.db("delta")
        dbo.collection("contact").find().toArray((err,data)=>{
            res.render("contact",{
                allcontact:data
            })
        })
    })
})
app.get('/con',(req,res)=>{
    res.sendFile(__dirname+"/addcontact.html")
})
app.post('/contact',upload.single('profile'),(req,res)=>{
    req.body.profile = req.file.filename;
    MongoClient.connect(url,(err,conn)=>{
        var dbo=conn.db("delta")
        dbo.collection('contact').insertOne(req.body,(err,data)=>{
            console.log(data)
            })
            dbo.collection("contact").find().toArray((err,data)=>{
                res.redirect('/c')
        })
    })
})

app.get('/deletecontact/:id',(req,res)=>{
    MongoClient.connect(url,(err,conn)=>{
        var dbo=conn.db("delta")
        dbo.collection('contact').deleteOne({_id:ObjectId(req.params.id)},(err,data)=>{
            res.redirect("/c")
        })

    })
})

app.get('/updatecontact/:id/:firstname/:phno/:email/:profile',(req,res)=>{
    res.render("updatecontact",{
        cid:req.params.id,
        cname:req.params.firstname,
        cphno:req.params.phno,
        cemail:req.params.email,
        cprofile:req.params.profile
    })
})

app.post('/updatecontact',(req,res)=>{
    MongoClient.connect(url,(err,conn)=>{
        var dbo=conn.db('delta')
        dbo.collection('contact').updateOne({_id:ObjectId(req.body.id)},
        {$set:{phno:req.body.phno,email:req.body.email,firstname:req.body.firstname}},(err,data)=>{
            res.redirect('/c')
        })
    })
})

app.get('/contactlist/:id',(req,res)=>{
    MongoClient.connect(url,(err,conn)=>{
        var dbo=conn.db('delta')
        dbo.collection('contact').findOne({_id:ObjectId(req.params.id)},(err,data)=>{
            res.render("contactlist",{
                info:data
            })
        })
    })
})

app.get("/upd/:id",(req,res)=>{
    res.render("updatepro",{
        uid:req.params.id
    })
})
app.post("/updateprofile",upload.single("profile"),(req,res)=>{
    MongoClient.connect(url,(err,conn)=>{
        var dbo=conn.db("delta")
        dbo.collection("contact").updateOne({_id:ObjectId(req.body.id)},
        {$set:{profile:req.file.filename}},(err,data)=>{
            res.redirect("/c")
        })
    })
})

app.get('/g',(req,res)=>{
    MongoClient.connect(url,(err,conn)=>{
        var dbo=conn.db('delta')
        dbo.collection('groups').find().toArray((err,data)=>{
            res.render("groups",{
                friends:data
            })
        })
    })
})

app.get('/friend',(req,res)=>{
    res.sendFile(__dirname+"/friends.html")
})
app.listen(7082,()=>{console.log("the app is running on port 7082")})