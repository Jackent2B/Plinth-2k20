var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookValidate = require('passport-facebook-token');
var GoogleValidate = require('passport-google-token').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var User = require('./schema/user');
var configAuth = require('./config/auth');
 
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

exports.google = passport.use(new GoogleStrategy({
	clientID: configAuth.googleAuth.clientID,
	clientSecret: configAuth.googleAuth.clientSecret,
	callbackURL: configAuth.googleAuth.callbackURL,
	//scope: "https://www.googleapis.com/auth/plus.login",
        // passReqToCallback : true // allows us to pass back the entire request to the callback
},
	function (accessToken, refreshToken, profile, done) {
		console.log(profile);
		process.nextTick(function() {
			User.findOne({ 'email': profile.emails[0].value }, function (err, user) {
				if (err) {
					console.log(err); // handle errors!
				}
				if (!err && user !== null ) {
					if(user.googleid == ''){
						user.googleid = profile.id;
						user.googletoken = accessToken;
						
						user.save(function (err) {
							if (err) {
								console.log(err); // handle errors!
							} else {
								console.log("updating user ...");
								done(null, user);
							}
						});
					} else {
						done(null, user);
					}
					
				
				} else {
					user = new User();
					user.googleid = profile.id;
					user.googletoken = accessToken;
					user.name = profile.name.givenName + ' ' + profile.name.familyName;
					user.email = profile.emails[0].value; // pull the first email
					user.valid = false;
	
					user.save(function (err) {
						if (err) {
							console.log(err); // handle errors!
						} else {
							console.log("saving user ...");
							done(null, user);
						}
					});
				}
			});
		});
	
	})
);


exports.facebook = passport.use(new FacebookStrategy({
	clientID: configAuth.facebookAuth.clientID,
	clientSecret: configAuth.facebookAuth.clientSecret,
	callbackURL: configAuth.facebookAuth.callbackURL,
	profileFields: ['id', 'emails', 'name'],
},
	function (accessToken, refreshToken, profile, done) {
		console.log(profile);
		process.nextTick(function() {
			User.findOne({ 'email': profile.emails[0].value }, function (err, user) {
				if (err) {
					console.log(err); // handle errors!
				}
				if (!err && user !== null) {
					if(user.facebookid == ''){
						user.facebookid = profile.id;
						user.facebooktoken = accessToken;
						
						user.save(function (err) {
							if (err) {
								console.log(err); // handle errors!
							} else {
								console.log("updating user ...");
								done(null, user);
							}
						});
					} else {
						done(null, user);
					}
				} else {
					user = new User();
					user.facebookid = profile.id;
					user.facebooktoken = accessToken;
					user.name = profile.name.givenName + ' ' + profile.name.familyName;
					user.email = profile.emails[0].value; // pull the first email

					user.save(function (err) {
						if (err) {
							console.log(err); // handle errors!
						} else {
							console.log("saving user ...");
							done(null, user);
						}
					});
				}
			});
		});
	})
);


exports.facebookValidate = passport.use(new FacebookValidate({
	clientID: configAuth.facebookAuth.clientID,
	clientSecret: configAuth.facebookAuth.clientSecret,
},
	function (accessToken, refreshToken, profile, done) {

		var user = {
			'email': profile.emails[0].value,
			'name': profile.name.givenName + ' ' + profile.name.familyName,
			'id': profile.id,
		}
		return done(null, user);
	}
));

exports.googleValidate = passport.use(new GoogleValidate({
	clientID: configAuth.googleAuth.clientID,
	clientSecret: configAuth.googleAuth.clientSecret,
},
	function (accessToken, refreshToken, profile, done) {
		if (err) {
			console.log(err);
			res.end('Internal server error');
		}
		return done(err, profile);
	}
)); 
