import csv
import re
import unicodedata
import random
from faker import Faker

# Inicializa o Faker para nomes portugueses
fake = Faker('pt_PT')

def limpar_nome(nome):
    primeiro_nome = nome.split()[0].lower()
    
    nome_normalizado = unicodedata.normalize('NFD', primeiro_nome) #separa o acento da letra
    nome_limpo = nome_normalizado.encode('ascii', 'ignore').decode('utf-8') #remove os acentos separados
    
    nome_limpo = re.sub(r'[^a-z0-9]', '', nome_limpo) #procura tudo que nao seja letra ou numero e substitui por vazio
    
    return nome_limpo 

def gerar_dados():
    utilizadores = []
    proximo_id = 1

    # Configuração: (Tipo, Quantidade)
    configuracao = [('admin', 4), ('regular_user', 1000)]

    for tipo, qtd in configuracao:
        for _ in range(qtd):
            nome_real = fake.name()
            
            # Aplica a lógica de username: nome limpo + número
            username_base = limpar_nome(nome_real)
            username = f"{username_base}{random.randint(1, 99)}"
            
            email = f"{username}@example.pt"
            password = fake.password(length=12)
            
            utilizadores.append([
                proximo_id, 
                nome_real, 
                username, 
                email, 
                password, 
                tipo
            ])
            proximo_id += 1
            
    return utilizadores

def guardar_em_csv(dados):
    ficheiro = 'utilizadores_falsos.csv'
    cabecalho = ['id_utilizador', 'nome_real', 'username', 'email', 'password', 'tipo_utilizador']
    
    with open(ficheiro, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(cabecalho)
        writer.writerows(dados)
    
    print(f"✅ Sucesso! Ficheiro '{ficheiro}' gerado com {len(dados)} registos.")

# --- Execução ---
if __name__ == "__main__":
    lista_utilizadores = gerar_dados()
    guardar_em_csv(lista_utilizadores)