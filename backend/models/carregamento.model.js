export default (sequelize, DataTypes) => sequelize.define("Carregamento", {

    id_carregamento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_veiculo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Veiculo',
            key: 'id_veiculo'
        }
    },

    id_vaga: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Vaga',
            key: 'id_vaga'
        }
    },

    data_hora_inicio: {
        type: DataTypes.DATE,
        allowNull: false
    },

    data_hora_fim: {
        type: DataTypes.DATE,
        allowNull: true // Fica null enquanto o carro estiver a carregar
    },

    pago: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },

    valor: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    }

}, {
    tableName: 'Carregamento',
    timestamps: false
});