import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect:process.env.DB_DIALECT
    }
);

try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
} catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
}

//...................Modelos.......................//

//modelo user
import UserModel  from "./user.model.js";
const User = UserModel(sequelize, DataTypes);

//modelo veiculo
import VeiculoModel from "./veiculo.model.js";
const Veiculo = VeiculoModel(sequelize, DataTypes);

//modelo vaga
import VagaModel from "./vaga.model.js";
const Vaga = VagaModel(sequelize, DataTypes);

//modelo reserva
import ReservaModel from "./reserva.model.js";
const Reserva = ReservaModel(sequelize, DataTypes);

//modelo carregamento
import CarregamentoModel from "./carregamento.model.js";
const Carregamento = CarregamentoModel(sequelize, DataTypes);


//modelo carregador
import CarregadorModel from "./carregador.model.js";
const Carregador = CarregadorModel(sequelize, DataTypes);

//..........................Relações..........................//

User.hasMany(Veiculo, { foreignKey: 'id_utilizador', onDelete: 'CASCADE' }); //Se um utilizador apagar a sua conta, 
Veiculo.belongsTo(User, { foreignKey: 'id_utilizador' }); //não faz sentido guardar os carros dele no sistema. Usamos CASCADE

// 1. O User tem muitas Reservas. Se o User for apagado, as reservas desaparecem (CASCADE)
User.hasMany(Reserva, { foreignKey: 'id_utilizador', onDelete: 'CASCADE' });
Reserva.belongsTo(User, { foreignKey: 'id_utilizador' });

Veiculo.hasMany(Reserva, { foreignKey: 'id_veiculo', onDelete: 'RESTRICT' }); // Se um utilizador tentar apagar um veículo da conta dele, 
Reserva.belongsTo(Veiculo, { foreignKey: 'id_veiculo' }); //mas esse veículo tiver uma reserva ativa para amanhã, o sistema deve bloquear a eliminação! Usamos RESTRICT.

// 2. A Vaga tem muitas Reservas. Se tentares apagar uma Vaga que tem reserva, o sistema bloqueia (RESTRICT)
Vaga.hasMany(Reserva, { foreignKey: 'id_vaga', onDelete: 'RESTRICT' });
Reserva.belongsTo(Vaga, { foreignKey: 'id_vaga' });

// Um Veiculo tem muitos Carregamentos. Se apagarmos o Veiculo, o histórico de carregamento pode ser restrito ou apagado (CASCADE).
Veiculo.hasMany(Carregamento, { foreignKey: 'id_veiculo', onDelete: 'CASCADE' });
Carregamento.belongsTo(Veiculo, { foreignKey: 'id_veiculo' });

// Um Carregamento tem um Carregador associado. 
// Se o Carregamento for apagado, o Carregador fica livre (SET NULL).
Carregamento.hasMany(Carregador, { foreignKey: 'id_carregamento', onDelete: 'SET NULL' });
Carregador.belongsTo(Carregamento, { foreignKey: 'id_carregamento' });

Vaga.hasMany(Carregamento, { foreignKey: 'id_vaga', onDelete: 'RESTRICT' });
Carregamento.belongsTo(Vaga, { foreignKey: 'id_vaga' });

//............................................................//


 try {
     await sequelize.sync({ force: true }); // use { force: true } to drop and recreate tables on every sync (use with caution in production)
     console.log("All models were synchronized successfully.");
} catch (error) {
    console.error("Error synchronizing models:", error);
    process.exit(1);
 }

export { 

    sequelize, 
    User, 
    Veiculo,
    Vaga,
    Reserva,
    Carregamento,
    Carregador

};
