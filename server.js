var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Message API root');
});

// ---------------------   Messages   ----------------------

app.post('/messages', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'text');
	// body.userId = req.user.get('id');

	db.message.create(body).then(function(message) {
		req.user.addMessage(message).then(function() {
			return message.reload();
		}).then(function(message) {
			res.json(message.toJSON());
		})
	}, function(e) {
		res.status(400).send();
	})
});

// GET /todos?search=hello

app.get('/messages', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

	if (query.hasOwnProperty('search') && query.search.length > 0) {
		where.text = {
			$like: '%' + query.search + '%'
		}
	}

	db.message.findAll({
		where: where
	}).then(function(messages) {
		if (messages) {
			res.json(messages);
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	})

});

app.get('/messages/:id', middleware.requireAuthentication, function(req, res) {
	var messageId = parseInt(req.params.id, 10);

	db.message.findOne({
		where: {
			userId: req.user.get('id'),
			id: messageId
		}
	}).then(function(message) {
		if (message) {
			res.json(message.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).json(e);
	})
});

app.put('/messages/:id', middleware.requireAuthentication, function(req, res) {
	var messageId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'text');
	var attributes = {};

	if (body.hasOwnProperty('text')) {
		attributes.text = body.text;
	}

	db.message.findOne({
		where: {
			id: messageId,
			userId: req.user.get('id')
		}
	}).then(function(message) {
		if (message) {
			message.update(attributes).then(function(message) {
				res.json(message.toJSON());
			}, function(e) {
				res.status(400).send();
			})
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).json(e);
	})

});

app.delete('/messages/:id', middleware.requireAuthentication, function(req, res) {
	var messageId = parseInt(req.params.id, 10);

	db.message.destroy({
		where: {
			id: messageId,
			userId: req.user.id
		}
	}).then(function(rowsDestroyed) {
		if (rowsDestroyed > 0) {
			res.status(204).send();
		} else {
			res.status(404).json({
				error: 'No message with id ' + messageId
			});
		}
	}, function(e) {
		res.status(500).send();
	})
});

// ---------------------   Login   ----------------------

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	})
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authenticate');
		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			console.log(typeof token);
			res.status(401).send();
		}
	}, function(e) {
		console.log('Authenticate method failed');
		res.status(401).send();
	})
});

db.sequelize.sync({
	// force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});