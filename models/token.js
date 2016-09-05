var cryptojs = require('crypto-js');

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('token', {
		token: {
			type: DataTypes.VIRTUAL,
			allowNull: false, 
			validation: {
				len: [1]
			},
			set: function (value) {
				var hash = cryptojs.SHA1(value).toString();

				this.setDataValue('token', value);
				this.setDataValue('tokenHash', hash);
			}
		},
		tokenHash: {
			type: DataTypes.STRING
		}
	})
}