

// erro de validaçao para quando os dados de entrada não estão corretos
export const ValidationError = (errors) => {
    const err = new Error("Validation failed");
    err.status = 400;
    err.errors = errors;
    return err;
};

// erro generico para erros internos do servidor 
export const GenericError = (message = "Internal Server Error") => {
    const err = new Error(message);
    err.status = 500;
    return err;
};

// erro para quando ja existe uma conta com o mesmo email
export const ConflictError = (message) => {
    const err = new Error(message);
    err.status = 409;
    return err; 
};

export const SequelizeValidationError = (errors) => {
    const err = new Error("Validation failed");
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