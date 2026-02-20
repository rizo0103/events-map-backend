const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Если токен просрочен, jwt.verify выбросит исключение
            const decoded = jwt.verify(token, jwt_secret);

            req.user = decoded;
            return next(); // Обязательно return, чтобы код не шел дальше к проверке !token
        } catch (error) {
            console.error("JWT Error: ", error.name); // Посмотри в консоль, там будет TokenExpiredError
            
            // Если токен просто просрочен, фронтенд должен получить 401
            return res.status(401).json({ 
                message: "Token expired or invalid", 
                code: "TOKEN_EXPIRED" // Доп. код помогает фронту точнее реагировать
            });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Доступ запрещён, токен отсутствует" });
    }
};

module.exports = { protect };