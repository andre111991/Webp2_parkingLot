import { Sequelize, DataTypes } from "sequelize";
import bcrypt from 'bcrypt';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect:process.env.DB_DIALECT,
        logging: false
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

Vaga.hasMany(Carregamento, { foreignKey: 'id_vaga', onDelete: 'RESTRICT' });
Carregamento.belongsTo(Vaga, { foreignKey: 'id_vaga' });

//............................................................//


try {
    // 1. Sincroniza a base de dados
    await sequelize.sync({ alter: true }); //force alter
    console.log("All models were synchronized successfully.");

    // 2. Lógica de SEED: Criar Admins de teste
    const count = await User.count({ where: { tipo_utilizador: 'admin' } });
    
    if (count === 0) {      // quando reinicia o servidor (force) ele corre este try para criar admins, se ja houver admins ele não cria mais
        const passwordHash = await bcrypt.hash('Admin123@', 10);
        await User.bulkCreate([
            { name: 'Admin1', email: 'admin1@admin.com', password: passwordHash, tipo_utilizador: 'admin' },
            { name: 'Admin2', email: 'admin2@admin.com', password: passwordHash, tipo_utilizador: 'admin' }
        ]);
        console.log("Admin users created successfully!");
    }

  const vagaCount = await Vaga.count();
    
    if (vagaCount === 0) {
        const novasVagas = [];
        let letraIndex = 0; // Contador para gerar AA, AB, AC...

        // Função auxiliar para gerar letra dupla com este metodo da 26x26 vagas, ou seja, de AA a ZZ (total 676 vagas,criei só 50)
        const gerarIdentificador = (index) => {
            const primeira = String.fromCharCode(65 + Math.floor(index / 26));
            const segunda = String.fromCharCode(65 + (index % 26));
            return `${primeira}${segunda}`;
        };

        // 25 Vagas de combustão 
        for (let i = 0; i <25 ; i++) {
            novasVagas.push({ 
                andar: 1, 
                cor: 'azul', 
                letra: gerarIdentificador(letraIndex++), 
                tipo: 'combustao', 
                estado: '0' ,
                potencia: null // Combustão não tem potência de carga
            });
        }

        // 25 Vagas de elétrico 
        for (let i = 0; i <25 ; i++) {
            novasVagas.push({ 
                andar: 1, 
                cor: 'verde', 
                letra: gerarIdentificador(letraIndex++), 
                tipo: 'eletrico', 
                estado: '0',
                potencia: 7.4 // Exemplo de potência para elétricos
            });
        }

        await Vaga.bulkCreate(novasVagas);

        console.log("50 vagas criadas com sucesso (25 combustão, 25 elétrico)!");
    }

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

};
