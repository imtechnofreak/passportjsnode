var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();

var User = require('../models/userModel');
/* GET users listing. */
router.get('/register', function(req, res) {
  res.render('register',{title:'Register'});
});



router.post('/register',function(req,res,next){
   //get all values
   var name = req.body.name;
   var email = req.body.email;
   var username = req.body.username;
   var password = req.body.pass;
   var password2 = req.body.pass2;

  
  //  //check for image
  //  if(req.files && req.files.profileimage){
  //    console.log('uploading files');

  //    //file info
  //    var profileImageOriginalName = req.files.profileimage.originalname;
  //    var profileImageName = req.files.profileimage.name;
  //    var profileImageMime = req.files.profileimage.mimetypes;
  //    var profileImagePath = req.files.profileimage.path;
  //    var profileImageExt =  req.files.profileimage.extension;
  //    var profileImageSize = req.files.profileimage.size;
  //  } else{
  //    var profileImageName = 'noimage.png';
  //  }

  //  //form validation
   req.checkBody('name','Name is required').notEmpty();
   req.checkBody('email','email is required').isEmail();
   req.checkBody('username','Username is required').notEmpty();
   req.checkBody('pass','password is required').notEmpty();
   req.checkBody('pass2','passwords do not match').equals(req.body.pass);

   //CHECK FOR ERRORS
    var errors = req.validationErrors();
    if (errors) {
      res.render('register',{
        errors:errors,
        name:name,
        email:email,
        username:username,
        password:password,
        password2:password2
      });
    } else {
      var newUser = new User({
        name: name,
        email: email,
        username: username,
        password : password,
      });
      //Create User
      User.createUser(newUser,function(err,user){
        if(err) throw err;
        console.log(user);
      });
      req.flash("Success","You are registerd May log in");
      console.log("Accepted");
      res.location('/');
      res.redirect('/');
    }
});

router.get('/login',function(req,res,next){
   res.render('login',{title:'Login'});
});

passport.serializeUser(function(user,done){
  done(null,user.id);
});

passport.deserializeUser(function(id,done){
   User.getUserById(id,function(err,user){
     done(err,user);
   })
});

passport.use(new LocalStrategy(
  function(username,password,done){
   User.getUserByUserName(username,function(err,user){
     if(err) throw err;
     if(!user){
       console.log('Unkown USer');
       return done(null,false,{message:'Unkown User'});
     }
     User.comparePassword(password,user.password,function(err,isMatch){
       if(err) throw err;
       if(isMatch){
         return done(null,user);
       }else{
         console.log('Invalid Password');
         return done(null,false,{message:'Invalid Password'});
       }
     });
   })
}));

router.post('/login',
passport.authenticate(
  'local',{
  failureRedirect:'/users/login',
  failureFlash:'Invalid Username or Password'}
  ),function(req,res){
    console.log("Authentication Successful");
    req.flash('success','You are logged in !');
    res.redirect('/');
  });

  router.post('/logout',function(req,res){
    req.logout();
    res.redirect('/users/login')
  })
module.exports = router;
