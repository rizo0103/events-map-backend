const { db } = require("../config/firebase")

async function getNextId(counterField) {
    const idsRef =  db.collection('ids').doc('ids');

    return await db.runTransaction(async t => {
        const idsDoc = await t.get(idsRef);
        let currentId = 1;

        if (idsDoc.exists && idsDoc.data()[counterField]) {
            currentId = idsDoc.data()[counterField] + 1;
        }

        t.set(idsRef, { [counterField]: currentId }, { merge: true });

        return currentId;
    });
}

module.exports = { getNextId }