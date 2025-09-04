// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;

  try {
    // Delete user data from Firestore
    const userRef = admin.firestore().collection("users").doc(userId);
    await userRef.delete();

    // Delete user's registrations
    const registrationsRef = admin.firestore()
      .collection("registrations")
      .where("userId", "==", userId);

    const snapshot = await registrationsRef.get();
    const batch = admin.firestore().batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Delete profile pictures from Storage
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({prefix: `profile-pictures/${userId}/`});

    const deletePromises = files.map((file) => file.delete());
    await Promise.all(deletePromises);

    // Delete auth user
    await admin.auth().deleteUser(userId);

    return {success: true, message: "Account deleted successfully"};
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw new functions.https.HttpsError("internal", "Error deleting account");
  }
});
