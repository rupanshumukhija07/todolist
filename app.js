//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ =require("lodash");

const app = express();

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true } );//connection
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//schema named itemschema
const itemschema ={
  itemname:String
};
//model or collection or tables named items will be created
const Item= mongoose.model("Item",itemschema);

//creating documents or entries
const item1= new Item({
  itemname: "eat"
});

const item2= new Item({
  itemname: "sleep"
});

//creating an array
const defaultitems = [item1,item2];




//schema named listschema
const listschema ={
  name:String,
  list:[itemschema]
};
//model or collection or tables named list will be created
const List= mongoose.model("List",listschema);




app.get("/", function(req, res) {

  //to find from Item collection
  Item.find({},function(err,founditems){

    if(founditems.length===0){

      Item.insertMany(defaultitems,function(err){
            if(err)
              {console.log(error);}
            else
              {console.log("success");}
          });
      res.redirect("/");
      }
      else{res.render("list", {listTitle: "Today", newListItems: founditems});}// to render founditems(result from find ) to list.ejs}


  });

});


//dynamically creating app.get
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,founditems2){
    if(!err)
      //if no item is found
      {if(!founditems2)
          //create a new record to List
          { const listitem = new List({
            name: customListName,
            list: defaultitems
          });
          listitem.save();
        res.redirect("/" + customListName);
      }
      else // showing previous list.
          {res.render("list", {listTitle: founditems2.name, newListItems: founditems2.list});
          }// to render founditems(result from find ) to list.ejs}
    }
  });

});



// runs when list.ejs mein delete krne waala form works
app.post("/delete",function(req,res){
  // to check the items to be deleted in other than today
  const listname = req.body.listname;
  //deleting the items named as delItem and its id as delItemId
  const delItemId = req.body.delItem;

  if (listname==="Today")  {
    Item.findByIdAndRemove(delItemId,function(err){
      if(!err){console.log("successfully deleted.");
          res.redirect("/");}
    });
  }
  else{                   //finding the deleted item in other than Today tab.
    List.findOneAndUpdate({name:listname},{$pull:{list:{_id:delItemId}}},function(err,foundlist){
        if(!err)
        {res.redirect("/"+ listname);}
    });
  }


});

// runs when list.ejs mein add krne waala form works
app.post("/", function(req, res){

//saving the newItem added to newitem
  const newitem = req.body.newItem;
//creating a new data (item) to our collection
  const item = new Item({
    itemname :newitem
  });

  //saving our current tabname ex- /home, /compose wtc.
  const listname=req.body.list;

  if(listname==="Today")
    { item.save();//saving our newky created data (item)
      res.redirect("/");}//redirect to home page.
  else {
    //if the current tab is other than today will redirect to line 110
    List.findOne({name:listname},function(err,foundlist){
      foundlist.list.push(item);
      foundlist.save();
      res.redirect("/" + listname);
      });
    }
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
