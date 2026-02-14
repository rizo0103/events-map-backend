const admin = require('firebase-admin');
const db = admin.firestore();

async function createEventType (req, res) {
    try {
        const { name, markerType, color, attributes } = req.body.name;
        const creatorRole = req.user.role;

        if (creatorRole !== "admin" && creatorRole !== "superadmin") {
            return res.status(403).json({ message: "У вас недостаточно прав" });
        }

        const idsRef = db.collection('ids').doc('ids');


        if (!name) {
            return res.status(400).json({ message: "Номи намуд ҳатмист!" });
        }

        if (!markerType) {
            return res.status(400).json({ message: "Намуди маркер ҳатмист!" });
        }

        const newId = await db.runTransaction(async (t) => {
            const idsDoc = await t.get(idsRef);

            // If there is no field for eventTypes create new one
            
            let currentId = 1;
            if (idsDoc.exists && idsDoc.data().eventTypesId) {
                currentId = idsDoc.data().eventTypesId + 1;
            }

            t.set(idsRef, { eventTypesId: currentId }, { merge: true });

            return currentId;
        })

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

module.exports = {
    createEventType,
    getEventTypes,
};
