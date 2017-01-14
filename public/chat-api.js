/** Class implementing a simple chat api */
class ChatApi {
  /**
  * Create an instance of the chat api
  */
  constructor() {
    const config = {
      apiKey: "AIzaSyBYyQKaPkn3jgqD8eL7kSAOciWtRju8eU0",
      authDomain: "sytac-chat.firebaseapp.com",
      databaseURL: "https://sytac-chat.firebaseio.com",
      storageBucket: "sytac-chat.appspot.com",
      messagingSenderId: "468200739872"
    };

    firebase.initializeApp(config);
  }

  /**
  * isSignedIn returns whether or not the user is signed in
  * @returns {Boolean} True if the user signed in.
  */
  isSignedIn() {
    return Boolean(firebase.auth().currentUser);
  }

  /**
  * signIn triggers a popup in which the user can log in
  */
  signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  }

  /**
  * signOut clears all firebase related authentication state.
  */
  signOut() {
    firebase.auth().signOut();
  }

  /**
  * onAuth triggers a callback when a user is succesfully authenticated
  * @param {Object} user - the firebase user
  */
  onAuth(callback) {
    firebase.auth().onAuthStateChanged((user) => {
      this.updateLastOnline(user);
      callback(user);
    });
  }

  /**
  * updateLastOnline refreshes the time a user was last online
  * @param {Object} user - the firebase user
  */
  updateLastOnline(user) {
    if (user) {
      firebase.database().ref().child('/users/' + user.uid)
        .set({
          userName: user.displayName,
          lastOnline: firebase.database.ServerValue.TIMESTAMP
        });
    }
  }

  /**
  * post inserts a message in the database.
  * @param {Object} user - the firebase user
  * @param {string} message
  */
  post(user, message) {
    var newPostRef = firebase.database().ref('messages').push();
    newPostRef.set({
      user: user.uid,
      userName: user.displayName,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      message,
    });

    this.updateLastOnline(user);
  }

  /**
  * A message
  * @typedef {Object} Message
  * @property {string} user - the user id internal for firebase
  * @property {string} userName
  * @property {string} message
  * @property {number} timestamp
  */

  /**
  * onMessage triggers the callback when a new message arrives
  * @param {function} a callback function that receives a Message object
  * @returns {object} an object which contains an unSubscribe function.
  */
  onMessage(onNext) {
    const messagesRef = firebase.database().ref('messages');
    messagesRef.on('child_added', onNext);
    return {
      unSubscribe() {
        const messagesRef = firebase.database().ref('messages');
        messagesRef.off('child_added', onNext);
      }
    };
  }

 /**
 * A user - different than the firebase user
 * @typedef {Object} User
 * @property {string} userName
 * @property {number} lastOnline - a timestamp
 */

  /**
  * onUserChanges triggers the callback on changes in the users table
  * @param {function} a callback function that receives a user object
  * @returns {object} an object which contains an unSubscribe function.
  */
  onUserChanges(onNext) {
    const messagesRef = firebase.database().ref('users');
    messagesRef.on('child_added', onNext);
    messagesRef.on('child_changed', onNext);

    return {
      unSubscribe() {
        const messagesRef = firebase.database().ref('users');
        messagesRef.off('child_added', onNext);
        messagesRef.off('child_changed', onNext);
      }
    };
  }
}
