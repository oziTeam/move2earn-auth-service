const httpStatus = require('http-status');
const admin = require('firebase-admin');
// const firebase = require('firebase/app');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const serviceAccount = require('../../firebase-adminsdk-el9bk-dc68c909c7.json');

const { adminEmails } = config;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: 'https://sw-move2earn-app-f8519.firebaseio.com',
  databaseURL: config.firebaseAdminDB,
});

const getOrCreateUserClaim = catchAsync(async (req, res) => {
  const { uid } = req.body;
  const user = await admin.auth().getUser(uid);
  const creationTimestamp = new Date(user.metadata.creationTime).getTime();
  const lastSignInTimestamp = new Date(user.metadata.lastSignInTime).getTime();
  const isNewUser = creationTimestamp === lastSignInTimestamp;
  // eslint-disable-next-line no-console
  console.log('isNewUser', isNewUser);
  if (!isNewUser) return res.status(httpStatus.CREATED).send({ user });

  // const { user } = req.body;
  // eslint-disable-next-line no-console
  // console.log(user);

  // Check if user meets role criteria:
  // Your custom logic here: to decide what roles and other `x-hasura-*` should the user get
  let customClaims;
  if (user.email && adminEmails.includes(user.email)) {
    customClaims = {
      'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': 'admin',
        'x-hasura-allowed-roles': ['user', 'admin'],
        'x-hasura-user-id': user.uid,
      },
    };
    // eslint-disable-next-line no-console
    console.log('admin: ', customClaims);
  } else {
    customClaims = {
      'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': 'user',
        'x-hasura-allowed-roles': ['user'],
        'x-hasura-user-id': user.uid,
      },
    };
    // eslint-disable-next-line no-console
    console.log('user: ', customClaims);
  }

  // Set custom user claims on this newly created user.
  admin
    .auth()
    .setCustomUserClaims(user.uid, customClaims)
    .then(() => {
      // Update real-time database to notify client to force refresh.
      const metadataRef = admin.database().ref(`metadata/${user.uid}`);
      // Set the refresh time to the current UTC timestamp.
      // This will be captured on the client to force a token refresh.
      return metadataRef.set({ refreshTime: new Date().getTime() });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
  return res.status(httpStatus.CREATED).send({ user });
});

module.exports = {
  getOrCreateUserClaim,
};
