const globalErrorHandler = (err, req, res, next) => {
    console.error("API ERROR:", err);
    try {
        let error = typeof err === 'object' && err !== null ? { ...err } : {};
        error.message = err?.message || (typeof err === 'string' ? err : "Unknown error");

        // Duplicate value error
        if (err?.code === 11000) {
            error.statusCode = 400;
            error.message = "Duplicate value error";
        }
        // bad object id error
        if (err?.name === "CastError") {
            const message = ` there is no data with id of ${err?.value}`;
            error.message = message;
            error.statusCode = 404;
        }

        if (!res.headersSent) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "internal server error",
                stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined
            });
        }
    } catch (fallbackErr) {
        console.error("ERROR IN ERROR HANDLER:", fallbackErr);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Critical internal server error" });
        }
    }
}
export default globalErrorHandler;
