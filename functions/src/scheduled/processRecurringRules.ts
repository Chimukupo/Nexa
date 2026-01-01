import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * Recurring Engine Cloud Function
 *
 * Processes recurring rules and creates transactions automatically.
 * Runs daily at 00:00 UTC to check for rules that need to be executed.
 *
 * Trigger: Scheduled function (Cloud Scheduler)
 */
export const processRecurringRules = functions
  .runWith({maxInstances: 10})
  .pubsub.schedule("0 0 * * *") // Daily at 00:00 UTC
  .timeZone("UTC")
  .onRun(async () => {
    const db = admin.firestore();
    const today = new Date();
    const currentDay = today.getDate();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      currentDay,
    );
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    functions.logger.info(
      `Processing recurring rules for day ${currentDay}`,
    );

    try {
      // Get all users
      const usersSnapshot = await db.collection("users").get();
      let totalProcessed = 0;
      let totalCreated = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        // Query recurring rules for this user where:
        // 1. cronExpressionOrDay matches current day
        // 2. lastRunDate is not today (prevent duplicates)
        const rulesSnapshot = await db
          .collection(`users/${userId}/recurring_rules`)
          .where("cronExpressionOrDay", "==", currentDay)
          .get();

        for (const ruleDoc of rulesSnapshot.docs) {
          const rule = ruleDoc.data();
          totalProcessed++;

          // Check if rule was already run today
          const lastRunDate = rule.lastRunDate ?
            rule.lastRunDate.toDate() :
            null;

          if (
            lastRunDate &&
            lastRunDate >= todayStart &&
            lastRunDate <= todayEnd
          ) {
            functions.logger.info(
              `Skipping rule ${ruleDoc.id} - already processed today`,
            );
            continue;
          }

          // Create transaction from rule
          const transactionData = {
            amount: rule.amount,
            type: rule.type,
            accountId: rule.accountId,
            categoryId: rule.categoryId,
            date: admin.firestore.Timestamp.now(),
            description: rule.name,
            isRecurring: true,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          };

          // Create transaction
          await db
            .collection(`users/${userId}/transactions`)
            .add(transactionData);

          // Update rule's lastRunDate
          await ruleDoc.ref.update({
            lastRunDate: admin.firestore.Timestamp.now(),
          });

          totalCreated++;
          functions.logger.info(
            `Created transaction for rule ${ruleDoc.id} (${rule.name})`,
          );
        }
      }

      functions.logger.info(
        `Recurring engine completed: ${totalCreated} transactions ` +
        `created from ${totalProcessed} rules processed`,
      );

      return {
        success: true,
        processed: totalProcessed,
        created: totalCreated,
      };
    } catch (error) {
      functions.logger.error("Error processing recurring rules:", error);
      throw error;
    }
  });

