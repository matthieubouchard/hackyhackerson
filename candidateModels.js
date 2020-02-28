const tf = require('@tensorflow/tfjs');

exports.biden = tf.loadLayersModel('http://localhost:5000/models/biden_15_chars/model.json');

exports.bloomberg = tf.loadLayersModel('http://localhost:5000/models/bloomberg_15_chars/model.json');

exports.klobuchar = tf.loadLayersModel('http://localhost:5000/models/klobuchar_15_chars/model.json');

exports.warren = tf.loadLayersModel('http://localhost:5000/models/warren_15_chars/model.json');

exports.sanders = tf.loadLayersModel('http://localhost:5000/models/sanders_15_chars/model.json');

exports.steyer = tf.loadLayersModel('http://localhost:5000/models/steyer_15_chars/model.json');

exports.buttigieg = tf.loadLayersModel('http://localhost:5000/models/buttigieg_15_chars/model.json');
