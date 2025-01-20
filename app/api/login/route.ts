import { NextResponse } from "next/server";
import { validateTelegramWebAppData } from "@/utils/telegramAuth";
import { db, auth } from "@/utils/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const { initData } = await request.json();

    // Validate Telegram init data
    const validationResult = validateTelegramWebAppData(initData);

    if (!validationResult.validatedData || !validationResult.user.id) {
      return NextResponse.json(
        { message: validationResult.message },
        { status: 401 }
      );
    }

    const telegramId = validationResult.user.id;
    const startParam = validationResult.startParam;
    const email = `telegram${telegramId}@telegram.com`;
    console.log("Refferer ID", startParam);

    // Custom claims for Firebase
    const customClaims = {
      telegramId: telegramId,
    };

    // Get or create Firebase user
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
    } catch (error) {
      const docRef = db.collection("users").doc(telegramId.toString());
      const docSnapshot = await docRef.get();
      firebaseUser = await auth.createUser({
        email: email,
        emailVerified: true,
        displayName: telegramId.toString(),
      });

      if (!docSnapshot.exists) {
        await docRef.set({
          firstName: validationResult.user.first_name,
          lastName: validationResult.user.last_name || "",
          id: validationResult.user.id,
          username: validationResult.user.username || "",
          balance: 10000,
          referrals: 0,
        });

        //Referral Logic
        if (startParam && startParam?.length > 4) {
          const reffererDocRef = db.collection("users").doc(startParam);
          const reffererFocSnapshot = await reffererDocRef.get();
          if (reffererFocSnapshot.exists) {
            await db.runTransaction(async (transaction) => {
              transaction.update(reffererDocRef, {
                balance: FieldValue.increment(500),
                referrals: FieldValue.increment(1),
              });
            });
          }
        }
      }
    }

    // Assign custom claims
    await auth.setCustomUserClaims(firebaseUser.uid, customClaims);

    // Create custom token
    const customToken = await auth.createCustomToken(
      firebaseUser.uid,
      customClaims
    );

    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}
