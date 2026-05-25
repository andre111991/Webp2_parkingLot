export default (sequelize, DataTypes) => sequelize.define("Reserva", {

    id_reserva: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_utilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id_utilizador'
        }
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
        allowNull: false
    },

    data_pagamento: {
        type: DataTypes.DATE,
        allowNull: true // Fica null até o utilizador pagar efetivamente
    },

    valor: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },

    pago: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0 // 0 = Não Pago, 1 = Pago
    }

}, {
    tableName: 'Reserva',
    timestamps: false
});