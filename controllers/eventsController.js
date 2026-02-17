const { admin, db } = require('../config/firebase');
const { getNextId } = require('../utils/common');

async function createEventType (req, res) {
    try {
        const { name, markerType, color, attributes } = req.body.name;

        if (!["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "У вас недостаточно прав" });
        }
        
        if (!name) {
            return res.status(400).json({ message: "Номи намуд ҳатмист!" });
        }
        
        if (!markerType) {
            return res.status(400).json({ message: "Намуди маркер ҳатмист!" });
        }
        
        const newId = await getNextId('eventTypesId');

        const newType = {
            uid: newId,
            name,
            markerType,
            color,
            attributes: attributes || [],
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("eventTypes").doc(name).set(newType);

        return res.status(201).json({ message: "Дохил шуд" });
    } catch (error) {
        console.error("server error ", error);
        res.status(500).json({ message: "Хатогии сервер" });
    }
}

async function getEventTypes (req, res) {
    try {
        const userRole = req.user.role;

        if (userRole !== "superadmin" && userRole !== "admin") {
            return res.status(403).json({ message: "У вас недостаточно прав" });
        }

        const collectionRef = db.collection("eventTypes"),
            snapshot = await collectionRef.get();
        
        if (snapshot.empty) {
            console.log("Документ eventTypes ёфт нашуд.");
            return res.json({ message: "Документ eventTypes ёфт нашуд.", data: [] });
        }

        const documents = [];
        snapshot.forEach(doc => {
            documents.push(doc.data());
        });

        return res.status(200).json({ message: "Success", data: documents });
    } catch (error) {
        console.error("server error ", error);
        res.status(500).json({ message: "Хатогии сервер" });
    }
}

async function createEvent(req, res) {
    try {
        const { attributes, color, lat, lng, marker, type, typeId } = req.body; // Убрали .attributes
        
        // Проверка прав (можно вынести в отдельный middleware позже)
        if (!["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "У вас недостаточно прав" });
        }

        const newId = await getNextId('eventsId');

        const newEvent = {
            uid: newId,
            attributes: attributes || {},
            marker, color, type, typeId, lat, lng,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("events").doc(String(newId)).set(newEvent);
        return res.status(201).json({ message: "Дохил шуд", uid: newId });
    } catch (error) {
        console.error("server error ", error);
        res.status(500).json({ message: "Хатогии сервер" });
    }
}

// УДАЛЕНИЕ СОБЫТИЯ (Тот самый новый метод)
async function deleteEvent(req, res) {
    try {
        const { uid } = req.params; // Получаем ID из URL: /api/events/:uid

        if (!["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "Доступ запрещен" });
        }

        await db.collection("events").doc(String(uid)).delete();
        return res.status(200).json({ message: "Рӯйдод нест карда шуд" });
    } catch (error) {
        console.error("Delete error", error);
        res.status(500).json({ message: "Хатогӣ ҳангоми нест кардан" });
    }
}

async function getEvents (req, res) {
        try {
        const userRole = req.user.role;

        if (userRole !== "superadmin" && userRole !== "admin") {
            return res.status(403).json({ message: "У вас недостаточно прав" });
        }

        const collectionRef = db.collection("events"),
            snapshot = await collectionRef.get();
        
        if (snapshot.empty) {
            console.log("Документ events ёфт нашуд.");
            return res.json({ message: "Документ eventTypes ёфт нашуд.", data: [] });
        }

        const documents = [];
        snapshot.forEach(doc => {
            documents.push(doc.data());
        });

        return res.status(200).json({ message: "Success", data: documents });
    } catch (error) {
        console.error("server error ", error);
        res.status(500).json({ message: "Хатогии сервер" });
    }
}

module.exports = {
    createEventType,
    getEventTypes,
    createEvent,
    getEvents,
    deleteEvent
};
