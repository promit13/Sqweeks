/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
// const stripeApiKey = "sk_test_SJdzllywBUuG3FQXnEDD3NE100p7OVEe8e";
const stripeApiKey = "sk_live_f8bCF4DzKJLkLYJeH3tQKRRp00xpdOoAab";
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const stripe = require("stripe")(stripeApiKey);

admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();

// sends notification to the other user when message is sent on chat
exports.onMessageSent = functions.https.onRequest((req, res) => {
  const {
    senderName,
    messagingToken,
    message,
    senderId,
    receiverId,
  } = req.body;
  console.log(messagingToken);
  const payload = {
    token: messagingToken,
    notification: {
      title: senderName,
      body: message,
    },
    data: {
      senderId,
      receiverId,
      messagingToken,
    },
  };
  admin
    .messaging()
    .send(payload)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => console.log("Error sending message:", error));
});

// sends notificaiton to the washer when booking is made
exports.onBookingCreate = functions.firestore
  .document("bookings/{request}")
  .onCreate((snap, context) => {
    const { request } = context.params;
    const data = snap.data();
    console.log("DATA", data);
    const { washerId } = data;

    // const db = admin.firestore();
    firestore
      .collection("users")
      .doc(washerId)
      .get()
      .then((washer) => {
        const { messagingToken } = washer.data();
        const payload = {
          token: messagingToken,
          notification: {
            title: "Car wash request",
            body: "You have one new wash request",
          },
        };
        admin
          .messaging()
          .send(payload)
          .then((response) => {
            console.log("Successfully sent message:", response);
          })
          .catch((error) => console.log("Error sending message:", error));
      })
      .catch((err) => console.log(err));
  });

// sends notification to the car washer when booking is cancelled
exports.onBookingDelete = functions.firestore
  .document("bookings/{removed}")
  .onDelete((snap, context) => {
    const { removed } = context.params;
    const data = snap.data();
    console.log("DATA", data);
    const { washerId, status, date, price, requestedBooking } = data;
    const todayDate = new Date().getTime();
    const hasToPay =
      date - todayDate < 172800000 && status === "accepted" && requestedBooking
        ? true
        : false;
    // const db = admin.firestore();
    if (hasToPay) {
      firestore
        .collection("users")
        .doc(washerId)
        .get()
        .then((washer) => {
          const { messagingToken } = washer.data();
          const payload = {
            token: messagingToken,
            notification: {
              title: "Booking cancelled",
              body: `You will be paid £${price / 2} as compensation.`,
            },
          };
          admin
            .messaging()
            .send(payload)
            .then((response) => {
              console.log("Successfully sent message:", response);
            })
            .catch((error) => console.log("Error sending message:", error));
        })
        .catch((err) => console.log(err));
    }
  });

// sends notification to the car owner when booking status changes
exports.onBookingUpdate = functions.firestore
  .document("bookings/{bookingId}")
  .onUpdate((change, context) => {
    const { before, after } = change;
    const { bookingId } = context.params;
    let title = "";
    if (after.get("status") === "accepted") {
      title = "Accepted";
      body = "Your car request has been accpeted";
    } else if (after.get("status") === "rejected") {
      title = "Rejected";
      body = "Your request has been rejected. Please try someone else.";
    } else if (after.get("status") === "completed") {
      title = "Car wash completed";
      body = "Please go to booking details and pay.";
    }

    if (before.get("started") !== after.get("started")) {
      title = "Car wash started";
      body = "You will receive notification once the wash is completed";
    }
    const ownerId = before.get("ownerId");
    console.log("BEFORE", ownerId);
    firestore
      .collection("users")
      .doc(ownerId)
      .get()
      .then((owner) => {
        const { messagingToken } = owner.data();
        const payload = {
          token: messagingToken,
          notification: {
            title,
            body,
          },
        };
        admin
          .messaging()
          .send(payload)
          .then((response) => {
            console.log("Successfully sent message:", response);
          })
          .catch((error) => console.log("Error sending message:", error));
      })
      .catch((err) => console.log(err));
  });

// makes payment to stripe
exports.onMakePayment = functions.https.onRequest((req, res) => {
  const {
    amount,
    currency,
    customerId,
    description,
    bookingId,
    email,
    washerId,
  } = req.body;
  return stripe.charges
    .create({
      amount,
      currency,
      customer: customerId,
      description,
      receipt_email: email,
      metadata: { washerId, bookingId },
    })
    .then((result) => {
      return res.send(result);
    })
    .catch((err) => {
      console.log(err);
      return res.send(err);
    });
});

// sends notification to car washer when CRB check is approved
exports.onCRBcheckApproved = functions.firestore
  .document("users/{userId}")
  .onUpdate((change, context) => {
    const { before, after } = change;
    const { userId } = context.params;
    console.log(userId);

    if (before.get("crbApproved") !== after.get("crbApproved")) {
      const messagingToken = before.get("messagingToken");
      console.log(messagingToken);
      const payload = {
        token: messagingToken,
        notification: {
          title: "Your CRB is approved.",
          body: "Please login in app to continue.",
        },
      };
      admin
        .messaging()
        .send(payload)
        .then((response) => {
          console.log("Successfully sent message:", response);
        })
        .catch((error) => console.log("Error sending message:", error));
    }
  });

// creates or updates stripe customer id and updates customer id in firebase database
exports.onCreateUpdateCustomer = functions.https.onRequest((req, res) => {
  const { token, userId, cardLastFourDigit } = req.body;
  console.log(req.body);
  firestore
    .collection("users")
    .doc(userId)
    .get()
    .then((response) => {
      const { email, fullName, location, customerId } = response.data();
      const { city, postcode, formatted_address, street, houseName } = location;
      if (customerId) {
        stripe.customers.update(
          customerId,
          {
            source: token,
          },
          (error, updatedCustomer) => {
            if (error) {
              console.log("UPDATED", err);
              return res.send(err);
            }
            console.log("UPDATED", updatedCustomer);
            firestore
              .collection("users")
              .doc(userId)
              .update({
                cardLastFourDigit,
              })
              .then(() => {
                res.send(updatedCustomer);
              })
              .catch((errr) => {
                console.log(errr);
                res.send(errr);
              });
            // asynchronously called
          }
        );
      } else {
        stripe.customers.create(
          {
            email,
            name: fullName,
            address: {
              line1: `${houseName} ${street}`,
              line2: formatted_address,
              city,
              postal_code: postcode,
            },
            source: token,
          },
          (err, customer) => {
            if (err) {
              console.log("CREATED", err);
              return res.send(err);
            }
            console.log("CREATED", customer);
            firestore
              .collection("users")
              .doc(userId)
              .update({
                customerId: customer.id,
                cardRegistered: true,
                cardLastFourDigit,
              })
              .then(() => {
                res.send(customer);
              })
              .catch((errr) => {
                console.log(errr);
                res.send(errr);
              });
          }
        );
      }
    })
    .catch((e) => {
      res.send(e);
      console.log(e);
    });
});
