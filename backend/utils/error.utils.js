// erro de validaçao para quando os dados de entrada não estão corretos
export const validationError = (errors) => {
    const err = new Error("Validação falhou");
    err.status = 400;
    err.errors = errors;
    return err;
};

// erro generico para erros internos do servidor 
export const genericError = () => {
    const err = new Error("Erro interno do servidor");
    err.status = 500;
    return err;
};

// erro para quando ja existe uma conta com o mesmo email
export const conflictError = () => {
    const err = new Error("Conflito: Conta já existe");
    err.status = 409;
    return err; 
};

export const sequelizeValidationError = (errors) => {
    const err = new Error("Validação falhou");
    err.status = 400;
    // if err.path is the same, group the error messages in an array for that field
    err.errors = errors.reduce((acc, err) => {
        if (acc[err.path]) {
            acc[err.path].push(err.message);
        } else {
            acc[err.path] = [err.message];
        }
        return acc;
    }, {});

    return err;
};

export const adminOnlyError = () => {
    const err = new Error("Acesso negado: Requer privilégios de administrador!");
    err.status = 403;
    return err;
}