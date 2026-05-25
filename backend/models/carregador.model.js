export default (sequelize, DataTypes) => sequelize.define("Carregador", {

    id_carregador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_carregamento: {
        type: DataTypes.INTEGER,
        allowNull: true, // Pode ser null se o carregador estiver livre (ninguém a usar)
        references: {
            model: 'Carregamento',
            key: 'id_carregamento'
        }
    },

    potencia: {
        type: DataTypes.FLOAT,
        allowNull: false
    }

}, {
    tableName: 'Carregador',
    timestamps: false
});