export default (sequelize, DataTypes) => sequelize.define("Veiculo", {

    id_veiculo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_utilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User', //  permite que nao haja um carro sem um utilizador associado
            key: 'id_utilizador'
        }
    },

    matricula: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },

    tipo_combustivel: {
        type: DataTypes.STRING(30),
        allowNull: false //elétrico ou combustão
    }

}, {
    tableName: 'Veiculo',
    timestamps: false
});