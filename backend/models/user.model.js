export default (sequelize, DataTypes) => sequelize.define("User", {

    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true,
            len: [5, 100]
        }
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [8, 255],
        }
    },

    tipo_utilizador: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'cliente'
    }

}, {
    tableName: 'User',
    timestamps: false
});