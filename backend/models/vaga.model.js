export default (sequelize, DataTypes) => sequelize.define("Vaga", {

    id_vaga: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    andar: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    cor: {
        type: DataTypes.STRING(45),
        allowNull: false 
    },

    letra: {
        type: DataTypes.STRING(45),
        allowNull: false 
    },

    tipo: {
        type: DataTypes.STRING(45),
        allowNull: false // ex: 'eletrico' ou 'combustão'
    },

    estado: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0 // 0 = Livre, 1 = Ocupada
    }

}, {
    tableName: 'Vaga',
    timestamps: false
});