import generateToken from "./generateToken.js";
const sendTokenResponse = (user, statusCode, res) => {
    // Create JWT
    const token = generateToken(user._id, user.email);

    // Options for the cookie
    const options = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000  // 30 days
        ),
        httpOnly: true, // Cookie can't be accessed by client-side JS
    };

    // Add secure cookie in production
    if (process.env.NODE_ENV === "production") {
        options.secure = true;
    }

    // Send response with cookie
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        user
    });

};
export default sendTokenResponse;
