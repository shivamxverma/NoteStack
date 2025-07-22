class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        stack = "",
        error = []
    ) {
        super(message);
        this.statusCode = statusCode;
        this.stack = stack;
        this.error = error;
        this.data = null;
        this.success = false;
        this.errors = error;

        if(stack){
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiError};