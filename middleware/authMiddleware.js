const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token.req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, jwt_secret);

            req.user = decoded;

            next();
        } catch (error) {
            console.error("JWT Verification Error: ", error);
            return res.status(401).json({ message: "Invalid token" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Доступ запрещён, токен отсутсвует" });
    }
}

module.exports = { protect }
