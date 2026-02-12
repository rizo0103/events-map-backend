const { db, admin } = require("../config/firebase");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const jwt_secret = process.env.JWT_SECRET;

async function registerUser(req, res) {
    const { username, password, role, fullName } = req.body;

    const counterRef = db.collection("ids").doc("ids");
    const userRef = db.collection('users').doc(username);

    try {
        const newUser = await db.runTransaction(async (transaction) => {
            // 1. Reading current id
            const counterDoc = await transaction.get(counterRef);
            if (!counterDoc.exists) {
                throw new Error("Counter doc was not found");
            }

            const currentId = counterDoc.data().users;
            const nextId = currentId + 1;

            // 2. Checking does this login already exist ?
            const userDoc = await transaction.get(userRef);
            if (userDoc.exists) {
                throw new Error("User with this login already exists");
            }

            // 3. Hashing the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // 4. Adding new user with numberic id
            transaction.set(userRef, {
                uid: nextId,
                username,
                password: hashedPassword,
                role: role || "guest",
                fullName,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // 5. Updating counter in ids collection
            transaction.update(counterRef, { users: nextId });

            return { username, uid: nextId };
        });

        res.json({ message: "User created", user: newUser });
    } catch (error) {
        console.error("Transaction error: ", error);
        res.status(400).json({ error: error.message });
    }
}

async function loginUser(req, res) {
    const { username, password } = req.body;

    try {
        // 1. Searching user in collection
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        // Checking does user exist
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User was not found" });
        }
        
        const userData = userDoc.data();

        // 2. Comparing passwords
        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // 3. Generating JWT token
        const token = jwt.sign(
            {
                uid: userData.uid,
                username: userData.username,
                role: userData.role
            },
            jwt_secret, { expiresIn: '48h' }
        );

        res.json({
            message: "Welcome !",
            token,
            user: {
                username: userData.username,
                fullName: userData.fullName,
                role: userData.role
            }
        });
    } catch (error) {
        console.error("Login error: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    registerUser,
    loginUser
}
