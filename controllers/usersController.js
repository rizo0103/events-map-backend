const { db } = require("../config/firebase");

async function getUsers(req, res) {
    try {
        const collectionRef = db.collection("users"),
            snapshot = await collectionRef.get();

        let users = [];
        snapshot.forEach((doc) => {
            users.push({ ...doc.data() });
        });

        // send without passwords

        users.map((user) => {
            delete user.password;
            return user;
        })

        return res.status(200).json({ users });
    } catch (error) {
        console.error("server error ", error);
        return res.status(500).json({ message: "Хатогии сервер" });
    }
}

module.exports = { getUsers }
