const { db, admin } = require("../config/firebase");
const bcrypt = require('bcryptjs');
const jwt_secret = process.env.JWT_SECRET;

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

async function deleteUser(req, res) {
    try {
        const { uid } = req.params;

        const collectionRef = db.collection("users");
        await collectionRef.doc(uid).delete();

        return res.status(200).json({ message: "Корбар нест карда шуд" });
    } catch (error) {
        console.error("server error ", error);
        return res.status(500).json({ message: "Хатогии сервер" });
    }
}

async function editUser(req, res) {
    try {
        const { uid } = req.params; // Числовой ID
        const { role, username, fullName, password } = req.body;

        // Ищем пользователя по числовому uid
        const userQuery = await db.collection("users").where("uid", "==", Number(uid)).get();
        
        if (userQuery.empty) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const oldUserDoc = userQuery.docs[0];
        const oldUsername = oldUserDoc.id; // Текущий ID документа (старый логин)
        const userData = oldUserDoc.data();

        await db.runTransaction(async (transaction) => {
            let finalPassword = userData.password;

            // 1. Если прислали новый пароль — хешируем его
            if (password && password.trim() !== "") {
                finalPassword = await bcrypt.hash(password, 10);
            }

            const updatePayload = {
                uid: Number(uid),
                role,
                username,
                fullName,
                password: finalPassword,
                updatedAt: admin.firestore.FieldValue.serverTimestamp() // Хорошим тоном будет добавить дату обновления
            };

            // 2. Если логин (ID документа) изменился
            if (username !== oldUsername) {
                const newUserRef = db.collection("users").doc(username);
                const checkNewUser = await transaction.get(newUserRef);
                
                if (checkNewUser.exists) {
                    throw new Error("Корбар бо ин логин аллакай ҳаст");
                }

                // Создаем новый документ и удаляем старый
                transaction.set(newUserRef, {
                    ...updatePayload,
                    createdAt: userData.createdAt // Сохраняем дату создания
                });
                transaction.delete(oldUserDoc.ref);
            } else {
                // 3. Если логин тот же — просто обновляем текущий документ
                transaction.update(oldUserDoc.ref, updatePayload);
            }
        });

        return res.status(200).json({ message: "Пользователь успешно отредактирован" });
    } catch (error) {
        console.error("server error ", error);
        return res.status(400).json({ message: error.message || "Хатогии сервер" });
    }
}

module.exports = { getUsers, deleteUser, editUser }
