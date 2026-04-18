export default (sequelize, DataTypes) => sequelize.define("Utilizador", {

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
            isStrongPassword(value) {
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
                if (!regex.test(value)) {
                    throw new Error(
                        'A password deve ter pelo menos 8 caracteres, uma maiúscula, uma minúscula e um número.'
                    );
                }
            }
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