const { db } = require("../config/firebase");
const jwt = require('jsonwebtoken');

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

async function generateTokens(user) {
    const accessToken = jwt.sign(
        { uid: user.uid, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { username: user.username },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}

module.exports = { getNextId, generateTokens }