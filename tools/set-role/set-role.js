const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const ROLES = ["PLANNER", "EMERGENCY_SERVICES_MANAGER", "AUDITOR"];

const [uid, role] = process.argv.slice(2);
if (!uid || !ROLES.includes(role)) {
  console.error(`Usage: node set-role.js <uid> ${ROLES.join("|")}`);
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
getAuth()
  .setCustomUserClaims(uid, { role })
  .then(() => console.log("role set:", role))
  .catch((error) => {
    console.error("Could not set the role:", error.code || error.message);
    process.exit(1);
  });
