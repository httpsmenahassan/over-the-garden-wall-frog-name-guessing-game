// worked with mentor Mark on this

module.exports = function(app, passport, db, ObjectID) {

// normal routes ===============================================================

    // show the home page
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('frogNames').find().toArray((err, frogNames) => {
          if (err) return console.log(err)
          
          const guessedCorrectly = []
          frogNames.forEach(frogName => {
            if (req.user.correctGuesses.find(guessedFrogNameId => frogName._id.toString() === guessedFrogNameId.toString())) {
              guessedCorrectly.push(true)
            } else {
              guessedCorrectly.push(false)
            }
          })
          console.log(guessedCorrectly)
          res.render('profile.ejs', {
            // user : req.user allows us to use user as a variable in the profile.ejs -- express gives every route two objects, the request and response
            // req is like the input of the request 
            // req.user is the user who is logged in
            user : req.user,
            names: frogNames,
            guessedCorrectly: guessedCorrectly,
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// name board routes ===============================================================

    app.post('/names', (req, res) => {
      db.collection('frogNames').insertOne({userId: req.user._id, name: req.body.name}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })


    // was originally going to put userId into the name but I ended up putting the nameId into the user -- ties back to modifications on the schema
    app.put('/names', (req, res) => {
      db.collection('frogNames')
      // giving the nameId to the ObjectID function -- takes in the string that is nameId and spits out an ObjectID
      .findOne({_id: ObjectID(req.body.nameId)}, (err, frogName) => {
        if (err) return res.send(err)
        if (frogName.name.toLowerCase() === req.body.guess.toLowerCase()) {
          req.user.correctGuesses.push(frogName._id)
          req.user.save()
        } else {
          // keeping this else for testing
          console.log('no <3')
        }
        res.send(frogName)
      })
    })

    app.delete('/names', (req, res) => {
      console.log(req.query.name)
      // deletes don't have bodies so you can't pass body into deletes
      db.collection('frogNames').findOneAndDelete({_id: new ObjectID(req.query.name)}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
