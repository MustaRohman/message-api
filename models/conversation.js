var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('conversation', {
		recipientUser: {
			type: DataTypes.STRING,
			allowNull: false, 
			validate: {
				len: [1, 300]
			}
		}
	})
}