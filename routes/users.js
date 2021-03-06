
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var kek; //GloBAL VAR



var User = require('../models/user');
var Inventory = require('../models/inventory');

// Register
router.get('/register', function (req, res) {
    res.render('register');
});

router.get('/inventory', function (req, res) {
    res.render('inventory');
});

// Login
router.get('/login', function (req, res) {
    res.render('login');
});

// Register User
router.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

		var errors = req.validationErrors();
		
	

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'Unknown User'
                });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
            });
        });
    }));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/');
    });

router.post('/inventory', function (req, res) {
    var item = req.body.item;
    var quantity = req.body.quantity;
    var price = req.body.price;

    // Validation
    req.checkBody('item', 'Item is required').notEmpty();
    req.checkBody('quantity', 'Quantity is required').notEmpty();
    req.checkBody('price', 'Price Cannot be empty').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('inventory', {
            errors: errors
        });
    } else {
        var newInventory = new Inventory({
            item: item,
            quantity: quantity,
            price: price
        });

        Inventory.createItem(newInventory, function (err, item) {
						if (err) throw err;
					
        });


			Inventory.listItems(function (err, inventory) {
				var tester;
				if (err) throw err;
				//for (items of inventory) {
					//console.log(items.item);
						//	}
						tester= inventory[0].item;
						kek=tester;
						console.log(kek); //Kek is bun kool
					});
				console.log('Outside function ' + kek); //undefined .-.
				//	req.flash('item',6);

        req.flash('success_msg', 'Item Added');

        res.redirect('/users/inventory');
    }
});



router.get('/logout', function (req, res) {
    req.logout();

    req.flash('success_msg', 'You are flogged out');

    res.redirect('/users/login');
});

module.exports = router;
