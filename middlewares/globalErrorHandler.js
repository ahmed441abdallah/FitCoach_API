const globalErrorHandler = (err, req, res, next) => {
    console.error("API ERROR:", err);
    let error = { ...err };
    error.message = err.message;

    //   Duplicate value error
    if (err.code === 11000) {
        error.statusCode = 400;
        error.message = "Duplicate value error";
    }
    // bad object id error
    if (err.name === "CastError") {
        const message = ` there is no data with id of ${err.value}`;
        error = new Error(message);
        error.statusCode = 404;
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "internal server error"
    });
}
export default globalErrorHandler