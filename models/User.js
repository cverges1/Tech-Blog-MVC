const { Model, DataTypes } = require('sequelize');
const connection = require('../config/connection');
const bcrypt = require('bcrypt');

class User extends Model {
    checkPassword(loginPw) {
        return bcrypt.compareSync(loginPw, this.password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8],
            },
        },
    },
    {
        hooks: {
            beforeCreate: async (newUserData) => {
                const plainTextPw = newUserData.password;
                const hashedPw = await bcrypt.hash(plainTextPw, 10);
                newUserData.password = hashedPw;

                return newUserData;
            },
            beforeUpdate: async (updatedUserData) => {
                const plainTextPw = updatedUserData.password;
                const hashedPw = bcrypt.hash(plainTextPw, 10);
                updatedUserData.password = hashedPw;

                return updatedUserData;
            },
        },
        sequelize: connection,
		timestamps: false,
		freezeTableName: true,
		modelName: 'user',
	},
);

module.exports = User;