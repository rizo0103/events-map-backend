const { db, admin } = require("../config/firebase");
const bcrypt = require('bcryptjs');

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

module.exports = {
    registerUser
}
