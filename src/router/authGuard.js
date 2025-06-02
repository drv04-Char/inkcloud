import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref as dbRef, get } from 'firebase/database';

export function requireAuth({ admin = false } = {}) {
    return async (to, from, next) => {
        const auth = getAuth();

        const waitForUser = () =>
            new Promise((resolve, reject) => {
                const unsub = onAuthStateChanged(
                    auth,
                    user => {
                        unsub();
                        resolve(user);
                    },
                    reject
                );
            });

        try {
            const user = await waitForUser();
            if (!user) return next('/');

            if (admin) {
                const db = getDatabase();
                const userRef = dbRef(db, `Usuarios/${user.uid}`); // ← comillas invertidas
                const snapshot = await get(userRef);

                if (!snapshot.exists() || snapshot.val().tipoUsuario !== 'admin') {
                    return next('/');
                }
            }

            // ✅ Todo bien
            next();
        } catch (err) {
            console.error('Auth guard error:', err);
            next('/');
        }
    };
}
