const admin = require('firebase-admin');
const db = admin.firestore();

async function createEventType (req, res) {
    try {
        const { name, markerType, color, attributes } = req.body;
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

        return res.status(201).json({ mmessage: "Дохил шуд" });
    } catch (error) {
        console.error("server error ", error);
        res.status(500).json({ message: "Хатогии сервер" });
    }
}

module.exports = {
    createEventType,
};
