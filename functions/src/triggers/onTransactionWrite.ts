import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * Balance Keeper Cloud Function
 *
 * Maintains account balance integrity by automatically updating
 * account balances when transactions are created, updated, or deleted.
 *
 * Trigger: onWrite to /users/{userId}/transactions/{transactionId}
 */
export const onTransactionWrite = functions
  .runWith({maxInstances: 10})
  .firestore.document("users/{userId}/transactions/{transactionId}")
  .onWrite(async (change, context) => {
    const {userId, transactionId} = context.params;
    const db = admin.firestore();

    const oldData = change.before.exists ? change.before.data() : null;
    const newData = change.after.exists ? change.after.data() : null;

    try {
      // 1. Handle Transaction Creation
      if (!oldData && newData) {
        await db.runTransaction(async (t) => {
          const accountRef = db.doc(
            `users/${userId}/accounts/${newData.accountId}`,
          );
          const accDoc = await t.get(accountRef);

          if (!accDoc.exists) {
            functions.logger.warn(
              `Account ${newData.accountId} not found for ` +
              `transaction ${transactionId}`,
            );
            return;
          }

          const currentBal = accDoc.data()?.currentBalance || 0;

          // Handle TRANSFER: deduct from source account
          if (newData.type === "TRANSFER") {
            t.update(accountRef, {
              currentBalance: currentBal - newData.amount,
            });

            // Add to destination account if toAccountId exists
            if (newData.toAccountId) {
              const toAccountRef = db.doc(
                `users/${userId}/accounts/${newData.toAccountId}`,
              );
              const toAccDoc = await t.get(toAccountRef);

              if (toAccDoc.exists) {
                const toBal = toAccDoc.data()?.currentBalance || 0;
                t.update(toAccountRef, {
                  currentBalance: toBal + newData.amount,
                });
              } else {
                functions.logger.warn(
                  `Destination account ${newData.toAccountId} not ` +
                  `found for transfer ${transactionId}`,
                );
              }
            }
          } else {
            // Income increases balance, Expense decreases balance
            const multiplier = newData.type === "INCOME" ? 1 : -1;
            t.update(accountRef, {
              currentBalance: currentBal + newData.amount * multiplier,
            });
          }
        });

        functions.logger.info(
          `Updated account balance for transaction ${transactionId}`,
        );
      } else if (oldData && !newData) {
        await db.runTransaction(async (t) => {
          const accountRef = db.doc(
            `users/${userId}/accounts/${oldData.accountId}`,
          );
          const accDoc = await t.get(accountRef);

          if (!accDoc.exists) {
            functions.logger.warn(
              `Account ${oldData.accountId} not found for ` +
              `deleted transaction ${transactionId}`,
            );
            return;
          }

          const currentBal = accDoc.data()?.currentBalance || 0;

          // Handle TRANSFER deletion: reverse both accounts
          if (oldData.type === "TRANSFER") {
            // Restore amount to source account
            t.update(accountRef, {
              currentBalance: currentBal + oldData.amount,
            });

            // Deduct from destination account if toAccountId exists
            if (oldData.toAccountId) {
              const toAccountRef = db.doc(
                `users/${userId}/accounts/${oldData.toAccountId}`,
              );
              const toAccDoc = await t.get(toAccountRef);

              if (toAccDoc.exists) {
                const toBal = toAccDoc.data()?.currentBalance || 0;
                t.update(toAccountRef, {
                  currentBalance: toBal - oldData.amount,
                });
              } else {
                functions.logger.warn(
                  `Destination account ${oldData.toAccountId} ` +
                  `not found for deleted transfer ${transactionId}`,
                );
              }
            }
          } else {
            // Reverse: Income decreases balance, Expense increases
            const multiplier = oldData.type === "INCOME" ? -1 : 1;
            t.update(accountRef, {
              currentBalance: currentBal + oldData.amount * multiplier,
            });
          }
        });

        functions.logger.info(
          `Reversed account balance for deleted transaction ${transactionId}`,
        );
      } else if (oldData && newData) {
        const oldAccountRef = db.doc(
          `users/${userId}/accounts/${oldData.accountId}`,
        );
        const newAccountRef = db.doc(
          `users/${userId}/accounts/${newData.accountId}`,
        );

        await db.runTransaction(async (t) => {
          // Reverse old transaction
          if (
            oldAccountRef.id !== newAccountRef.id ||
            oldData.amount !== newData.amount ||
            oldData.type !== newData.type
          ) {
            const oldAccDoc = await t.get(oldAccountRef);
            if (oldAccDoc.exists) {
              const oldBal = oldAccDoc.data()?.currentBalance || 0;
              // Reverse logic
              const oldMultiplier = oldData.type === "INCOME" ? -1 : 1;
              t.update(oldAccountRef, {
                currentBalance: oldBal + oldData.amount * oldMultiplier,
              });
            }
          }

          // Apply new transaction
          const newAccDoc = await t.get(newAccountRef);
          if (!newAccDoc.exists) {
            functions.logger.warn(
              `Account ${newData.accountId} not found for ` +
              `updated transaction ${transactionId}`,
            );
            return;
          }

          const newBal = newAccDoc.data()?.currentBalance || 0;
          const newMultiplier = newData.type === "INCOME" ? 1 : -1;
          t.update(newAccountRef, {
            currentBalance: newBal + newData.amount * newMultiplier,
          });
        });

        functions.logger.info(
          `Updated account balance(s) for updated transaction ${transactionId}`,
        );
      }
    } catch (error) {
      functions.logger.error(
        `Error updating account balance for transaction ${transactionId}:`,
        error,
      );
      throw error;
    }
  });

