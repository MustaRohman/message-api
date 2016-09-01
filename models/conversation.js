var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('conversation', {
		conversationName: {
			type: DataTypes.STRING,
			defaultValue: null,
			validate: {
				len: [1, 300]
			}
		},
		recipientUser: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 300]
			}
		}
	})
}