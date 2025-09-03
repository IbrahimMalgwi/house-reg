// pages/api/deleteAccount.js (if using Next.js API routes)
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../src/firebase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token } = req.body;

        // Verify the token and call the Cloud Function
        const deleteAccount = httpsCallable(functions, 'deleteUserAccount');
        const result = await deleteAccount({}, { headers: { Authorization: `Bearer ${token}` } });

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
}